# Hero grey-box — status

Grey-box of the scroll-scrubbed hero. **Motion and timing only** — no textures,
no look-dev. Purpose: approve the camera arc and chapter pacing before any
lighting time is spent.

## Run it

```bash
cd public && python3 -m http.server 8747
open http://localhost:8747/greybox-test.html
```

Scroll. The bridge builds; scroll back and it disassembles.
`?p=0.54` jumps to a specific progress (smooth scroll disabled) for review.

Rebuild everything after editing the scene:

```bash
./scripts/build-hero.sh              # 400 frames, 24 samples, 1920 wide
./scripts/build-hero.sh 400 64 1920  # higher quality pass
```

## What is proven

| | |
|---|---|
| Chapter arc | wire → strand → tension → concrete → deck → bridge, one continuous shot |
| Camera | single dolly-back, 0.016 m → 400 m, **no cuts** |
| Zoom smoothness | rate varies 13.1 → 7.1 (1.84×), monotonic — no lurch under scrub |
| Scroll → frame | verified: `?p=0.54` → frame 216/400, progress bar 53.99% |
| Captions | 6 beats switch at the right progress |
| Atlas | tile index 216 matches frame 217 — indexing math correct |
| Weight | 400 frames, 14 KB avg, **11 MB total** (budget 30 MB) |
| Render | 3m50s for 400 frames @1080p, 24 samples |

## Known grey-box limitations

1. **Tension chapter (frames ~120–200) reads weakly.** The duct is translucent
   grey on grey. Needs an anchor head and visible strand-through-duct contrast.
2. **Concrete chapter still reads flat.** A 110 m beam broadside has no depth
   cue. Wants a ground plane, formwork edges, or a section cut.
3. **No ground/horizon.** Bridge chapters float in grey. A water plane and
   horizon would fix the scale read instantly.
4. **Single grey material.** Deliberate — but the strand should stay visually
   distinct from concrete throughout, likely via a warm accent on the steel.

## Next passes

- [ ] Add ground/water plane + horizon
- [ ] Strengthen the tension beat (anchor head, visible tendon)
- [ ] Section-cut the girder so the strand inside is unmistakable
- [ ] Model the real structure once chosen (recommend Marina Bayfront)
- [ ] Look-dev: steel vs concrete material split, accent on the strand
- [ ] Re-render at 64+ samples
- [ ] Mobile portrait re-frame (currently a centre crop, not a re-composition)
