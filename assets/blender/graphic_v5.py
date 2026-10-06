"""Isolated V5 studio. Full-shoe projection fit, never a cropped macro."""
from pathlib import Path
import math
import bpy
import numpy as np
from mathutils import Vector, Matrix

ROOT = Path('/home/sss/AI-Home/projects/vanta-landing')
SCENE = 'VANTA-Graphic-v5'
SOURCE = 'https://www.meshy.ai/3d-models/Chunky-Y2K-sneakers-white-color-with-colorful-accents-kawaiinanime-streetwear-019f3884-3869-7cc7-a6fc-3ba13de09104'
SHOTS = {
    'hero': (-.32, -.65, .34), 'profile': (0, -.7, .22),
    'sakura': (-.25, -.65, .30), 'lagoon': (-.25, -.65, .30),
    'citrus': (-.25, -.65, .30),
    'detail-upper': (-.35, -.65, .40),
    'detail-heel': (.55, -.55, .34), 'detail-sole': (0, -.70, .17),
    'campaign': (-.38, -.85, .62),
}

def point(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

def setup():
    s = bpy.data.scenes[SCENE]
    bpy.context.window.scene = s
    shoe = bpy.data.objects['GEO-V5-Shoe']
    if shoe.get('prepared'): raise RuntimeError('Already prepared')
    shoe.data.transform(Matrix.Rotation(math.pi, 4, 'Z'))
    base = shoe.data.materials[0]
    base.name = 'MAT-V5-Sakura'
    bsdf = next(n for n in base.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    tex = bsdf.inputs['Base Color'].links[0].from_node
    assert tex.type == 'TEX_IMAGE'
    # Permute only color channels: preserve white, luminance detail and graphic masks.
    for name, order in [('Lagoon', (2, 0, 1)), ('Citrus', (1, 2, 0))]:
        mat = base.copy(); mat.name = 'MAT-V5-' + name
        shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        texture = shader.inputs['Base Color'].links[0].from_node
        img = texture.image.copy(); img.name = 'TEX-V5-' + name
        pixels = np.empty(len(img.pixels), dtype=np.float32)
        img.pixels.foreach_get(pixels)
        rgba = pixels.reshape(-1, 4)
        rgba[:, :3] = rgba[:, order].copy()
        img.pixels.foreach_set(pixels); img.pack(); texture.image = img
        shoe.data.materials.append(mat)
    shoe['prepared'] = True; shoe['source_url'] = SOURCE
    shoe['source_creator'] = 'whitney'; shoe['license'] = 'CC0'
    pair = shoe.copy(); pair.data = shoe.data.copy(); pair.name = 'GEO-V5-Pair'
    s.collection.objects.link(pair); pair.hide_render = True
    old = bpy.data.scenes['VANTA-Sourced-v4']
    for obj in old.objects:
        if obj.name.startswith('GEO-V4-Set-'):
            n = obj.copy(); n.data = obj.data.copy()
            n.name = obj.name.replace('V4', 'V5'); s.collection.objects.link(n)
            n.hide_render = True
    s.render.resolution_percentage = 100
    s.cycles.use_denoising = True

def fit(s, objects, fraction=.80):
    """Fit projected vertices with >=10% breathing room on every edge."""
    bpy.context.view_layer.update()
    rotation = s.camera.rotation_euler.to_matrix()
    right, up = rotation @ Vector((1,0,0)), rotation @ Vector((0,1,0))
    pts = [o.matrix_world @ v.co for o in objects for v in o.data.vertices]
    xs, ys = [p.dot(right) for p in pts], [p.dot(up) for p in pts]
    s.camera.location += right * ((min(xs)+max(xs))/2 - s.camera.location.dot(right))
    s.camera.location += up * ((min(ys)+max(ys))/2 - s.camera.location.dot(up))
    aspect = s.render.resolution_x / s.render.resolution_y
    s.camera.data.ortho_scale = max(max(xs)-min(xs), (max(ys)-min(ys))*aspect)/fraction

def render(name, draft=False):
    s = bpy.data.scenes[SCENE]; bpy.context.window.scene = s
    shoe = bpy.data.objects['GEO-V5-Shoe']; pair = bpy.data.objects['GEO-V5-Pair']
    idx = {'lagoon': 1, 'citrus': 2}.get(name, 0)
    for p in shoe.data.polygons: p.material_index = idx
    campaign = name == 'campaign'
    for obj in s.objects:
        if obj.name.startswith('GEO-V5-Set-'): obj.hide_render = not campaign
    pair.hide_render = not campaign
    pair.location = (.11, .24, shoe.location.z + .10)
    pair.rotation_euler = (0, 0, math.radians(160))
    s.render.resolution_x = 1200 if name.startswith('detail-') else 1600 if campaign else 1800
    s.render.resolution_y = 1500 if campaign else 1200
    s.render.resolution_percentage = 50 if draft else 100
    s.camera.location = SHOTS[name]; point(s.camera, (0, 0, .07))
    fit(s, [shoe, pair] if campaign else [shoe])
    s.render.film_transparent = not campaign
    s.cycles.samples = 20 if draft else 64
    s.render.filepath = str(ROOT / 'public/images' / f'{name}-v5.png')
    bpy.ops.render.render(write_still=True)
    print('V5_RENDER', name)

def export():
    s = bpy.data.scenes[SCENE]; bpy.context.window.scene = s
    shoe = bpy.data.objects['GEO-V5-Shoe']
    for p in shoe.data.polygons: p.material_index = 0
    for o in s.objects: o.select_set(False)
    shoe.hide_set(False); shoe.select_set(True); bpy.context.view_layer.objects.active = shoe
    bpy.ops.export_scene.gltf(filepath=str(ROOT / 'public/models/form-01-v5.glb'),
        use_selection=True, use_active_scene=True, export_apply=True,
        export_animations=False, export_cameras=False, export_lights=False,
        export_extras=True, export_image_format='JPEG', export_jpeg_quality=95)
    bpy.data.libraries.write(str(ROOT / 'assets/blender/graphic-v5.blend'), {s}, fake_user=True)
