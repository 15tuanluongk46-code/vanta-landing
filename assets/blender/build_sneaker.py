"""VANTA FORM 01 concept master. Run in Blender; preserves existing scenes."""
import bpy
import math
from mathutils import Vector
from pathlib import Path

ROOT = Path('/home/sss/AI-Home/projects/vanta-landing')

def material(name, color, roughness=.7):
    mat = bpy.data.materials.new('MAT-VANTA-' + name)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    mat.diffuse_color = (*color, 1)
    return mat

def mesh(name, verts, faces, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new('GEO-VANTA-' + name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for p in data.polygons:
        p.use_smooth = True
    return obj

def tube(name, points, radius, mat, cyclic=False):
    # Mesh tube avoids curve-conversion and glTF material differences.
    verts, faces = [], []
    count = len(points)
    for i, point in enumerate(points):
        p = Vector(point)
        tangent = Vector(points[(i+1)%count]) - Vector(points[i-1]) if cyclic else Vector(points[min(i+1,count-1)]) - Vector(points[max(0,i-1)])
        tangent.normalize()
        normal = tangent.cross(Vector((0,0,1)))
        if normal.length < .001:
            normal = tangent.cross(Vector((0,1,0)))
        normal.normalize()
        binormal = tangent.cross(normal).normalized()
        for j in range(8):
            a = j*math.tau/8
            verts.append(p + radius*(normal*math.cos(a)+binormal*math.sin(a)))
    for i in range(count if cyclic else count-1):
        for j in range(8):
            faces.append((i*8+j,i*8+(j+1)%8,((i+1)%count)*8+(j+1)%8,((i+1)%count)*8+j))
    return mesh(name,verts,faces,mat)

def footprint(t):
    # Toe at -X, heel at +X; asymmetrical forefoot with narrower heel.
    x = .15*math.cos(t)
    width = .049 + .009*math.exp(-((x+.07)/.07)**2) - .009*math.exp(-((x-.10)/.06)**2)
    return x, width*math.sin(t)

def sole(name, levels, mat):
    n = 96
    verts, faces = [], []
    for z,scale in levels:
        for i in range(n):
            x,y=footprint(i*math.tau/n)
            uplift=.008*max(0,(-x-.09)/.06)**2
            verts.append((x*scale,y*scale,z+uplift))
    for k in range(len(levels)-1):
        for i in range(n):
            faces.append((k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i))
    faces += [tuple(reversed(range(n))),tuple((len(levels)-1)*n+i for i in range(n))]
    return mesh(name,verts,faces,mat)

def build():
    if bpy.data.scenes.get('VANTA-FORM01'):
        raise RuntimeError('VANTA scene already exists; do not duplicate master')
    scene = bpy.data.scenes.new('VANTA-FORM01')
    bpy.context.window.scene = scene
    mats = {
        'upper': material('upper',(.73,.70,.61)),
        'panel': material('panel',(.56,.53,.46)),
        'sole': material('sole',(.82,.79,.69)),
        'dark': material('dark',(.014,.016,.018)),
        'lace': material('lace',(.88,.84,.73)),
        'accent': material('accent',(.90,.19,.045)),
    }
    sole('outsole',[(.003,.98),(.005,1.01),(.012,1.014)],mats['dark'])
    sole('midsole',[(.011,1.014),(.014,1.025),(.019,1.025),(.028,1.005),(.036,.99)],mats['sole'])
    sole('rim',[(.032,.996),(.036,1.007),(.039,.978)],mats['sole'])
    # Smooth vamp/body: closed toe flows into the collar opening at the heel.
    n,m=96,18
    verts,faces=[],[]
    for j in range(m+1):
        v=j/m
        for i in range(n):
            a=i*math.tau/n
            ox,oy=footprint(a)
            ix=.084+.046*math.cos(a)
            iy=.027*math.sin(a)
            x=ox*(1-v)+ix*v
            y=oy*(1-v)+iy*v
            h=.072+.026*max(0,math.cos(a))
            z=.037+h*math.sin(v*math.pi/2)
            verts.append((x,y,z))
    for j in range(m):
        for i in range(n):
            faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    mesh('upper',verts,faces,mats['upper'])
    # Padded dark collar opening and a dark footbed below.
    collar=[]
    for i in range(96):
        a=i*math.tau/96
        collar.append((.084+.046*math.cos(a),.027*math.sin(a),.109+.026*max(0,math.cos(a))))
    tube('collar',collar,.005,mats['dark'],True)
    inner=[(.084+.044*math.cos(i*math.tau/96),.026*math.sin(i*math.tau/96),.09) for i in range(96)]
    mesh('footbed',inner,[tuple(range(96))],mats['dark'])
    for i in range(96):
        a=i*math.tau/96
        b=(i+1)*math.tau/96
        mesh('lining-%02d'%i,[collar[i],collar[(i+1)%96],inner[(i+1)%96],inner[i]],[(0,1,2,3)],mats['dark'])
    # Panel ribbons adhere to the sampled upper surface, including sewn edging.
    def surface(a,v,offset=.001):
        ox,oy=footprint(a)
        return (ox*(1-v)+(.084+.046*math.cos(a))*v,oy*(1-v)+.027*math.sin(a)*v,.037+(.072+.026*max(0,math.cos(a)))*math.sin(v*math.pi/2)+offset)
    def panel(name,a0,a1,lower,upper,mat):
        rows=30
        pv=[]
        for j in range(rows+1):
            a=a0+(a1-a0)*j/rows
            for v in (lower(a),upper(a)):
                pv.append(surface(a,v,.0014))
        mesh(name,pv,[(2*j,2*j+1,2*j+3,2*j+2) for j in range(rows)],mat)
        for edge in [0,1]:
            pts=[pv[2*j+edge] for j in range(rows+1)]
            tube(name+'-seam'+str(edge),pts,.00045,mats['lace'])
    panel('toe-guard',math.pi*.58,math.pi*1.42,lambda a:.015,lambda a:.19,mats['panel'])
    panel('heel-counter',-.85,.85,lambda a:.01,lambda a:.76,mats['panel'])
    for s in [-1,1]:
        panel('quarter'+str(s),s*1.0,s*2.18,lambda a:.04,lambda a:.34+.08*math.cos(a*3),mats['panel'])
        panel('eyestay'+str(s),s*1.4,s*2.6,lambda a:.60,lambda a:.72,mats['sole'])
        panel('signature-a'+str(s),s*1.4,s*1.53,lambda a:.07,lambda a:.62,mats['dark'])
        panel('signature-b'+str(s),s*1.73,s*1.83,lambda a:.07,lambda a:.6,mats['dark'])
    # Tongue and laces follow the rising vamp; six deliberate crossings.
    tv=[]
    for j in range(24):
        x=-.067+j/23*.106
        z=.080+j/23*.044
        width=.019-.003*j/23
        for s in [-1,1]: tv.append((x,s*width,z))
    mesh('tongue',tv,[(j*2,j*2+1,j*2+3,j*2+2) for j in range(23)],mats['upper'])
    for j in range(6):
        x=-.072+j*.017
        z=.080+j*.0074
        for s in [-1,1]:
            pts=[]
            for k in range(20):
                t=k/19
                pts.append((x+.014*t,s*.022*(1-2*t),z+.006*t+.004*math.sin(math.pi*t)))
            tube('lace-%s-%s'%(j,s),pts,.0017,mats['lace'])
    tube('heel-tab',[(.134,-.007,.107),(.145,-.007,.146),(.143,.007,.15),(.134,.007,.112)],.0035,mats['accent'])
    # Fine sole grooves and toe perforations as geometry (exportable).
    for i in range(18):
        x=-.13+i*.015
        w=.049+.009*math.exp(-((x+.07)/.07)**2)-.009*math.exp(-((x-.1)/.06)**2)
        for s in [-1,1]: tube('tread-%s-%s'%(i,s),[(x,s*w,.004),(x+.003,s*(w+.001),.01)],.001,mats['dark'])
    scene['concept_dimensions'] = 'Approximate design envelope 0.30 m long; not a manufactured specification.'
    scene['original_scene'] = 'AG45-reveal'
    scene.render.engine='BLENDER_EEVEE'
    scene.render.resolution_x=1600
    scene.render.resolution_y=1000
    scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format='PNG'
    scene.render.image_settings.color_mode='RGBA'
    world=bpy.data.worlds.new('VANTA-studio')
    world.use_nodes=True
    bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND')
    bg.inputs['Color'].default_value=(.32,.32,.32,1)
    bg.inputs['Strength'].default_value=.6
    scene.world=world
    for name,pos,power,size in [('key',(-.2,-.35,.5),12,.45),('fill',(.2,.25,.3),5,.3),('rim',(.4,.15,.4),10,.25)]:
        data=bpy.data.lights.new('LGT-VANTA-'+name,'AREA')
        obj=bpy.data.objects.new(data.name,data)
        scene.collection.objects.link(obj)
        obj.location=pos
        obj.rotation_euler=(Vector((0,0,.06))-obj.location).to_track_quat('-Z','Y').to_euler()
        data.energy=power
        data.size=size
    data=bpy.data.cameras.new('CAM-VANTA-hero')
    camera=bpy.data.objects.new(data.name,data)
    scene.collection.objects.link(camera)
    camera.location=(-.30,-.66,.29)
    camera.rotation_euler=(Vector((0,0,.068))-camera.location).to_track_quat('-Z','Y').to_euler()
    data.type='ORTHO'
    data.ortho_scale=.39
    scene.camera=camera
    for obj in scene.objects: obj.select_set(obj.type=='MESH')
    bpy.context.view_layer.objects.active=next(o for o in scene.objects if o.type=='MESH')
    print('VANTA master created:',len(scene.objects),'objects')

if __name__=='__main__':
    build()
