# Generation runbook — "Follow the Wire"

Status on 2026-09-03: **SHIPPED.** Stills rendered by the user in GPT; the 4-leg
video chain rendered via the Kling MCP (`kling-video-v3_0_turbo`, 10 s, 1080p,
100 credits/leg, 400 total; raw masters in `renders/leg_*.mp4`). All seams
frame-locked ≥33 dB; page in film mode (`FILM_READY = true`). The Higgsfield MCP path below stays as the automatic alternative —
it was blocked because the connected workspace (`c6e823ad… private`) is on the
**free plan with 0 credits** (`gpt_image_2`: *"Requires basic plan or higher"*).
Everything downstream (page, engine, config) is already wired — the placeholder
stills in `public/world/` just get overwritten and the clips dropped in.

## Spec table

| # | Prompt file | Conditioning | Model / params | Output | Status |
|---|---|---|---|---|---|
| S1 | `prompts/still_mill.txt` | — | `gpt_image_2` 3:2, 2k, high | `public/world/mill.webp` (poster) | ✅ accepted (GPT render) |
| S2 | `prompts/still_strand.txt` | — | same | `public/world/strand.webp` | ✅ accepted (GPT render) |
| S3 | `prompts/still_build.txt` | — | same | `public/world/build.webp` | ✅ accepted (GPT render) |
| S4 | `prompts/still_skyline.txt` | — | same | `public/world/skyline.webp` | ✅ accepted (GPT render) |
| L1 | `prompts/leg_1_mill.txt` | `start_image` = S1 still | `seedance_2_5`, 16:9, 1080p, 8 s, `generate_audio:false`, mode `omni_reference` | `public/world/vid/leg-1.mp4` | ✅ Kling v3.0-turbo, seam 33.8 dB |
| L2 | `prompts/leg_2_strand.txt` | `start_image` = **L1's actual last frame** | same | `public/world/vid/leg-2.mp4` | ✅ Kling v3.0-turbo, seam 38.3 dB |
| L3 | `prompts/leg_3_build.txt` | `start_image` = **L2's actual last frame** | same | `public/world/vid/leg-3.mp4` | ✅ Kling v3.0-turbo, seam 39.8 dB |
| L4 | `prompts/leg_4_skyline.txt` | `start_image` = **L3's actual last frame** | same | `public/world/vid/leg-4.mp4` | ✅ re-rolled on Kling v3.0 with `tail_image` = generated 4K miniature-KL still (renders/kl_city_4k.png): start seam 39.6 dB, end lands on the KL vista at 30.5 dB |

Architecture A: **no connectors, no end-images.** Legs render strictly in order —
each start frame is extracted from the previous leg's rendered file, never from a
still. That is the seam law; skipping it produces a visible pop.

## Sequence (Higgsfield MCP)

1. **Stills (parallel):** `generate_image_batch` with the four `still_*.txt` prompts —
   `model: gpt_image_2, aspect_ratio: "3:2", resolution: "2k", quality: "high"`.
   Poll with `jobs_wait`; download result URLs. Review as a set: same angle, palette,
   light — re-roll any off-style still (optionally passing an approved sibling with
   role `image`).
2. **Leg 1:** upload S1 via `media_upload` (PUT bytes, then `media_confirm`), then
   `generate_video` `model: seedance_2_5, mode: omni_reference, medias: [{role:
   "start_image", value: <media_id>}], aspect_ratio: "16:9", resolution: "1080p",
   duration: 8, generate_audio: false`, prompt = `leg_1_mill.txt`.
3. **Chain legs 2–4 (sequential):** after each leg downloads,
   `ffmpeg -sseof -0.15 -i leg-N.mp4 -frames:v 1 -q:v 2 last_N.png` → **eyeball it**
   (must read as a calm forward glide, no half-finished move — re-roll the leg if
   not) → upload → next leg with it as `start_image`.
4. **Encode** every leg for scrubbing:
   `ffmpeg -i src.mp4 -an -vf "unsharp=5:5:0.8:5:5:0.0" -c:v libx264 -preset slow
   -crf 20 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart
   public/world/vid/leg-N.mp4`
5. **Posters:** overwrite the placeholder `public/world/<scene>.webp` with each
   scene's still (`cwebp`/PIL, q 85, 2400 px wide is plenty).
6. **Flip the page to film mode:** in `components/WorldFilm.tsx` set
   `FILM_READY = true`. The config already points at the paths above.
7. **QA the seams** (SKILL Step 8): screenshot just before/after each seam — judge by
   composition, not PSNR; check `video.seekable.end(0) > 0`; check reduced-motion
   falls back to stills.

Budget: 4 stills + 4 legs (+ ~15% re-roll headroom; interiors can trip the NSFW
filter — re-roll, then strip trigger words, then `kling3_0` with the same start
frame as last resort). Costs weren't measurable on the free plan — preflight one
still and one leg with `get_cost: true` after the account is fixed, and state the
total before running the batch.

Mobile (optional follow-up): a second native 9:16 chain (~2× video spend) — portrait
stills, portrait legs chained the same way, encoded 720 wide `-g 4`, wired as
`stillMobile`/`clipMobile`. Never ship the centre-crop as "the mobile version."
