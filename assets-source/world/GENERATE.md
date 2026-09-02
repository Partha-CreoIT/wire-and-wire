# Copy-paste generation guide — "Follow the Wire"

You render, I wire. **Stills in GPT (ChatGPT image generation), video legs in
Runway.** Save every finished file into `assets-source/world/renders/` with the
EXACT filename from the tables below, then tell me — I validate, encode for
scrubbing, and flip the page from placeholders to the real film.

> Do NOT put renders into `prompts/` — that folder is the prompts themselves.
> Renders go in `renders/`, names exactly as written (e.g. `still_mill.png`,
> `leg_1.mp4`).

---

## The 3 rules that make it seamless

1. **One tool for all four stills.** All in GPT, same chat style — mixing tools
   across scenes reads as style drift.
2. **Legs are strictly sequential.** Leg 1 starts on the mill still. Every later
   leg starts on the PREVIOUS leg's actual last frame — never on a fresh image.
   The extraction command is below; this is the whole trick that makes the film
   one unbroken shot.
3. **Before using a last frame, look at it.** It should read like a frame from a
   calm forward glide (no mid-orbit, no motion smear). If it doesn't, re-roll
   that leg before continuing — a bad handoff frame poisons every leg after it.

---

## Part 1 — Scene stills · GPT

**Spec (every still):** wide **3:2 landscape**, at least **1536 px wide** (GPT's
1536×1024 landscape is exactly right), background a flat solid **#F5F0EB**
across the whole frame, **no text/letters/logos anywhere**. Download at full
resolution, PNG preferred.

| # | Save as | Scene |
|---|---|---|
| S1 | `renders/still_mill.png` | wire-drawing mill |
| S2 | `renders/still_strand.png` | stranding plant |
| S3 | `renders/still_build.png` | viaduct construction site |
| S4 | `renders/still_skyline.png` | golden-hour skyline |

**If one comes back off-style** (different angle/palette/light than its
siblings), regenerate it in the same chat, attaching an approved sibling still
as a style reference.

### S1 · `still_mill.png`

```
Isometric low-poly 3D diorama floating as a small rounded island on a plain solid #F5F0EB background with a soft contact shadow beneath it. Soft matte clay 3D render, rounded toy-model shapes, gentle warm studio lighting, soft long shadows, tilt-shift miniature look. Cohesive color palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. Highly detailed, centered composition, absolutely no text, no letters, no numbers, no logos.
Render a wide 3:2 landscape image, at least 1536 px wide. The background stays a plain solid #F5F0EB across the whole frame — a completely empty backdrop: no sky, no clouds, no horizon, no gradient. Centered composition with a little headroom; the focal subject horizontally centred and nothing essential at the far left/right edges. Absolutely no text, no letters, no numbers, no logos.
Subject: a miniature wire-drawing mill — a long open-sided industrial hall with a sawtooth roof, the near side cut away to show the interior. Fat coils of dark steel rod feed in at one end; a single gleaming copper-toned wire runs through a row of small drawing-die machines and winds onto two tall spools at the other end. Two tiny workers in hard hats tend the line; a small forklift carries a finished spool across the floor.
```

### S2 · `still_strand.png`

```
Isometric low-poly 3D diorama floating as a small rounded island on a plain solid #F5F0EB background with a soft contact shadow beneath it. Soft matte clay 3D render, rounded toy-model shapes, gentle warm studio lighting, soft long shadows, tilt-shift miniature look. Cohesive color palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. Highly detailed, centered composition, absolutely no text, no letters, no numbers, no logos.
Render a wide 3:2 landscape image, at least 1536 px wide. The background stays a plain solid #F5F0EB across the whole frame — a completely empty backdrop: no sky, no clouds, no horizon, no gradient. Centered composition with a little headroom; the focal subject horizontally centred and nothing essential at the far left/right edges. Absolutely no text, no letters, no numbers, no logos.
Subject: a miniature wire-stranding plant — a large rotating strander machine, a drum-shaped cage with six wire bobbins arranged around a central axis, feeding six copper-toned wires that twist together around a core into one thick strand. The finished strand winds onto a giant reel with wide flanges; neat stacks of coiled strand sit beside it. One tiny worker with a clipboard inspects the reel.
```

### S3 · `still_build.png`

```
Isometric low-poly 3D diorama floating as a small rounded island on a plain solid #F5F0EB background with a soft contact shadow beneath it. Soft matte clay 3D render, rounded toy-model shapes, gentle warm studio lighting, soft long shadows, tilt-shift miniature look. Cohesive color palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. Highly detailed, centered composition, absolutely no text, no letters, no numbers, no logos.
Render a wide 3:2 landscape image, at least 1536 px wide. The background stays a plain solid #F5F0EB across the whole frame — a completely empty backdrop: no sky, no clouds, no horizon, no gradient. Centered composition with a little headroom; the focal subject horizontally centred and nothing essential at the far left/right edges. Absolutely no text, no letters, no numbers, no logos.
Subject: a miniature bridge construction site — a partly built concrete viaduct on tall piers, one span still open showing copper-toned strand running through curved ducts in the deck. A small crane lifts a concrete segment, a compact tensioning jack sits on the deck edge, tiny workers in hard hats guide the strand, and stacked strand coils and a little site cabin sit on the ground below.
```

