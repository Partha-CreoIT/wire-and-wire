'use client';

import { useEffect, useRef } from 'react';
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

const overviewBodies = [
  'PC strand begins as geometry: a core wire with six helical outer wires built to carry tension inside concrete.',
  'Prestressing happens before service load arrives, placing controlled compression into beams, slabs and piles.',
  'PC wire feeds repeatable precast work: poles, square piles, sleepers and everyday concrete production.',
  'PC bar adds spiral-grooved reinforcement for spun poles and piles, quenched and tempered to the required mechanical profile.',
  'Galvanized strand and wire add zinc protection for exposed applications, fencing, cable systems and gabion work.',
  'Unbonded strand and other drawn wires extend the range into bridges, high-rise structures and manufacturing supply.',
];

function mountOnce(
  host: HTMLDivElement | null,
  config: Parameters<typeof mountLetsScroll>[1],
) {
  if (!host || host.dataset.swMounted) return;
  host.dataset.swMounted = '1';
  mountLetsScroll(host, config);
}

function familyTags(family: ProductFamily) {
  const tags = [family.label, `${family.applications.length} applications`];
  if (family.variants?.length) tags.push(`${family.variants.length} variants`);
  return tags;
}

export function ProductWorldFilm() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountOnce(ref.current, {
      nav: false,
      hint: 'scroll product story',
      diveScroll: 1.15,
      crossfade: 0.18,
      connectors: [],
      sections: productFilmPlan.map((beat, index) => {
        const asset = productFilmAssets[index];
        const family = productFamilies.find((item) => item.slug === beat.id);

        return {
          id: beat.id,
          label: beat.label,
          still: asset.poster,
          clip: asset.clip,
          accent: accents[index % accents.length],
          scroll: index === 0 || index === productFilmPlan.length - 1 ? 1.45 : 1.18,
          linger: index === 0 || index === productFilmPlan.length - 1 ? 0.36 : 0.22,
          eyebrow: 'Product cinematic',
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

  return <section ref={ref} className={styles.world} aria-label="Product cinematic story" />;
}

/* One cinematic scene only — the product's film clip as a short intro.
   The variants and applications are NOT repeated here as scenes; they live
   once in the catalogue below, indexed by the numbered rail. */
export function ProductFamilyWorldFilm({ family }: { family: ProductFamily }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const asset = productFilmAssetForFamily(family.slug);

    mountOnce(ref.current, {
      nav: false,
      hint: 'scroll into the catalogue',
      diveScroll: 1.05,
      crossfade: 0.18,
      connectors: [],
      sections: [
        {
          id: family.slug,
          label: family.name,
          still: asset.poster,
          clip: asset.clip,
          accent: accents[0],
          scroll: 1.6,
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
      aria-label={`${family.name} cinematic story`}
    />
  );
}
