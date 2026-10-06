"""Scoped FORM 01 macro refinement. Keeps both previous scenes intact.

Run build() once, then render(name). Rendering never changes the user's file.
Dimensions are design dimensions in metres, not manufacturing claims.
"""
import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path('/home/sss/AI-Home/projects/vanta-landing')
SCENE = 'VANTA-Detail-v3'


def geometry(name, vertices, faces, material):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.data.scenes[SCENE].collection.objects.link(obj)
    data.materials.append(material)
    for face in data.polygons:
        face.use_smooth = True
    return obj


def strand(vertices, faces, points, width, depth):
    """Append a closed, 12-sided flattened strand to a shared mesh."""
    start = len(vertices)
    for i, point in enumerate(points):
        tangent = (points[min(i + 1, len(points) - 1)] - points[max(0, i - 1)]).normalized()
        normal = tangent.cross(Vector((0, 0, 1)))
        if normal.length < .001:
            normal = tangent.cross(Vector((0, 1, 0)))
        normal.normalize()
        binormal = tangent.cross(normal).normalized()
        for j in range(12):
            angle = j * math.tau / 12
            vertices.append(point + normal * math.cos(angle) * width + binormal * math.sin(angle) * depth)
    for i in range(len(points) - 1):
        for j in range(12):
            a = start + i * 12 + j
            b = start + i * 12 + (j + 1) % 12
            faces.append((a, b, b + 12, a + 12))
    faces.extend([tuple(start + j for j in reversed(range(12))),
                  tuple(start + (len(points) - 1) * 12 + j for j in range(12))])


def centerline(obj):
    verts = obj.data.vertices
    return [sum((v.co for v in verts[i:i + 8]), Vector()) / 8 for i in range(0, len(verts), 8)]


