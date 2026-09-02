"""
Wire & Wire — hero grey-box  (v2)
=================================
ONE continuous camera pull-back across ~4 orders of magnitude:
single wire  ->  7-wire PC strand  ->  duct + live-end anchorage  ->
concrete girder that peels open  ->  deck assembly  ->  cable-stayed bridge.

Grey-box: no textures, no look-dev. Proves MOTION and TIMING under scroll.

  blender -b -P greybox_hero.py -a -- <outdir> [w] [h] [frames] [samples] [d|m]

The last arg is orientation: 'd' = 16:9 desktop, 'm' = 9:16 mobile. Mobile is a
genuine re-composition (horizontal sensor fit + pulled-in distance), NOT a crop
of the desktop render — a centre crop would slice the ends off a 240 m bridge.
"""

import bpy, sys, math
from mathutils import Vector

# ---------------------------------------------------------------- args
argv    = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT     = argv[0] if len(argv) > 0 else '/tmp/wire_frames/'
RES_X   = int(argv[1]) if len(argv) > 1 else 1920
RES_Y   = int(argv[2]) if len(argv) > 2 else 1080
FRAMES  = int(argv[3]) if len(argv) > 3 else 400
SAMPLES = int(argv[4]) if len(argv) > 4 else 24
ORIENT  = (argv[5] if len(argv) > 5 else 'd').lower()

PORTRAIT  = ORIENT == 'm'
DIST_MUL  = 0.85 if PORTRAIT else 1.0     # pull in so the subject fills the width

# ---------------------------------------------------------------- chapters
CH = {
    'wire':     (0.00, 0.15),
    'strand':   (0.15, 0.30),
    'tension':  (0.30, 0.45),
    'concrete': (0.45, 0.65),
    'deck':     (0.65, 0.85),
    'bridge':   (0.85, 1.00),
}
F = lambda t: max(1, min(FRAMES, round(t * (FRAMES - 1)) + 1))

# ---------------------------------------------------------------- constants
WIRE_R   = 0.00254        # 5.08 mm wire -> 15.2 mm 7-wire strand
STRAND_R = 3 * WIRE_R
LAY      = 0.22
STRAND_L = 120.0
DECK_L   = 240.0
DECK_W   = 14.0
PYLON_H  = 62.0
SEGMENTS = 20
WATER_Z  = -12.0          # deck sits 12 m above water

# ================================================================ helpers
def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def set_key_interp(kind):
    """Default interpolation for subsequently inserted keys.
    Version-safe: Blender 5.x removed Action.fcurves (slotted actions)."""
    try:
        bpy.context.preferences.edit.keyframe_new_interpolation_type = kind
    except Exception:
        pass

