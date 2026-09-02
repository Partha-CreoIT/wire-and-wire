#!/usr/bin/env python3
"""Placeholder scene stills for the "Follow the Wire" film.

Flat-isometric miniatures drawn in the brand palette. Same filenames and
framing the Higgsfield renders will ship with, so the swap is config-free.
Run from the repo root:  python3 assets-source/world/make-placeholders.py
"""
from PIL import Image, ImageDraw, ImageFilter
import math, os

W, H, SS = 2400, 1600, 2          # output size, supersample factor
CW, CH = W * SS, H * SS

BG       = (245, 240, 235)        # warm paper  #F5F0EB
SHADOW   = (224, 216, 205)
PLAT     = ((223, 217, 207), (207, 201, 190), (196, 190, 178))   # top/left/right
CHARCOAL = ((35, 38, 44), (22, 24, 28), (16, 18, 22))
GRAPHITE = ((106, 112, 122), (90, 96, 104), (74, 79, 88))
COPPER   = ((208, 138, 63), (190, 117, 45), (165, 100, 31))
COPPER_L = (216, 148, 84)
CONCRETE = ((215, 209, 198), (199, 193, 182), (186, 180, 168))
WHITEBOX = ((251, 249, 246), (236, 232, 226), (224, 219, 212))
WIRE     = (190, 117, 45)
WATER    = (214, 211, 206)

C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))


class Iso:
    def __init__(self, draw, cx, cy, s):
        self.d, self.cx, self.cy, self.s = draw, cx, cy, s

    def p(self, x, y, z):
        return (self.cx + (x - y) * C30 * self.s,
                self.cy + (x + y) * S30 * self.s - z * self.s)

    def box(self, x, y, z, dx, dy, dz, col, outline=None):
        p = self.p
        top = [p(x, y, z+dz), p(x+dx, y, z+dz), p(x+dx, y+dy, z+dz), p(x, y+dy, z+dz)]
        left = [p(x, y+dy, z+dz), p(x+dx, y+dy, z+dz), p(x+dx, y+dy, z), p(x, y+dy, z)]
        right = [p(x+dx, y, z+dz), p(x+dx, y+dy, z+dz), p(x+dx, y+dy, z), p(x+dx, y, z)]
        for face, c in ((left, col[1]), (right, col[2]), (top, col[0])):
            self.d.polygon(face, fill=c, outline=outline)

    def cyl(self, x, y, z, r, h, col):
        """Vertical cylinder, approximated for the flat-iso look."""
        cxt, cyt = self.p(x, y, z + h)
        cxb, cyb = self.p(x, y, z)
        rx, ry = r * self.s * C30 * 1.15, r * self.s * S30 * 1.15
        self.d.ellipse([cxb-rx, cyb-ry, cxb+rx, cyb+ry], fill=col[1])
        self.d.rectangle([cxb-rx, cyt, cxb+rx, cyb], fill=col[1])
        self.d.rectangle([cxb, cyt, cxb+rx, cyb], fill=col[2])
        self.d.ellipse([cxt-rx, cyt-ry, cxt+rx, cyt+ry], fill=col[0])

    def ring(self, x, y, z, r, col, w):
        cx, cy = self.p(x, y, z)
        rx, ry = r * self.s * C30 * 1.15, r * self.s * S30 * 1.15
        self.d.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], outline=col, width=int(w * self.s))

    def coil(self, x, y, z, r, col, turns=3):
        for i in range(turns):
            self.ring(x, y, z + i * 0.22, r, col, 0.16)

    def wire(self, pts3, w=0.14, col=WIRE):
        pts = [self.p(*q) for q in pts3]
        self.d.line(pts, fill=col, width=int(w * self.s), joint='curve')

    def worker(self, x, y, z):
        px, py = self.p(x, y, z)
        s = self.s
        self.d.rounded_rectangle([px-0.14*s, py-0.62*s, px+0.14*s, py],
                                 radius=0.13*s, fill=CHARCOAL[1])
        self.d.ellipse([px-0.12*s, py-0.9*s, px+0.12*s, py-0.66*s], fill=COPPER[0])


def canvas():
    img = Image.new('RGB', (CW, CH), BG)
    return img, ImageDraw.Draw(img)


def ground_shadow(img, cx, cy, rx, ry):
    layer = Image.new('RGB', (CW, CH), BG)
    ImageDraw.Draw(layer).ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=SHADOW)
    return Image.blend(img, layer.filter(ImageFilter.GaussianBlur(60)), 0.9)


def save(img, name):
    out = img.resize((W, H), Image.LANCZOS)
    path = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'world', name)
    out.save(os.path.abspath(path), 'WEBP', quality=88)
    print('wrote', name)


