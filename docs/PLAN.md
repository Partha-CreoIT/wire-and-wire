# Wire & Wire Products — Award-Grade Website
**Plan v1 · 2026-09-02**

---

## 1. Where we are

`wireproducts.cc` audited 2026-09-02. Screenshot: `reference/current-site-2026-09-02.png`.

| | Current |
|---|---|
| Platform | Joomla · **content last updated 20 July 2012** |
| Layout | Fixed-width boxed, non-responsive |
| Visual | Sepia/orange gradient banner, beveled panels, jQuery rotator |
| Media | 18 images, largest ~400px. No video. |
| i18n | Google Translate widget, 50 languages (an SEO liability, not an asset) |
| Security | **HTTP only** — no TLS |
| Performance | Untested, but unoptimised by construction |

**The content, however, is excellent and under-sold.** Four product lines
(PC Strand, PC Wire, PC Bar, Galvanised Strand & Wire), 100+ years of combined
management experience, and **23 landmark projects** — KL Convention Centre,
Marina Bayfront Vehicular Bridge, Boon Lay MRT Extension, Fusionopolis,
Shell ethylene cracker complex, Al Reem Island, NTU Alumni, Southern Express
Highway.

That last list is the single most valuable asset the company owns and the
current site buries it in a text menu.

---

## 2. The concept

> **"The strand you never see."**

Wire & Wire makes the pre-stressed steel that lives *inside* concrete. It is
invisible in every finished structure — and it is the reason the structure
stands. The whole site is built on making the invisible visible.

**The hero scroll sequence — one continuous shot, driven entirely by scroll:**

| Scroll | What the viewer sees | Caption beat |
|---|---|---|
| 0–15% | Extreme macro. A single steel wire, rotating. Light travels along it. | *It starts as wire.* |
| 15–30% | Camera pulls back. Seven wires helically twist into a 7-wire PC strand. | *Seven wires. One strand.* |
| 30–45% | Strand is threaded through a duct. Tension is applied — it goes taut. | *Tensioned to 1,860 MPa.* |
| 45–65% | Concrete forms cast around it, then turn translucent revealing the strand grid. | *Concrete takes the compression.* |
| 65–85% | Camera pulls back further. A bridge deck assembles segment by segment. | *The strand takes the tension.* |
| 85–100% | Full pull-back to a finished cable-stayed bridge at dusk. Strand glows inside. | *23 landmarks. One foundation.* |

The viewer scrolls and **builds the bridge**. Scroll back and it disassembles.
That reversibility is what makes it feel like a tool rather than a video, and
it is only possible with a scrubbed frame sequence.

**Why this wins:** it is not decoration. It is the clearest possible
explanation of what the company sells, and no competitor in the region has
anything close.

---

## 3. What you need to supply — the asset checklist

This is the answer to *"tell me what all you need."* Ordered by how badly the
project is blocked without it.

### 3A. Critical — blocks the hero

| # | Item | Detail | Who |
|---|---|---|---|
| 1 | **Blender installed** | Free. `brew install --cask blender`. Not currently on this machine. | Me, once approved |
| 2 | **Product geometry reference** | Strand pitch/lay length, wire Ø, 7-wire construction, actual strand diameters (12.7mm / 15.2mm etc.) | You / engineering |
| 3 | **A hero structure to model** | Pick ONE from the 23. Recommend **Marina Bayfront Vehicular Bridge** — cable-stayed reads instantly and is visually dramatic. | You (decision) |
| 4 | **Reference photos of that structure** | 10–20 from any angle, for modelling accuracy. Web images are fine at this stage. | Me (can source) |

### 3B. Critical — blocks everything else

| # | Item | Detail |
|---|---|---|
| 5 | **Logo as vector** | `.ai`, `.eps`, or `.svg`. The current PNG is 400px and unusable at scale. **This is the most common project blocker — please chase it first.** |
| 6 | **Brand colours** | If a guideline exists. Otherwise I'll derive a palette from the logo and propose it. |
| 7 | **Approved company copy** | Or approval for me to rewrite the 2012 text. Current copy is serviceable but dated in tone. |
| 8 | **Domain + hosting decision** | `wireproducts.cc` DNS access. **TLS is mandatory** — the site is HTTP-only today. |

### 3C. High value — makes it credible

| # | Item | Detail |
|---|---|---|
| 9 | **Factory photography** | See shot list §3E. The single biggest lift after the hero. |
| 10 | **Project photography** | Even 5–8 of the 23 landmarks, properly shot or licensed. |
| 11 | **Certifications** | ISO, MS, BS/ASTM compliance marks, test certificates. Institutional buyers look for these first. |
| 12 | **Product datasheets** | PDF specs per product line — real B2B conversion drivers. |
| 13 | **Team photos** | Consistent headshots for the CEO / team pages. Mixed-quality photos read as amateur faster than almost anything else. |

