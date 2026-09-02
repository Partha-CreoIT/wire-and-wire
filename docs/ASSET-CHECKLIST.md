# Asset checklist — hand this to the client

Tick as received. Drop files into `assets-source/<folder>/`.
Full context in `PLAN.md` §3.

## Blocking — nothing ships without these

- [ ] **Logo as vector** (`.ai` / `.eps` / `.svg`) → `brand/`
      *Most common project blocker. Chase first.*
- [ ] Brand colour values / any existing guideline → `brand/`
- [ ] DNS access for `wireproducts.cc` (TLS is mandatory — site is HTTP today)
- [ ] Approved company copy, **or** sign-off for us to rewrite the 2012 text
- [ ] Hero structure choice — one of the 23 landmarks
      *Recommended: Marina Bayfront Vehicular Bridge*

## Product / engineering — needed for an accurate 3D hero

- [ ] Strand geometry: wire Ø, lay length / pitch, 7-wire construction detail
- [ ] Strand diameters actually manufactured (12.7mm, 15.2mm, …)
- [ ] Tensile grade figures (e.g. 1,860 MPa) for the on-screen captions
- [ ] Product datasheets, per line → `documents/`
- [ ] Certifications: ISO, MS, BS/ASTM, test certs → `documents/`

## Photography — the highest-ROI spend after the hero

Shoot **RAW, 24MP+, tripod**. Full shot list in `PLAN.md` §3E.

- [ ] Factory / process — ~40 frames → `photography/factory/`
- [ ] Product studio — ~15 frames on seamless dark → `photography/product/`
      *Must include: strand end-on, dead centre, showing 7-wire geometry.
      This is the signature image of the whole site.*
- [ ] Projects — 5–8 frames each for as many of the 23 as possible
      → `photography/projects/<slug>/`
- [ ] Team headshots, consistent lighting → `photography/team/`
      *Mixed-quality headshots read as amateur faster than almost anything else.*

## Per-project data (for the 23 landmark pages)

For each landmark, ideally:

- [ ] Location, country, completion year
- [ ] Structure type (bridge / MRT / tower / highway / industrial)
- [ ] Which product was supplied
- [ ] Tonnage supplied, if disclosable
- [ ] Main contractor / developer, if nameable
- [ ] Photo rights confirmed for web publication

## Optional — strengthens it further

- [ ] Drone footage: factory or an active project site → `video/`
- [ ] Client / partner logos, with permission to display
- [ ] Short CEO video message
- [ ] Any awards, memberships, industry association marks

---

**Capture high, deliver low.** Shoot RAW and 4K; we downscale for the web.
The one exception: the scroll-scrubbed hero renders at 1920×1080, *not* 4K —
see `PLAN.md` §3F for why.
