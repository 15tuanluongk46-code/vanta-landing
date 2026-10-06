"""Render three closeups from the existing VANTA scene, restoring camera state."""
import bpy
from mathutils import Vector

scene = bpy.data.scenes[globals().get('SCENE_NAME', 'VANTA-Campaign-v2')]
camera = scene.camera
saved = (camera.matrix_world.copy(), camera.data.ortho_scale,
         scene.render.resolution_x, scene.render.resolution_y, scene.render.filepath)
shots = [
    ('upper', (-.17, -.28, .23), (-.045, -.005, .068), .19),
    ('heel', (.33, -.27, .18), (.105, 0, .078), .155),
    ('sole', (-.10, -.38, .075), (-.015, 0, .023), .23),
]
try:
    scene.render.resolution_x = 1000
    scene.render.resolution_y = 800
    for name, position, target, scale in shots:
        camera.location = position
        camera.rotation_euler = (Vector(target) - camera.location).to_track_quat('-Z', 'Y').to_euler()
        camera.data.ortho_scale = scale
        scene.render.filepath = '/home/sss/AI-Home/projects/vanta-landing/public/images/detail-' + name + '.png'
        bpy.ops.render.render(write_still=True, scene=scene.name)
        print('Rendered', scene.render.filepath)
finally:
    camera.matrix_world, camera.data.ortho_scale = saved[:2]
    scene.render.resolution_x, scene.render.resolution_y, scene.render.filepath = saved[2:]