def mat(name, rgb, alpha=1.0, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Alpha'].default_value = alpha
    if alpha < 1.0:
        # EEVEE Next defaults transparency to DITHERED, which is heavy noise on
        # large translucent surfaces. BLENDED renders clean.
        for attr, val in (('surface_render_method', 'BLENDED'),
                          ('blend_method', 'BLEND')):
            try:
                setattr(m, attr, val)
            except (AttributeError, TypeError):
                pass
        m.use_backface_culling = False
        # Stochastic transparent shadows are the source of the speckle on
        # surfaces behind translucent geometry. A duct does not need one.
        try:
            m.use_transparent_shadow = False
        except AttributeError:
            pass
    return m

def put(ob, m):
    ob.data.materials.clear()
    ob.data.materials.append(m)
    return ob

def curve_tube(name, pts, radius, res=3):
    cd = bpy.data.curves.new(name, 'CURVE')
    cd.dimensions = '3D'
    cd.bevel_depth = radius
    cd.bevel_resolution = res
    sp = cd.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (p[0], p[1], p[2], 1.0)
    ob = bpy.data.objects.new(name, cd)
    bpy.context.collection.objects.link(ob)
    return ob

def cube(name, sx, sy, sz, loc):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.object; ob.name = name
    ob.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    return ob

def cyl(name, r, depth, loc, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc,
                                        rotation=rot, vertices=verts)
    ob = bpy.context.object; ob.name = name
    return ob

def cone(name, r1, r2, depth, loc, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=depth,
                                    location=loc, rotation=rot, vertices=verts)
    ob = bpy.context.object; ob.name = name
    return ob

def fade_alpha(material, t0, t1, a0, a1):
    node = material.node_tree.nodes['Principled BSDF'].inputs['Alpha']
    set_key_interp('BEZIER')
    node.default_value = a0; node.keyframe_insert('default_value', frame=F(t0))
    node.default_value = a1; node.keyframe_insert('default_value', frame=F(t1))

def reveal(ob, t0, t1, axis_only=None):
    """Scale-in between two scroll fractions, fully hidden before t0.

    hide_render is keyframed as well as scale: a 0.001 scale on ONE axis still
    leaves the object full-size on the other two, which put a 14 m deck slab
    14 mm in front of the lens during the macro chapters."""
    f0, f1 = F(t0), F(t1)
    set_key_interp('CONSTANT')
    ob.hide_render = ob.hide_viewport = True
    for fr in (1, max(1, f0 - 1)):
        ob.keyframe_insert('hide_render', frame=fr)
        ob.keyframe_insert('hide_viewport', frame=fr)
    ob.hide_render = ob.hide_viewport = False
    ob.keyframe_insert('hide_render', frame=f0)
    ob.keyframe_insert('hide_viewport', frame=f0)
    set_key_interp('BEZIER')

    base = tuple(ob.scale)
    zero = ((0.001,) * 3 if axis_only is None
            else tuple(0.001 if i == axis_only else base[i] for i in range(3)))
    ob.scale = zero; ob.keyframe_insert('scale', frame=f0)
    ob.scale = base; ob.keyframe_insert('scale', frame=f1)

# ================================================================ build
clear_scene()
scene = bpy.context.scene
set_key_interp('BEZIER')

# Steel reads notably darker than concrete so the strand stays legible once
# it is sitting inside a pale girder.
M_STEEL    = mat('steel',    (0.42, 0.43, 0.46), rough=0.32)
M_CORE     = mat('core',     (0.30, 0.31, 0.34), rough=0.30)
M_ANCHOR   = mat('anchor',   (0.34, 0.35, 0.38), rough=0.38)
M_DUCT     = mat('duct',     (0.72, 0.73, 0.75), alpha=0.30, rough=0.20)
M_CONCRETE = mat('concrete', (0.82, 0.81, 0.79), rough=0.88)
M_DECK     = mat('deck',     (0.74, 0.73, 0.72), rough=0.88)
M_PYLON    = mat('pylon',    (0.70, 0.69, 0.68), rough=0.82)
M_CABLE    = mat('cable',    (0.36, 0.37, 0.40), rough=0.40)
M_WATER    = mat('water',    (0.030, 0.034, 0.042), alpha=0.99, rough=0.12)

# ---- 1. the 7-wire strand ----------------------------------------------
STEP = LAY / 28.0
N    = int(STRAND_L / STEP)
half = STRAND_L / 2

core = put(curve_tube('wire_core',
                      [(-half + i * STEP, 0, 0) for i in range(N + 1)],
                      WIRE_R * 1.04), M_CORE)

for k in range(6):
    phase = 2 * math.pi * k / 6.0
    pts = []
    for i in range(N + 1):
        x = -half + i * STEP
        a = phase + 2 * math.pi * (x / LAY)
        pts.append((x, 2 * WIRE_R * math.cos(a), 2 * WIRE_R * math.sin(a)))
    w = put(curve_tube(f'wire_{k}', pts, WIRE_R), M_STEEL)
    t0 = CH['strand'][0] + 0.006 * k
    reveal(w, t0, t0 + 0.05)

# ---- 2. duct + live-end anchorage --------------------------------------
# FIX: the duct alone was translucent grey on grey and read as nothing. A real
# anchorage — bearing plate, wedge cone, trumpet — gives the tension chapter an
# object to look at. Placed near the origin so it enters frame as we pull back.
t0d, t1d = CH['tension']
duct = put(cyl('duct', 0.048, STRAND_L * 0.92, (0, 0, 0), (0, math.pi / 2, 0), 40),
           M_DUCT)
duct.visible_shadow = False
reveal(duct, t0d, t0d + 0.045)

AX = -0.40                                   # close enough to be in frame at t=0.30
plate   = put(cube('anch_plate', 0.05, 0.34, 0.34, (AX, 0, 0)), M_ANCHOR)
trumpet = put(cone('anch_trumpet', 0.155, 0.062, 0.30,
                   (AX + 0.175, 0, 0), (0, math.pi / 2, 0), 32), M_ANCHOR)
barrel  = put(cyl('anch_barrel', 0.085, 0.13, (AX - 0.09, 0, 0),
                  (0, math.pi / 2, 0), 32), M_ANCHOR)
wedges  = []
for k in range(3):                            # three-piece wedge grip
    a = 2 * math.pi * k / 3 + 0.4
    wg = put(cone(f'anch_wedge_{k}', 0.020, 0.009, 0.075,
                  (AX - 0.145, 0.020 * math.cos(a), 0.020 * math.sin(a)),
                  (0, math.pi / 2, 0), 12), M_STEEL)
    wedges.append(wg)

for i, ob in enumerate([plate, trumpet, barrel] + wedges):
    s = t0d + 0.012 + 0.010 * i
    reveal(ob, s, s + 0.040)

# ---- 3. concrete girder that peels open --------------------------------
# FIX: an opaque 110 m beam broadside is a featureless wedge, and making it
# translucent just made it a pale featureless wedge. A cutaway that OPENS as
# you scroll is the money shot: the strand is unmistakably inside the concrete.
t0c, t1c = CH['concrete']
girder = put(cube('girder', STRAND_L * 0.92, 1.5, 1.15, (0, 0, 0)), M_CONCRETE)
reveal(girder, t0c, t0c + 0.035)

cutter = cube('girder_cutter', 3.6, 1.45, 1.24, (0.15, -0.62, 0.57))
cutter.hide_render = True          # operand only; never rendered itself
bm = girder.modifiers.new('cutaway', 'BOOLEAN')
bm.operation = 'DIFFERENCE'
bm.object = cutter
# Blender 5 renamed the fast solver FAST -> FLOAT. Try cheapest first;
# 400 frames of EXACT boolean is not worth the render time.
for _solver in ('FLOAT', 'FAST', 'EXACT'):
    try:
        bm.solver = _solver
        break
    except TypeError:
        continue

# cutter grows from nothing -> the concrete opens up along the tendon
set_key_interp('BEZIER')
cutter.scale = (0.001, 1, 1); cutter.keyframe_insert('scale', frame=F(t0c + 0.022))
cutter.scale = (1.0, 1, 1);   cutter.keyframe_insert('scale', frame=F(t0c + 0.090))

# ---- 4. deck assembly ---------------------------------------------------
seg_len = DECK_L / SEGMENTS
d0, d1 = CH['deck']
for i in range(SEGMENTS):
    side, rank = (1 if i % 2 == 0 else -1), i // 2
    x = side * (rank + 0.5) * seg_len
    if abs(x) > DECK_L / 2:
        continue
    s = put(cube(f'deck_{i}', seg_len * 0.97, DECK_W, 1.1, (x, 0, 0)), M_DECK)
    t = d0 + (d1 - d0) * (i / SEGMENTS) * 0.9
    reveal(s, t, t + 0.035, axis_only=0)

# ---- 5. pylon, pier, stay cables ---------------------------------------
b0, b1 = CH['bridge']
pylon = put(cube('pylon', 4.0, 5.0, PYLON_H, (0, 0, PYLON_H / 2 - 1.0)), M_PYLON)
reveal(pylon, d1 - 0.06, b0 + 0.03, axis_only=2)

# FIX: the pylon previously stopped in mid-air. A pier down to the water gives
# the structure something to stand on and sells the 12 m deck height.
pier = put(cube('pier', 7.5, 9.5, abs(WATER_Z) + 2.0, (0, 0, (WATER_Z + 2.0) / 2 - 0.5)),
           M_PYLON)
reveal(pier, d1 - 0.06, b0 + 0.03, axis_only=2)

top = Vector((0, 0, PYLON_H - 3.0))
for i in range(1, 9):
    for side in (1, -1):
        for y in (DECK_W / 2 - 1.2, -DECK_W / 2 + 1.2):
            anchor = Vector((side * i * (DECK_L / 2) / 8.5, y, 0.6))
            vec = anchor - top
            c = put(cyl(f'stay_{i}_{side}_{y:.0f}', 0.09, vec.length,
                        (top + anchor) / 2, verts=8), M_CABLE)
            c.rotation_mode = 'QUATERNION'
            c.rotation_quaternion = vec.to_track_quat('Z', 'Y')
            t = b0 + (b1 - b0) * (i / 9.0) * 0.8
            reveal(c, t, t + 0.04, axis_only=2)

# ---- 6. water + horizon -------------------------------------------------
# FIX: without a ground plane the bridge floated in grey and the scale never
# read. Water is darker than the sky, so the horizon line comes for free.
# It stays out of frame until ~t=0.82 on its own — no reveal needed, no pop.
bpy.ops.mesh.primitive_plane_add(size=8000, location=(0, 0, WATER_Z))
water = put(bpy.context.object, M_WATER)
water.name = 'water'
water.visible_shadow = False
set_key_interp('CONSTANT')
water.hide_render = water.hide_viewport = True
for fr in (1, F(0.61)):
    water.keyframe_insert('hide_render', frame=fr)
    water.keyframe_insert('hide_viewport', frame=fr)
water.hide_render = water.hide_viewport = False
water.keyframe_insert('hide_render', frame=F(0.62))
water.keyframe_insert('hide_viewport', frame=F(0.62))
fade_alpha(M_WATER, 0.62, 0.74, 0.0, 1.0)

# ---------------------------------------------------------------- camera
cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 40
cam_data.sensor_fit = 'HORIZONTAL'     # identical horizontal FOV in both
cam_data.sensor_width = 36             # orientations -> portrait is a
cam_data.clip_start = 0.0008           # re-composition, not a crop
cam_data.clip_end   = 12000.0
cam = bpy.data.objects.new('cam', cam_data)
bpy.context.collection.objects.link(cam)
scene.camera = cam

set_key_interp('LINEAR')               # keep the dolly perfectly even

DIR0 = Vector((-0.55, -0.80,  0.05)).normalized()
DIR1 = Vector((-0.42, -0.72,  0.38)).normalized()
TGT0 = Vector((0.02, 0, WIRE_R * 0.6))
TGT1 = Vector((0, 0, PYLON_H * 0.33))
RISE = 0.60

# Distance curve: quadratic in LOG space.
#     ln d(t) = ln D0 + A*t + B*t^2      ->  zoom rate = A + 2B*t
# A single exponential (constant rate) framed the 1.5 m girder from 1.5 m — a
# grey wall. A piecewise curve fixed framing but Catmull-Rom overshoot swung
# the rate 3.5x, a visible lurch. This is smooth and monotonic by construction.
D0, A, B = 0.016, 13.13, -3.00

def dist(t):
    return D0 * math.exp(A * t + B * t * t) * DIST_MUL

def smooth(x):
    return x * x * (3 - 2 * x)

def rise(t):
    """Framing ramp. Must stay pinned to the strand through the macro chapters:
    distance grows exponentially, so a plain smoothstep on t had the camera
    aiming 2 m above a 15 mm strand by frame 80 — every macro frame empty."""
    return smooth(max(0.0, min(1.0, (t - RISE) / (1.0 - RISE))))

for f in range(1, FRAMES + 1):
    t = (f - 1) / (FRAMES - 1)
    r = rise(t)
    dirv = DIR0.lerp(DIR1, r).normalized()
    tgt  = TGT0.lerp(TGT1, r)
    cam.location = tgt + dirv * dist(t)
    cam.rotation_mode = 'QUATERNION'
    cam.rotation_quaternion = (tgt - cam.location).to_track_quat('-Z', 'Y')
    cam.keyframe_insert('location', frame=f)
    cam.keyframe_insert('rotation_quaternion', frame=f)

# ---------------------------------------------------------------- lighting
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
sun.data.energy = 3.4
sun.data.angle  = 0.12
sun.rotation_euler = (math.radians(52), 0, math.radians(38))
bpy.context.collection.objects.link(sun)

# Fill from roughly the camera side. Without it the inside of the cutaway
# rendered near-black and the strand inside it was invisible.
fill = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'SUN'))
fill.data.energy = 1.5
fill.data.angle = 0.6
fill.rotation_mode = 'QUATERNION'
fill.rotation_quaternion = Vector((0.50, 0.72, -0.48)).to_track_quat('-Z', 'Y')
try:
    fill.data.use_shadow = False
