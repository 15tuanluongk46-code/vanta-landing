"""V4 studio set using the downloaded CC0 White Sneaker by mikepouch.

Run setup() once in the VANTA-Sourced-v4 comparison scene, then render(name).
The source GLB and other scenes stay intact. No main-file save is performed.
"""
from pathlib import Path
import math
import bpy
import numpy as np
from mathutils import Matrix, Vector

ROOT = Path('/home/sss/AI-Home/projects/vanta-landing')
SCENE = 'VANTA-Sourced-v4'
SHOTS = {
    'hero': ((-.25, -.62, .30), (0, 0, .065), .385),
    'profile': ((0, -.65, .18), (0, 0, .064), .365),
    'chalk': ((-.23, -.62, .27), (0, 0, .065), .385),
    'carbon': ((-.23, -.62, .27), (0, 0, .065), .385),
    'clay': ((-.23, -.62, .27), (0, 0, .065), .385),
    'detail-upper': ((-.18, -.35, .39), (-.035, 0, .067), .185),
    'detail-heel': ((.40, -.36, .23), (.104, 0, .073), .17),
    'detail-sole': ((-.18, -.50, .065), (-.045, -.015, .024), .185),
    'campaign': ((-.60, -.95, .62), (0, 0, .12), .57),
}


def point(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


def setup():
    scene = bpy.data.scenes[SCENE]
    bpy.context.window.scene = scene
    shoe = bpy.data.objects['GEO-V4-White']
    if shoe.get('v4_prepared'):
        raise RuntimeError('Already prepared; use render()')
    shoe.data.transform(Matrix.Rotation(math.pi, 4, 'Z'))
    bpy.data.objects['GEO-V4-Sand'].hide_render = True
    bpy.data.objects['GEO-V4-Sand'].hide_set(True)
    base = shoe.data.materials[0]
    base.name = 'MAT-V4-Chalk'
    for color, tint in [('Carbon', (.10, .12, .15)), ('Clay', (.48, .27, .15))]:
        mat = base.copy()
        mat.name = 'MAT-V4-' + color
        tex = next(n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE')
        image = tex.image.copy()
        image.name = 'TEX-V4-' + color
        pixels = np.empty(len(image.pixels), dtype=np.float32)
        image.pixels.foreach_get(pixels)
        pixels.reshape(-1, 4)[:, :3] *= np.array(tint)
        image.pixels.foreach_set(pixels)
        image.pack()
        tex.image = image
        shoe.data.materials.append(mat)
    shoe['v4_prepared'] = True
    shoe['source_url'] = 'https://www.meshy.ai/3d-models/White-Sneaker-v2-019571e5-26b4-77c1-a348-bc018bed9662'
    shoe['source_creator'] = 'mikepouch'
    shoe['license'] = 'CC0'
    for name, loc, power, size in [
        ('key', (-.30, -.30, .48), 12, .34),
        ('fill', (.30, -.12, .22), 3, .30),
        ('rim', (.12, .32, .36), 10, .27),
    ]:
        lamp = bpy.data.objects['LGT-V4-' + name]
        lamp.location = loc
        lamp.data.energy = power
        lamp.data.size = size
        point(lamp, (0, 0, .06))
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.resolution_percentage = 100
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.world.color = (.15, .15, .15)
    pair = shoe.copy()
    pair.data = shoe.data.copy()
    pair.name = 'GEO-V4-Pair'
    scene.collection.objects.link(pair)
    pair.hide_render = True
    # Architectural plinths and backdrop for the campaign frame only.
    mat = bpy.data.materials.new('MAT-V4-Set')
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (.47, .10, .032, 1)
    shader.inputs['Roughness'].default_value = .82
    for name, loc, size in [
        ('floor', (0, 0, -.13), (200, 200, .04)),
        ('plinth', (0, 0, -.045), (.39, .26, .09)),
        ('back-plinth', (.10, .22, .006), (.32, .23, .19)),
    ]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        obj = bpy.context.object
        obj.name = 'GEO-V4-Set-' + name
        obj.scale = size
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.data.materials.append(mat)
        bevel = obj.modifiers.new('Soft edges', 'BEVEL')
        bevel.width = .002
        bevel.segments = 3
        obj.hide_render = True
    bpy.context.view_layer.update()


def render(name, draft=False):
    scene = bpy.data.scenes[SCENE]
    bpy.context.window.scene = scene
    shoe = bpy.data.objects['GEO-V4-White']
    shoe.location.x = shoe.location.y = 0
    shoe.rotation_euler = (0, 0, 0)
    idx = {'carbon': 1, 'clay': 2}.get(name, 0)
    for face in shoe.data.polygons:
        z = sum(shoe.data.vertices[i].co.z for i in face.vertices) / len(face.vertices) + shoe.location.z
        face.material_index = idx if z > .027 else 0
    campaign = name == 'campaign'
    for obj in scene.objects:
        if obj.name.startswith('GEO-V4-Set-'):
            obj.hide_render = not campaign
    pair = bpy.data.objects['GEO-V4-Pair']
    pair.hide_render = not campaign
    pair.location = (.10, .23, shoe.location.z + .10)
    pair.rotation_euler = (0, 0, math.radians(164))
    loc, target, scale = SHOTS[name]
    scene.camera.location = loc
    point(scene.camera, target)
    scene.camera.data.ortho_scale = scale
    scene.render.film_transparent = not campaign
    square = name.startswith('detail-')
    scene.render.resolution_x = 1200 if square else 1600 if campaign else 1800
    scene.render.resolution_y = 1200 if not campaign else 1500
    scene.render.resolution_percentage = 50 if draft else 100
    scene.cycles.samples = 24 if draft else 96
    scene.render.filepath = str(ROOT / 'public/images' / f'{name}-v4.png')
    bpy.ops.render.render(write_still=True)
    print('V4_RENDER', name, scene.render.filepath)


def save():
    scene = bpy.data.scenes[SCENE]
    bpy.data.libraries.write(str(ROOT / 'assets/blender/sourced-v4.blend'), {scene}, fake_user=True)