### S4 · `still_skyline.png`

```
Isometric low-poly 3D diorama floating as a small rounded island on a plain solid #F5F0EB background with a soft contact shadow beneath it. Soft matte clay 3D render, rounded toy-model shapes, gentle warm studio lighting, soft long shadows, tilt-shift miniature look. Cohesive color palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. Highly detailed, centered composition, absolutely no text, no letters, no numbers, no logos.
Render a wide 3:2 landscape image, at least 1536 px wide. The background stays a plain solid #F5F0EB across the whole frame — a completely empty backdrop: no sky, no clouds, no horizon, no gradient. Centered composition with a little headroom; the focal subject horizontally centred and nothing essential at the far left/right edges. Absolutely no text, no letters, no numbers, no logos.
Subject: a miniature city waterfront in warm golden light — an elegant cable-stayed bridge with a single tall pylon crossing calm water, a cluster of slender modern high-rise towers behind it, and a curving elevated highway sweeping between them with tiny cars. Serene, finished, quietly monumental: the city the wire holds up.
```

---

## Part 2 — Video legs · Runway

**Model & quality:** use Runway's **image-to-video with a start frame**.
Preference order: **Seedance 2.5 at 1080p** if your credits can pay for it
(it's the model family this pipeline was designed around — locks the first
frame hard), otherwise **Gen-4 Turbo**. Verify the credit price shown in-app
before running.

**Finding the start-image slot in the new Agent chat UI:** either upload the
image via the **⬆ icon / +** in the prompt box and prepend *"Use the attached
image as the exact first frame of the video."* to the prompt — or, cleaner, go
to left sidebar → **Tool** → video generation, which has a dedicated
first-frame image slot plus explicit aspect/duration/resolution settings.
After your FIRST leg, scrub to frame 0 and confirm it is literally your
uploaded image (not a look-alike): if the model treated it as a loose style
reference, switch to the Tool slot — chained seams can't lock otherwise.

Settings per leg:

- Input image: the file named in the table (this becomes frame 0 — Runway
  honours it, which is exactly what we need)
- Aspect **16:9** · Duration **10 s** · highest resolution offered
- No audio needed (the page mutes everything anyway)
- Export/download as **MP4**, highest quality offered

**Your 500 credits, planned** (verify against in-app pricing): Gen-4 Turbo is
~5 credits/second → a 10 s leg ≈ **50 credits**. Four legs ≈ 200, leaving ~300
for re-rolls — that's comfortable. Avoid the non-turbo "quality" tier
(~12 cr/sec → 480 for four legs, zero headroom). If a leg you like looks soft,
Runway's Video Upscale (~2 cr/sec) on just the keepers is a good spend —
optional.

**The sequential handoff.** After each leg, extract its last frame to use as
the next leg's input image. From the repo root:

```bash
ffmpeg -sseof -0.15 -i assets-source/world/renders/leg_1.mp4 -frames:v 1 -q:v 2 assets-source/world/renders/start_2.png
ffmpeg -sseof -0.15 -i assets-source/world/renders/leg_2.mp4 -frames:v 1 -q:v 2 assets-source/world/renders/start_3.png
ffmpeg -sseof -0.15 -i assets-source/world/renders/leg_3.mp4 -frames:v 1 -q:v 2 assets-source/world/renders/start_4.png
```

(Or just drop each leg into `renders/` and tell me — I'll extract and check the
frame for you before you spend the next 50 credits.)

| # | Input image | Prompt | Save as |
|---|---|---|---|
| L1 | `renders/still_mill.png` | below | `renders/leg_1.mp4` |
| L2 | `renders/start_2.png` ← extracted from leg_1 | below | `renders/leg_2.mp4` |
| L3 | `renders/start_3.png` ← extracted from leg_2 | below | `renders/leg_3.mp4` |
| L4 | `renders/start_4.png` ← extracted from leg_3 | below | `renders/leg_4.mp4` |

### L1 · `leg_1.mp4` (input: `still_mill.png`)

```
Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. Tracking low and level alongside the wire-drawing line, coils, dies and spools sliding past in parallax. The camera moves into the miniature wire mill toward the gleaming copper wire winding onto its tall spool. In the final second, settle back into a slow, steady forward glide toward the open end of the hall. Soft matte clay diorama, tilt-shift miniature, warm light, cohesive palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. The backdrop stays a plain solid #F5F0EB the whole time — completely empty, no sky, no clouds, no horizon. Smooth, graceful, slow motion, subtle parallax. No text, no captions.
```

### L2 · `leg_2.mp4` (input: `start_2.png`)