# ---------------------------------------------------------------- scene 1: mill
def mill():
    img, d = canvas()
    img = ground_shadow(img, CW*0.5, CH*0.66, CW*0.34, CH*0.10)
    d = ImageDraw.Draw(img)
    iso = Iso(d, CW*0.5, CH*0.60, CW*0.021)
    iso.box(-8, -5, 0, 16, 10, 0.7, PLAT)                       # platform
    iso.box(-7, -4.4, 0.7, 14, 0.5, 3.0, GRAPHITE)              # back wall
    for i, gx in enumerate((-6.4, -1.7, 3.0)):                  # sawtooth roof
        iso.box(gx, -4.4, 3.7, 4.4, 0.5, 0.001, GRAPHITE)
        top = [iso.p(gx, -4.4, 3.7), iso.p(gx+4.4, -4.4, 3.7), iso.p(gx+4.4, -4.4, 4.9)]
        d.polygon(top, fill=CHARCOAL[0])
    for cx_ in (-6.4, -2.4, 1.6, 5.6):                          # columns
        iso.box(cx_, 2.6, 0.7, 0.45, 0.45, 2.6, CHARCOAL)
    iso.box(-7, -4.4, 3.15, 14, 7.6, 0.35, CONCRETE)            # roof slab (thin)
    iso.coil(-5.6, 1.2, 0.7, 1.15, CHARCOAL[1])                 # rod coil in
    for mx in (-3.2, -0.8, 1.6):                                # drawing dies
        iso.box(mx, 0.4, 0.7, 1.3, 1.1, 1.15, GRAPHITE)
        iso.box(mx+0.35, 0.68, 1.85, 0.6, 0.55, 0.28, COPPER)
    iso.cyl(4.6, 0.9, 0.7, 0.95, 1.7, GRAPHITE)                 # take-up spool
    iso.ring(4.6, 0.9, 1.45, 1.0, WIRE, 0.3)
    iso.cyl(6.3, -1.6, 0.7, 0.8, 1.4, GRAPHITE)                 # second spool
    iso.ring(6.3, -1.6, 1.3, 0.85, WIRE, 0.26)
    iso.wire([(-5.6, 1.2, 1.5), (-3.9, 1.0, 1.75), (-2.55, 0.95, 1.9),
              (-0.15, 0.95, 1.9), (2.25, 0.95, 1.9), (4.6, 0.9, 1.6)])
    iso.box(-6.6, 3.4, 0.7, 0.9, 0.6, 0.5, COPPER)              # forklift body
    iso.box(-5.9, 3.45, 0.7, 0.18, 0.5, 1.1, CHARCOAL)          # forklift mast
    iso.worker(-1.9, 2.6, 0.7)
    iso.worker(3.4, 2.2, 0.7)
    save(img, 'mill.webp')


# ------------------------------------------------------------- scene 2: strand
def strand():
    img, d = canvas()
    img = ground_shadow(img, CW*0.5, CH*0.66, CW*0.33, CH*0.10)
    d = ImageDraw.Draw(img)
    iso = Iso(d, CW*0.5, CH*0.60, CW*0.021)
    iso.box(-8, -5, 0, 16, 10, 0.7, PLAT)
    iso.box(-5.4, -0.4, 0.7, 2.6, 2.2, 0.9, CHARCOAL)           # strander stand
    px, py = iso.p(-4.1, 0.7, 3.15)                             # strander cage disc
    R = 2.05 * iso.s
    d.ellipse([px-R, py-R, px+R, py+R], fill=GRAPHITE[1])
    d.ellipse([px-R*0.86, py-R*0.86, px+R*0.86, py+R*0.86], fill=GRAPHITE[0])
    for k in range(6):                                          # six bobbins
        a = math.radians(60*k - 90)
        bx, by = px + math.cos(a)*R*0.58, py + math.sin(a)*R*0.58
        r = 0.42 * iso.s
        d.ellipse([bx-r, by-r, bx+r, by+r], fill=CHARCOAL[1])
        d.ellipse([bx-r*0.55, by-r*0.55, bx+r*0.55, by+r*0.55], fill=COPPER_L)
    hub = 0.3 * iso.s
    d.ellipse([px-hub, py-hub, px+hub, py+hub], fill=COPPER[1])
    conv = iso.p(-0.6, 0.7, 2.1)                                # wires converge
    for k in range(6):
        a = math.radians(60*k - 90)
        bx, by = px + math.cos(a)*R*0.58, py + math.sin(a)*R*0.58
        d.line([ (bx, by), conv ], fill=WIRE, width=int(0.07*iso.s))
    iso.cyl(3.4, 0.6, 0.7, 1.5, 0.5, GRAPHITE)                  # reel base flange
    iso.cyl(3.4, 0.6, 1.2, 1.05, 1.1, COPPER)                   # wound strand
    iso.cyl(3.4, 0.6, 2.3, 1.5, 0.4, GRAPHITE)                  # top flange
    iso.wire([(-0.6, 0.7, 2.1), (1.2, 0.65, 2.25), (3.4, 0.6, 2.0)], w=0.2)
    iso.coil(-6.3, 3.1, 0.7, 0.95, COPPER[1])                   # finished coils
    iso.coil(-4.2, 3.6, 0.7, 0.95, COPPER[1])
    iso.worker(5.8, 2.4, 0.7)
    save(img, 'strand.webp')


