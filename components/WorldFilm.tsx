'use client';

import { useEffect, useRef } from 'react';
import { mountLetsScroll } from '@/lib/lets-scroll-engine';

/**
 * "Follow the Wire" — the lets-scroll world film.
 *
 * Flip FILM_READY to true once the Higgsfield legs are rendered and encoded
 * into public/world/vid/leg-{1..4}.mp4 (assets-source/world/HANDOFF.md is the
 * runbook). Until then the engine runs in still mode: the placeholder scenes
 * cross-dissolve and parallax under the same scroll mapping the film will use,
 * so pacing and copy are already final.
 */
const FILM_READY = true;

const clip = (n: number) => (FILM_READY ? `/world/vid/leg-${n}.mp4` : undefined);

const COPPER = '#BE752D';

export function WorldFilm() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || host.dataset.swMounted) return;
    host.dataset.swMounted = '1'; // StrictMode double-invoke guard

    mountLetsScroll(host, {
      nav: false, // single wayfinding pattern: the labelled route rail
      hint: 'scroll to follow the wire',
      diveScroll: 1.5,
      connectors: [], // architecture A — the legs ARE the journey
      sections: [
        {
          id: 'mill',
          label: 'The Mill',
          still: '/world/mill.webp',
          clip: clip(1),
          accent: COPPER,
          scroll: 1.7,
          linger: 0.35,
          eyebrow: 'Tension steel',
          title: 'The strength you never see.',
          body:
            'Inside every pre-stressed bridge, tower and highway is ' +
            'high-carbon steel wire under tension. Making it is all we do.',
          tags: ['Kuala Lumpur, Malaysia', 'PC strand · wire · bar'],
        },
        {
          id: 'strand',
          label: 'The Strand',
          still: '/world/strand.webp',
          clip: clip(2),
          accent: COPPER,
          scroll: 1.4,
          eyebrow: 'Drawn & wound',
          title: 'Seven wires, one strand.',
          body:
            'Six wires laid helically around a core — pre-stressed concrete ' +
            'strand rated to 1,860 MPa, plain or galvanised.',
          tags: ['PC strand', 'PC wire', 'Galvanised'],
        },
        {
          id: 'build',
          label: 'The Build',
          still: '/world/build.webp',
          clip: clip(3),
          accent: COPPER,
          scroll: 1.5,
          linger: 0.3,
          eyebrow: 'Under tension',
          title: 'Cast into the bones of the build.',
          body:
            'On site, strand is threaded, stressed to hundreds of tonnes and ' +
            'anchored — so concrete can span further and carry more.',
          tags: ['Bridges & viaducts', 'Elevated highways', 'High-rise'],
        },
        {
          id: 'skyline',
          label: 'The Skyline',
          still: '/world/skyline.webp',
          clip: clip(4),
          accent: COPPER,
          scroll: 1.8,
          linger: 0.45,
          eyebrow: '23 landmarks',
          title: 'Inside structures you already know.',
          body:
            'KL Convention Centre. Marina Bayfront Bridge. Boon Lay MRT. ' +
            'From Malaysia to Abu Dhabi, our steel quietly holds them up.',
          cta: {
            primary: { label: 'Enquire now', href: 'mailto:info@wireproducts.cc' },
            secondary: { label: '+603 6419 6995', href: 'tel:+60364196995' },
          },
        },
      ],
    });
  }, []);

  return <div ref={ref} />;
}
