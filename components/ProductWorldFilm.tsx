'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { mountLetsScroll } from '@/lib/lets-scroll-engine';
import {
  productFamilies,
  productFilmPlan,
  type ProductFamily,
} from '@/lib/siteContent';
import {
  productFilmAssetForFamily,
  productFilmAssets,
} from '@/lib/media';
import styles from './ProductWorldFilm.module.css';

const accents = ['#be752d', '#4f7a86', '#7a8f4d', '#a24d43', '#5c8969', '#7a6447'];
const overviewScroll = productFilmPlan.map((_, index) => index === 0 || index === productFilmPlan.length - 1 ? 1.45 : 1.18);
const familyScroll = 1.6;

function initialTrackStyle(spans: number[]): CSSProperties {
  return { '--film-track-height': `${(spans.reduce((sum, span) => sum + span, 1)) * 100}dvh` } as CSSProperties;
}

const overviewBodies = [
  'PC strand begins as geometry: a core wire with six helical outer wires built to carry tension inside concrete.',
  'Prestressing is the process of tensioning PC strand before the concrete carries service loads, placing controlled compression into the finished member.',
  'PC wire feeds repeatable precast work: poles, square piles, sleepers and everyday concrete production.',
  'PC bar adds spiral-grooved reinforcement for spun poles and piles, quenched and tempered to the required mechanical profile.',
  'Galvanized strand and wire add zinc protection for exposed applications, fencing, cable systems and gabion work.',
  'Unbonded PC strand combines corrosion-resistant grease with HDPE sheathing for use in bridges, high-rise structures and foundations.',
];

function mountFilm(
  host: HTMLDivElement | null,
  config: Parameters<typeof mountLetsScroll>[1],
) {
  if (!host) return;
  return mountLetsScroll(host, config);
}

function familyTags(family: ProductFamily) {
  const tags = [family.label, `${family.applications.length} applications`];
  if (family.variants?.length) tags.push(`${family.variants.length} variants`);
  return tags;
}

export function ProductWorldFilm() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    return mountFilm(ref.current, {
      nav: false,
      route: false,
      hint: false,
      diveScroll: 1.15,
      crossfade: 0.18,
      connectors: [],
      sections: productFilmPlan.map((beat, index) => {
        const asset = productFilmAssets[index];
        const family = productFamilies.find((item) => item.slug === beat.familySlug);

        return {
          id: beat.id,
          label: beat.label,
          still: asset.poster,
          clip: asset.clip,
          clipMobile: asset.clipMobile,
          accent: accents[index % accents.length],
          scroll: overviewScroll[index],
          linger: index === 0 || index === productFilmPlan.length - 1 ? 0.36 : 0.22,
          eyebrow: beat.label,
          title: beat.title,
          body: overviewBodies[index],
          tags: family ? familyTags(family).slice(0, 3) : ['Wire & Wire'],
          cta:
            index === productFilmPlan.length - 1
              ? {
                  primary: { label: 'View products', href: '#product-archive' },
                  secondary: { label: 'Contact', href: '/contact' },
                }
              : undefined,
        };
      }),
    });
  }, []);

  return (
    <section
      ref={ref}
      className={styles.world}
      style={initialTrackStyle(overviewScroll)}
      data-film-tone="dark"
      aria-label="Products and applications"
    />
  );
}

/* One cinematic scene only — the product's film clip as a short intro.
   The variants and applications are NOT repeated here as scenes; they live
   once in the catalogue below, indexed by the numbered rail. */
export function ProductFamilyWorldFilm({ family }: { family: ProductFamily }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const asset = productFilmAssetForFamily(family.slug);

    return mountFilm(ref.current, {
      nav: false,
      route: false,
      hint: false,
      diveScroll: 1.05,
      crossfade: 0.18,
      connectors: [],
      sections: [
        {
          id: family.slug,
          label: family.name,
          still: asset.poster,
          clip: asset.clip,
          clipMobile: asset.clipMobile,
          accent: accents[0],
          scroll: familyScroll,
          linger: 0.38,
          eyebrow: family.label,
          title: family.name,
          body: family.summary,
          tags: familyTags(family),
          cta: {
            primary: { label: 'Open the catalogue', href: '#product-data' },
            secondary: { label: 'All products', href: '/products' },
          },
        },
      ],
    });
  }, [family]);

  return (
    <section
      ref={ref}
      className={`${styles.world} ${styles.familyWorld}`}
      style={initialTrackStyle([familyScroll])}
      data-film-tone="dark"
      aria-label={`${family.name} cinematic story`}
    />
  );
}