# -------------------------------------------------------------- scene 3: build
def build():
    img, d = canvas()
    img = ground_shadow(img, CW*0.5, CH*0.68, CW*0.36, CH*0.10)
    d = ImageDraw.Draw(img)
    iso = Iso(d, CW*0.5, CH*0.66, CW*0.0195)
    iso.box(-8.5, -5, 0, 17, 10, 0.6, PLAT)
    for pxq in (-6.2, -3.4, 2.2, 5.0):                          # piers
        iso.box(pxq, -0.9, 0.6, 1.2, 1.5, 4.0, CONCRETE)
    iso.box(-7.8, -1.15, 4.6, 5.8, 2.0, 0.75, CONCRETE)         # deck left
    iso.box(1.6, -1.15, 4.6, 5.8, 2.0, 0.75, CONCRETE)          # deck right
    iso.wire([(-2.0, -0.15, 5.1), (-1.0, -0.15, 4.7), (0.0, -0.15, 4.5),
              (0.8, -0.15, 4.7), (1.6, -0.15, 5.1)], w=0.18)    # strand in the open span
    iso.box(0.9, 2.9, 0.6, 0.5, 0.5, 6.6, CHARCOAL)             # crane mast (foreground)
    iso.box(-3.6, 3.0, 6.7, 5.0, 0.32, 0.32, COPPER)            # crane jib toward the gap
    d.line([iso.p(-2.4, 3.15, 6.7), iso.p(-2.4, 3.15, 5.75)], fill=CHARCOAL[1],
           width=int(0.05*iso.s))                               # hoist cable
    iso.box(-2.95, 2.65, 5.05, 1.1, 1.0, 0.7, CONCRETE)         # hanging segment
    iso.box(-7.6, 2.9, 0.6, 1.9, 1.2, 1.0, WHITEBOX)            # site cabin
    iso.box(-7.75, 2.85, 1.6, 2.2, 1.3, 0.18, COPPER)           # cabin roof
    iso.coil(-5.0, 3.6, 0.6, 0.85, COPPER[1])
    iso.coil(-3.3, 4.1, 0.6, 0.85, COPPER[1])
    iso.worker(-3.6, -0.2, 5.35)
    iso.worker(3.2, 0.2, 5.35)
    iso.worker(4.4, 3.2, 0.6)
    save(img, 'build.webp')


# ------------------------------------------------------------ scene 4: skyline
def skyline():
    img, d = canvas()
    img = ground_shadow(img, CW*0.5, CH*0.70, CW*0.37, CH*0.09)
    d = ImageDraw.Draw(img)
    iso = Iso(d, CW*0.5, CH*0.64, CW*0.0195)
    sun_x, sun_y, sun_r = CW*0.665, CH*0.30, CW*0.055           # low copper sun
    d.ellipse([sun_x-sun_r, sun_y-sun_r, sun_x+sun_r, sun_y+sun_r], fill=COPPER_L)
    iso.box(-9, -5.5, 0, 18, 11, 0.5, PLAT)                     # base
    iso.box(-8.4, -1.2, 0.5, 16.8, 6.2, 0.35, (WATER, (203, 200, 194), (196, 193, 187)))
    for wx in (-5.5, -1.5, 2.5, 5.5):                           # ripples
        d.line([iso.p(wx, 1.2, 0.87), iso.p(wx+1.6, 1.2, 0.87)],
               fill=(228, 225, 220), width=int(0.06*iso.s))
    towers = [(-6.9, 3.4, CHARCOAL, 1.5), (-5.0, 5.4, GRAPHITE, 1.3),
              (-3.2, 4.2, CHARCOAL, 1.2), (2.6, 6.2, CHARCOAL, 1.5),
              (4.6, 4.6, GRAPHITE, 1.3), (6.4, 3.2, CHARCOAL, 1.1)]
    for tx, th, tc, tw in towers:                               # skyline behind
        iso.box(tx, -4.6, 0.5, tw, 1.3, th, tc)
        iso.box(tx + tw*0.28, -4.6, 0.5 + th, tw*0.44, 1.3, 0.35, COPPER)
    iso.box(-8.2, 0.1, 1.15, 16.4, 1.15, 0.42, CONCRETE)        # bridge deck
    iso.box(-0.75, 0.25, 1.57, 0.75, 0.75, 5.6, COPPER)         # pylon
    for k, ax in enumerate((-6.8, -5.2, -3.6, -2.2, 1.6, 3.0, 4.6, 6.2)):
        d.line([iso.p(-0.4, 0.6, 7.0), iso.p(ax, 0.6, 1.6)],
               fill=WIRE, width=int(0.055*iso.s))               # cable fan
    for cx_, cc in ((-4.9, CHARCOAL), (1.9, COPPER), (4.3, CHARCOAL)):
        iso.box(cx_, 0.42, 1.57, 0.7, 0.42, 0.3, cc)            # tiny cars
    save(img, 'skyline.webp')


if __name__ == '__main__':
    os.makedirs(os.path.abspath(os.path.join(
        os.path.dirname(__file__), '..', '..', 'public', 'world')), exist_ok=True)
    mill(); strand(); build(); skyline()