```
Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. Pushing in close to the rotating strander cage until the six twisting wires nearly fill the frame, then easing gently back out. The camera moves into the miniature stranding plant toward the giant reel winding up the finished strand. In the final second, settle back into a slow, steady forward glide toward the open doorway at the far end. Soft matte clay diorama, tilt-shift miniature, warm light, cohesive palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. The backdrop stays a plain solid #F5F0EB the whole time — completely empty, no sky, no clouds, no horizon. Smooth, graceful, slow motion, subtle parallax. No text, no captions.
```

### L3 · `leg_3.mp4` (input: `start_3.png`)

```
Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. Rising smoothly in a gentle crane-up as the full scale of the viaduct construction site reveals below — piers, deck, crane and tiny workers. The camera moves across the miniature site toward the open span where copper strand runs through its ducts. In the final second, settle back into a slow, steady forward glide toward the distant edge of the site. Soft matte clay diorama, tilt-shift miniature, warm light, cohesive palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. The backdrop stays a plain solid #F5F0EB the whole time — completely empty, no sky, no clouds, no horizon. Smooth, graceful, slow motion, subtle parallax. No text, no captions.
```

### L4 · `leg_4.mp4` (input: `start_4.png`)

```
Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. Climbing in a gentle arc over the calm water, then swooping slowly down toward the cable-stayed bridge, arriving to face the golden miniature skyline with its towers and curving highway. In the final second, settle into a very slow, steady forward drift toward the bridge. Soft matte clay diorama, tilt-shift miniature, warm light, cohesive palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. The backdrop stays a plain solid #F5F0EB the whole time — completely empty, no sky, no clouds, no horizon. Smooth, graceful, slow motion, subtle parallax. No text, no captions.
```

⚠️ Heads-up for L2→L3: the camera arrives at the *strand plant* at the end of
L2 but L3 is the *construction site*. That jump is carried by the extracted
start frame + the prompt ("the camera moves across the miniature site…") — if
Runway refuses to leave the previous scene on a leg, tell me and I'll rewrite
that prompt with a stronger transition clause. Same for L3→L4.

---

## Checklist before handing a leg back

- [ ] Frame 0 is visibly the input image (Runway does this by default)
- [ ] 16:9, 10 s, MP4
- [ ] The final second is a calm forward drift — no half-finished orbit, no smear
- [ ] Named exactly `leg_N.mp4`, in `assets-source/world/renders/`

## What happens when you're done (my side)

I validate every file (aspect/size/frame-0 match against the handoff frame),
encode the legs for scrubbing (`crf 20`, GOP 8, faststart), overwrite the
placeholder posters in `public/world/` from your stills, set
`FILM_READY = true` in `components/WorldFilm.tsx`, and QA every seam in the
browser. You can hand things back in any order/batches — stills first is ideal,
since leg 1 needs `still_mill.png`.

---

## Part 3 — Product shots · GPT (optional, for the Products section)

Five product images for the cards under "What we make". Same spec as the scene
stills: **3:2 landscape, ≥1536 px, solid #F5F0EB background, no text**. Save
into `renders/` with these names, tell me, and I'll convert + wire them
(`PRODUCT_IMAGES = true` in `components/ContentSections.tsx`):

| # | Save as | Product |
|---|---|---|
| P1 | `renders/product_pc-strand.png` | PC strand coil |
| P2 | `renders/product_pc-wire.png` | PC wire spool |
| P3 | `renders/product_pc-bar.png` | PC bar bundle |
| P4 | `renders/product_galvanised.png` | galvanised strand |
| P5 | `renders/product_other-wires.png` | assorted wire spools |

Shared style line (keep identical in all five, matching the film's world):

```
Miniature product still-life in soft matte clay-model style on a plain solid #F5F0EB background with a soft contact shadow, gentle warm studio lighting, tilt-shift look, cohesive palette of warm copper #BE752D, warm paper #F5F0EB, graphite steel #5A6068, concrete grey #C9C4BB, charcoal #16181C. Render a wide 3:2 landscape image, at least 1536 px wide, completely empty backdrop, centered composition, absolutely no text, no letters, no numbers, no logos.
```

Then add one subject line per image:

- **P1:** `Subject: a neatly wound coil of seven-wire pre-stressed concrete steel strand, the helical wires clearly visible, one strand end elegantly uncoiling toward the camera.`
- **P2:** `Subject: a tall spool of gleaming high-tensile steel wire, tightly and precisely wound, a single wire running off the top of the spool.`
- **P3:** `Subject: a bundle of straight steel PC bars with subtle spiral grooves, stacked in a neat hexagonal pile, cut ends facing the camera.`
- **P4:** `Subject: a short length of galvanised steel strand with a bright zinc finish, its seven twisted wires splayed open at one end to show the construction.`
- **P5:** `Subject: three small spools of different wires side by side — copper-toned welding wire, PVC-coated colour steel wire in muted tones, and plain galvanised iron wire.`