except AttributeError:
    pass
bpy.context.collection.objects.link(fill)

world = bpy.data.worlds.new('w')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.075, 0.080, 0.092, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 1.0
scene.world = world

# ---------------------------------------------------------------- render
engines = {e.identifier for e in
           bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items}
scene.render.engine = ('BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in engines
                       else 'BLENDER_EEVEE')
try:
    scene.eevee.taa_render_samples = SAMPLES
except Exception:
    pass
# 64 stay cables + 20 deck segments + 2 lights overflowed the default 512 MB
# shadow pool ("Shadow buffer full ... 2077 / 2048"), which silently drops
# shadows on some frames — a flicker you would only catch while scrubbing.
try:
    scene.eevee.shadow_pool_size = '1024'
except Exception:
    pass

scene.render.resolution_x = RES_X
scene.render.resolution_y = RES_Y
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.image_settings.compression = 15
scene.frame_start, scene.frame_end = 1, FRAMES
scene.render.filepath = OUT.rstrip('/') + '/'

assert scene.camera is not None, "no camera — scene build failed"
assert len([o for o in bpy.data.objects if o.type in {'MESH', 'CURVE'}]) > 20, \
    "scene looks empty — build failed"
print(f"[greybox] {scene.render.engine} {RES_X}x{RES_Y} orient={ORIENT} "
      f"{FRAMES}f samples={SAMPLES} objects={len(bpy.data.objects)} "
      f"-> {scene.render.filepath}")
