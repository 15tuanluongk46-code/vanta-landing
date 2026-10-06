"""V2 look development. Copy VANTA only; preserve the original master."""
import bpy
from mathutils import Vector
from pathlib import Path
ROOT = Path('/home/sss/AI-Home/projects/vanta-landing')

def build():
    source = bpy.data.scenes['VANTA-FORM01']
    scene = bpy.data.scenes.new('VANTA-Campaign-v2')
    materials = {}
    for old in source.objects:
        obj = old.copy()
        if old.data:
            obj.data = old.data.copy()
        scene.collection.objects.link(obj)
        obj.name = old.name.replace('VANTA-', 'VANTA2-')
        if obj.type == 'MESH':
            for slot in obj.material_slots:
                name = slot.material.name
                if name not in materials:
                    materials[name] = slot.material.copy()
                    materials[name].name = name.replace('VANTA-', 'VANTA2-')
                slot.material = materials[name]
        if old == source.camera:
            scene.camera = obj
    bpy.context.window.scene = scene
    scene.world = source.world.copy()
    scene.render.engine = source.render.engine
    scene.render.film_transparent = True
    scene.render.resolution_x = 1800
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    for key, mat in materials.items():
        nodes, links = mat.node_tree.nodes, mat.node_tree.links
        bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')
        suede = key.endswith('panel')
        bsdf.inputs['Roughness'].default_value = .92 if suede else .68
        bsdf.inputs['Specular IOR Level'].default_value = .22
        bsdf.inputs['Sheen Weight'].default_value = .25 if suede else .08
        noise = nodes.new('ShaderNodeTexNoise')
        noise.noise_dimensions = '3D'
        noise.inputs['Scale'].default_value = 185 if suede else 280
        noise.inputs['Detail'].default_value = 2
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .35 if suede else .18
        bump.inputs['Distance'].default_value = .00035 if suede else .00013
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    background = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
    background.inputs['Strength'].default_value = .28
    for obj in scene.objects:
        if obj.type == 'LIGHT':
            obj.data.energy = 9 if 'key' in obj.name else 2 if 'fill' in obj.name else 6
            obj.data.size = .35 if 'key' in obj.name else .25
    camera = scene.camera
    camera.location = (-.20, -.65, .22)
    camera.rotation_euler = (Vector((0, 0, .073)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.ortho_scale = .39
    scene.render.filepath = str(ROOT / 'public/images/hero-v2.png')
    bpy.ops.render.render(write_still=True)
    bpy.data.libraries.write(str(ROOT / 'assets/blender/form-01-v2.blend'), {scene})
    print('V2 hero rendered; original scene retained')

def campaign():
    scene = bpy.data.scenes['VANTA-Campaign-v2']
    bpy.context.window.scene = scene
    for original in [o for o in scene.objects if o.type == 'MESH']:
        pair = original.copy()
        pair.name = original.name + '-pair'
        scene.collection.objects.link(pair)
        pair.location = (.055, .145, .033)
        pair.rotation_euler[2] = -.24
    def block(name, center, size, color):
        x,y,z = (v/2 for v in size)
        verts = [(a*x,b*y,c*z) for a,b,c in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(verts, [], [(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)])
        obj = bpy.data.objects.new(name, mesh)
        scene.collection.objects.link(obj)
        obj.location = center
        mat = bpy.data.materials.new(name + '-material')
        mat.use_nodes = True
        shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        shader.inputs['Base Color'].default_value = (*color, 1)
        shader.inputs['Roughness'].default_value = .9
        mesh.materials.append(mat)
    block('VANTA2-plinth', (0,0,-.035), (.44,.17,.07), (.58,.17,.055))
    block('VANTA2-step', (.06,.20,-.018), (.49,.24,.103), (.40,.11,.034))
    block('VANTA2-floor', (0,0,-.09), (200,200,.03), (.28,.075,.024))
    scene.render.film_transparent = False
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1300
    camera = scene.camera
    camera.location = (-.40,-.63,.38)
    camera.rotation_euler = (Vector((.005,.06,.04)) - camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale = .62
    scene.render.filepath = str(ROOT / 'public/images/campaign-v2.png')
    bpy.ops.render.render(write_still=True)
    bpy.data.libraries.write(str(ROOT / 'assets/blender/campaign-v2.blend'), {scene})
    print('Campaign pair and architectural set rendered')
