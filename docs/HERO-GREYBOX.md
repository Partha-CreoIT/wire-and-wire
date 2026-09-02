# Hero grey-box — status (v2)

Grey-box of the scroll-scrubbed hero. **Motion, timing and readability only** —
no textures, no look-dev. Purpose: approve the camera arc and chapter pacing
before any lighting time is spent.

## Run it

```bash
cd public && python3 -m http.server 8747
open http://localhost:8747/greybox-test.html
```

Scroll: the bridge builds. Scroll back: it disassembles.
`?p=0.54` jumps to a given progress (smooth scroll off) for review.

Rebuild after editing the scene — renders **both** orientations:

```bash
./scripts/build-hero.sh              # 400 frames, 24 samples, 1920 wide
./scripts/build-hero.sh 400 64 1920  # higher-quality pass
```

## Verified

| | |
|---|---|
| Chapter arc | wire → strand → tension → concrete → deck → bridge, one continuous shot |
| Camera | single dolly-back, 0.016 m → 400 m, **no cuts** |
| Zoom smoothness | rate 13.1 → 7.1 (1.84×), monotonic — no lurch under scrub |
| Scroll → frame | `?p=0.54` → frame 216/400, progress bar 53.99% |
| Captions | 6 beats switch at the right progress |
| Atlas | desktop 3840×6120, mobile 2160×10880; tile 204 == frame 205 |
| Frame sizes | desktop 1920×1080, mobile 1080×1920 |
| Weight | 800 frames (both orientations), 15 KB avg, **11 MB total** (budget 30 MB) |
| Render | 7m30s for both passes @ 24 samples |
| Warnings | none (shadow pool raised to 1024 MB) |

## v2 — the four limitations, fixed

**1. Tension chapter read weakly** → added a live-end **anchorage**: bearing
plate, trumpet, barrel and a three-piece wedge grip, moved to x = −0.40 m so it
enters frame as the chapter opens (was −0.95 m and revealed 40% of the way in).
This is now the strongest technical image in the sequence.

**2. Concrete read flat** → replaced translucency with an **animated boolean
cutaway**. A 3.6 m section window opens as you scroll, cut floor dropped below
the tendon so the strand lies exposed in the trough. Concrete stays opaque —
the cut does the work. Two follow-on fixes were needed to make it read:
- the interior rendered near-black → added a **fill light** from the camera side
- speckle on surfaces behind the duct was **stochastic transparent-shadow
  sampling** (not dithered blending, which was already correct) → disabled
  transparent shadows on translucent materials

**3. No ground/horizon** → added a water plane at z = −12 m plus a **pier**
carrying the pylon down to it. A ground plane's horizon sits at eye level at
*every* scale, so it was drawing a seam across the 16 mm macro shots: the plane
is now hidden until t = 0.61 and its alpha fades in over t = 0.62→0.74, during
deck assembly when attention is elsewhere.

**4. Mobile was a centre crop** → mobile is now a **separate render pass**
(`orient=m`). Camera uses `sensor_fit = 'HORIZONTAL'` so both orientations share
an identical horizontal FOV, with distance × 0.85. Cropping 16:9 → 9:16 sliced
the ends off a 240 m bridge; this keeps the full span and gains vertical room.

## Still open

- [ ] Mobile subject sits dead-centre; shifting it up would leave cleaner room
      for captions at the bottom
- [ ] Model the real structure once chosen (recommend Marina Bayfront)
- [ ] Look-dev: steel vs concrete material split, warm accent on the strand
- [ ] Re-render at 64+ samples for the client-facing version
- [ ] Second tendon/duct pair would make the girder section more truthful

## Notes for whoever picks this up

- Blender **5.2** renamed things: `Action.fcurves` is gone (slotted actions —
  set `preferences.edit.keyframe_new_interpolation_type` before inserting keys
  instead), and the boolean solver `FAST` is now `FLOAT`.
- This machine's **ffmpeg has no libwebp**; `cwebp` does the encoding. The
  `scroll-story` skill's `make-frames.sh` will fail here for that reason.
- `reveal()` keyframes `hide_render`, not just scale. Scaling one axis to 0.001
  leaves the object full-size on the other two — that put a 14 m deck slab
  14 mm in front of the lens during the macro chapters.