### 3D. Optional — nice to have

| # | Item |
|---|---|
| 14 | Drone footage of the factory or an active project site |
| 15 | Named client logos (with permission) |
| 16 | A short CEO video message |

### 3E. Photography shot list

Give this to whoever shoots. **RAW, 24MP+, tripod.**

**Factory / process (~40 frames)**
- Coil storage — rows of wire coils, wide, symmetrical
- Wire drawing machine in motion (slow shutter for motion streaks)
- Stranding machine — the twist happening, close
- Macro: cut cross-section of 7-wire strand showing the core wire
- Macro: galvanised surface texture, raking light
- QC lab — tensile testing rig under load
- Coil banding / despatch, forklift, warehouse scale
- Workers in PPE, hands-on-product (never posed-to-camera)

**Product (~15 frames, studio)**
- Each of the 4 product lines on seamless dark background, raking light
- Strand end-on, dead centre, showing the 7-wire geometry — **this is your signature image**
- Scale reference shots (strand in hand)

**Projects (~5–8 per landmark)**
- Wide establishing, golden hour
- Structural detail — the part their strand is inside
- Human scale reference

### 3F. On "4K" — an important correction

You asked about 4K. Two different answers:

- **For the scroll-scrubbed hero: do NOT use 4K.** Render frames at **1920×1080**.
  A scrubbed canvas is viewport-sized and capped at DPR 1.5, so 4K frames cost
  ~4× the bytes for zero visible gain. 400 frames at 1920 ≈ 25MB streamed
  progressively; at 4K it would be ~100MB and would stutter. Ship a separate
  **1080×1920 portrait set** for mobile — never letterbox the desktop set.
- **For photography and any b-roll: yes, capture as high as possible.** Shoot
  RAW / 4K, then downscale for delivery. Capture high, deliver low.

---

## 4. Tech stack

Next.js is the right call — confirmed.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15, App Router** | ~25 mostly-static pages, SEO-critical, static export possible |
| Language | TypeScript | |
| Styling | CSS Modules + design tokens | Tokens ship in the `scroll-site` skill; no Tailwind needed for a bespoke design |
| Scroll | **Lenis 1.3** + **GSAP 3.15 / ScrollTrigger / SplitText** | All GSAP plugins free for commercial use since Apr 2025 |
| Hero scrub | Canvas 2D `FilmScrubber` + web worker | From the `scroll-story` skill — do not rewrite |
| Content | MDX first; Sanity/Payload if the client needs to self-edit | Decide at Phase 3 — 23 project pages is the threshold where a CMS pays off |
| Images | `next/image`, AVIF + WebP | |
| Hosting | Vercel | Edge CDN matters — the audience is MY/SG/ID/AE |
| Analytics | Vercel Analytics + GSC | |

**Already installed on this machine:** Node 22.23.1 · npm 10.9.8 · bun 1.3.13 ·
ffmpeg 8.1.1 · git 2.53.0.
**Missing:** Blender. **Disk: 28GB free** — enough, but frame renders should be
cleaned between iterations.

---

## 5. Hero production pipeline

```
Blender scene  (bridge + PC strand, 6 chapters, ONE continuous camera move)
      ↓  render 400 frames @ 1920×1080, EEVEE Next
      ↓  render 400 frames @ 1080×1920 (portrait camera, same animation)
scripts/make-frames.sh   →  WebP q82 + 12-col atlas placeholder
      ↓
public/film/{d,m}/001..400.webp + {d,m}-atlas.webp
      ↓
FilmScrubber (canvas + worker, nearest-to-scroll priority loading)
      ↓
pinnedScene() — ScrollTrigger pin, 500vh, scrub 0.3
```

**Rules that make it scrub well** (scrubbing exposes every frame at rest —
flaws that playback hides become obvious):

- **One continuous camera move.** No cuts, ever.
- **400 frames minimum.** Below ~300, stepping becomes visible.
- **Slow, even camera speed.** Any lurch is magnified by scrubbing.
- **Nothing moving except the camera and the construction itself.** No flags,
  no traffic, no people walking — they shimmer under scrub.
- **Locked look across all chapters** — same HDRI, same grade, same lens.
- **Frame budget: 40–120KB each.** Over that, drop quality to 78 or scale to 1600w.

**Fallbacks (non-negotiable):**
- `prefers-reduced-motion` → 6 static keyframe images, normal scroll, no pin
- No JS → frame 001 as a plain `<img>`
- Mobile → portrait frame set, or static keyframes below 820px if perf demands

---

