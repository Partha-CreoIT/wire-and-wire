'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export function CsrGalleryMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-csr-card]'));

      if (reduce) {
        gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { autoAlpha: 0, y: 34, scale: 0.99 });

      cards.forEach((card, index) => {
        const media = card.querySelector<HTMLElement>('[data-csr-media]');
        const image = card.querySelector<HTMLImageElement>('img');
        const observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;

            gsap.to(card, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.82,
              delay: (index % 4) * 0.04,
              ease: 'power3.out',
              overwrite: 'auto',
            });
            observer.disconnect();
          },
          { rootMargin: '0px 0px -12% 0px' },
        );

        observer.observe(card);
        cleanups.push(() => observer.disconnect());

        if (!media || !image) return;

        const onEnter = () => {
          gsap.to(media, {
            y: -6,
            duration: 0.32,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          gsap.to(image, {
            scale: 1.035,
            duration: 0.65,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        };
        const onLeave = () => {
          gsap.to(media, {
            y: 0,
            duration: 0.42,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          gsap.to(image, {
            scale: 1,
            duration: 0.62,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        };

        card.addEventListener('pointerenter', onEnter);
        card.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          card.removeEventListener('pointerenter', onEnter);
          card.removeEventListener('pointerleave', onLeave);
        });
      });
    }, root);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