def build():
    if bpy.data.scenes.get(SCENE):
        raise RuntimeError('V3 already exists; refusing to overwrite it')
    source = bpy.data.scenes['VANTA-Campaign-v2']
    scene = bpy.data.scenes.new(SCENE)
    materials = {}
    for old in source.objects:
        if '-pair' in old.name or old.name.startswith('VANTA2-'):
            continue
        obj = old.copy()
        obj.name = old.name.replace('VANTA2-', 'VANTA3-')
        if old.data:
            obj.data = old.data.copy()
        scene.collection.objects.link(obj)
        obj.hide_render = False
        if obj.type == 'MESH':
            for slot in obj.material_slots:
                original = slot.material
                if original.name not in materials:
                    mat = original.copy()
                    mat.name = original.name.replace('VANTA2-', 'VANTA3-')
                    materials[original.name] = mat
                slot.material = materials[original.name]
        if old == source.camera:
            scene.camera = obj
    bpy.context.window.scene = scene
    scene.world = source.world.copy()
    scene.render.engine = source.render.engine
    scene.view_settings.view_transform = source.view_settings.view_transform
    scene.render.image_settings.file_format = source.render.image_settings.file_format
    scene.render.image_settings.color_mode = source.render.image_settings.color_mode
    scene.render.film_transparent = True
    scene.render.resolution_percentage = 100
    # The previous continuous white piping read as plastic at macro scale.
    stitch_vertices, stitch_faces = [], []
    thread = bpy.data.materials['MAT-VANTA3-lace'].copy()
    thread.name = 'MAT-VANTA3-thread'
    shader = next(n for n in thread.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (.46, .42, .34, 1)
    shader.inputs['Roughness'].default_value = .95
    for obj in list(scene.objects):
        if obj.type != 'MESH':
            continue
        if '-seam' in obj.name:
            pts = centerline(obj)
            for a, b in zip(pts[:-1], pts[1:]):
                length = (b - a).length
                divisions = max(1, round(length / .0024))
                for j in range(divisions):
                    p = a.lerp(b, (j + .12) / divisions) + Vector((0, 0, .00022))
                    q = a.lerp(b, (j + .72) / divisions) + Vector((0, 0, .00022))
                    strand(stitch_vertices, stitch_faces, [p, q], .00016, .00012)
            bpy.data.objects.remove(obj, do_unlink=True)
        elif '-lace-' in obj.name:
            pts = centerline(obj)
            vertices, faces = [], []
            strand(vertices, faces, pts, .0020, .00065)
            geometry(obj.name + '-woven', vertices, faces, obj.data.materials[0])
            bpy.data.objects.remove(obj, do_unlink=True)
        elif any(token in obj.name for token in ('toe-guard', 'heel-counter', 'quarter', 'eyestay', 'signature', 'tongue')):
            solid = obj.modifiers.new('Cut leather edge', 'SOLIDIFY')
            solid.thickness = .0008
            solid.offset = 0
            bevel = obj.modifiers.new('Soft edge radius', 'BEVEL')
            bevel.width = .00025
            bevel.segments = 3
    geometry('GEO-VANTA3-discrete-stitches', stitch_vertices, stitch_faces, thread)
    # A bent woven ribbon replaces the angular four-point tube pull tab.
    old_tab = scene.objects.get('GEO-VANTA3-heel-tab')
    if old_tab:
        bpy.data.objects.remove(old_tab, do_unlink=True)
    vertices, faces = [], []
    for i in range(49):
        a = math.pi * i / 48
        x = .136 + .016 * math.sin(a)
        z = .116 + .031 * math.sin(a) + .002 * math.cos(a)
        center_y = -.002 + .007 * math.cos(a)
        for side in (-1, 1):
            vertices.append((x, center_y + side * .0045, z))
        if i:
            faces.append((2*i-2, 2*i-1, 2*i+1, 2*i))
    tab = geometry('GEO-VANTA3-woven-heel-tab', vertices, faces, bpy.data.materials['MAT-VANTA3-accent'])
    solid = tab.modifiers.new('Woven ribbon thickness', 'SOLIDIFY')
    solid.thickness = .0008
    sub = tab.modifiers.new('Ribbon smoothing', 'SUBSURF')
    sub.levels = 2
    sub.render_levels = 2
    for mat in materials.values():
        shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        shader.inputs['Roughness'].default_value = .9 if mat.name.endswith(('panel', 'lace', 'accent')) else .65
        shader.inputs['Specular IOR Level'].default_value = .27
        # A subtle, fine grain. It must not look like craters or coarse foam.
        for node in mat.node_tree.nodes:
            if node.type == 'BUMP':
                node.inputs['Strength'].default_value = .23
                node.inputs['Distance'].default_value = .00016 if mat.name.endswith('panel') else .00008
    for obj in scene.objects:
        if obj.type == 'LIGHT':
            obj.data.energy = 11 if 'key' in obj.name else 3 if 'fill' in obj.name else 9
            obj.data.size = .23 if 'key' in obj.name else .30
    scene['revision'] = 'V3: thick panel edges, discrete stitches, flat laces, ribbon heel tab'
    bpy.data.libraries.write(str(ROOT / 'assets/blender/form-01-v3.blend'), {scene})
    print({'scene': scene.name, 'objects': len(scene.objects), 'stitch_vertices': len(stitch_vertices)})


SHOTS = {
    'upper': ((-.20, -.32, .27), (-.056, -.014, .083), .205),
    'heel': ((.37, -.27, .21), (.107, 0, .108), .183),
    'sole': ((-.16, -.48, .094), (-.038, -.005, .039), .240),
    'profile': ((-.025, -.60, .135), (0, 0, .072), .375),
    'hero': ((-.20, -.65, .22), (0, 0, .073), .39),
}


def render(name):
    scene = bpy.data.scenes[SCENE]
    bpy.context.window.scene = scene
    location, target, scale = SHOTS[name]
    scene.camera.location = location
    scene.camera.rotation_euler = (Vector(target) - scene.camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera.data.ortho_scale = scale
    macro = name in ('upper', 'heel', 'sole')
    scene.render.resolution_x = 1200 if macro else 1800
    scene.render.resolution_y = 1200
    scene.render.filepath = str(ROOT / f'public/images/{"detail-" if macro else ""}{name}-v3.png')
    bpy.ops.render.render(write_still=True)
    print(scene.render.filepath)