## 6. Site architecture

```
/                        Home — the scroll story
/products                Overview, 4 lines
  /pc-strand             + applications, specs, datasheet
  /pc-wire
  /pc-bar
  /galvanised            strand & wire
/projects                Filterable grid of all 23 — the credibility engine
  /[slug]                Templated: hero image, structure type, year,
                         location, product supplied, tonnage, gallery
/about                   Company, 100-year experience story
  /leadership            CEO message + team
  /governance
  /csr
/investors
/contact                 Enquiry form + corporate directory
```

**Kill the Google Translate widget.** Replace with proper `next-intl` routes
for **EN + Bahasa Malaysia** only. 50 machine-translated languages hurt SEO
and signal low quality; two well-done languages signal the opposite.

---

## 7. Phases

Homepage-first, as agreed.

### Phase 1 — Homepage + design system *(the big bet)*
1. Install Blender; block out the bridge + strand scene
2. Design system: tokens, type scale, grid, signature motif → `/design-consultation`
3. Next.js scaffold, Lenis + GSAP motion layer wired
4. **Grey-box the hero first** — untextured render, 400 frames, wired to scroll.
   Proves the scrub feel before any lighting or texturing time is spent.
5. Full render, captions, remaining homepage sections
6. Review gate → approve or iterate

### Phase 2 — Products
4 line pages + applications, spec tables, datasheet downloads, enquiry CTA.

### Phase 3 — Projects
The 23 landmarks. Templated + filterable by structure type / country / year.
**CMS decision happens here.**

### Phase 4 — About / leadership / governance / CSR
Needs team photography to be done first.

### Phase 5 — Investors, contact, i18n, launch
TLS, redirects from all Joomla URLs, sitemap, schema.org `Organization` +
`Product`, GSC, analytics.

**Timeline is deliberately not fixed here** — it depends almost entirely on how
fast §3A–3B assets arrive. The hero render is the long pole in Phase 1.

---

## 8. Design direction

Institutional and engineered, not flashy. The reference language is technical
documentation, not a startup landing page.

- **Palette:** dark steel ground (near-black), warm off-white paper, ONE accent
  drawn from the existing logo's copper/bronze. Three bases + generated alpha
  ramps — no ad-hoc `rgba()`.
- **Type:** one grotesque for display, one narrow face for uppercase technical
  labels. Tracking tightens as size grows.
- **Motif:** corner registration pins (already built into the tokens) — reads as
  measured and precise, which is exactly the brand promise.
- **Numbers everywhere.** `1,860 MPa`, `23 projects`, `100+ years`, `7 wires`.
  Specificity is what makes an industrial brand credible.
- **Rhythm:** alternate entrance / scrub / pin / rest sections. Never two
  consecutive sections with the same motion.

Anti-patterns to avoid: purple-blue gradients, glassmorphism, emoji icons,
centred everything, stock photos of handshakes.

---

## 9. Budgets

| Metric | Target |
|---|---|
| LCP | < 2.0s on 4G |
| CLS | < 0.05 |
| Lighthouse Perf | ≥ 90 desktop, ≥ 80 mobile |
| Hero atlas visible | < 1s — canvas must never be blank |
| Total hero frames | ≤ 30MB, streamed, never preloaded |
| Scroll | 60fps at 4× CPU throttle |
| Accessibility | WCAG 2.2 AA |

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Vector logo doesn't exist** | High | Chase now. Budget for a redraw if needed. |
| **No good photography exists** | High | Factory shoot is the highest-ROI spend on this project. |
| Hero render iteration overruns | Med | Grey-box first. Approve motion before texturing. |
| 3D looks amateur | Med | Keep it stylised-technical (wireframe/x-ray language), not photoreal. Stylisation hides flaws; photoreal exposes them. |
| Client can't self-edit | Med | CMS decision at Phase 3 with real page count known. |
| 28GB disk during renders | Low | Clean frame dirs between iterations. |
| Project photo rights | Med | Confirm permissions per landmark before publishing. |

---

## 11. Immediate next actions

**You:**
1. Chase the **vector logo** — the most likely blocker
2. Pick the hero structure (recommend Marina Bayfront Vehicular Bridge)
3. Confirm whether a factory photo shoot is possible, and the budget
4. Confirm DNS access for `wireproducts.cc`
5. Send any certifications / datasheets that exist

**Me, on your go-ahead:**
1. `brew install --cask blender`
2. Scaffold the Next.js app + design tokens + motion layer
3. Grey-box the hero: 400 untextured frames, wired to scroll
4. Run `/design-consultation` and put a palette + type system in front of you

**Decision needed before Phase 1 code:** hero structure choice, and whether I
should rewrite the company copy or work from client-approved text.
