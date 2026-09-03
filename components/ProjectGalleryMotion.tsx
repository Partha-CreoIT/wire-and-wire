'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export function ProjectGalleryMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cards = gsap.utils.toArray<HTMLElement>('[data-project-card]');

      if (reduce) {
        gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { autoAlpha: 0, y: 46, scale: 0.985 });

      cards.forEach((card, index) => {
        const media = card.querySelector<HTMLElement>('[data-project-media]');
        const image = card.querySelector<HTMLImageElement>('img');
        const observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;

            gsap.to(card, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              delay: (index % 3) * 0.045,
              ease: 'power3.out',
              overwrite: 'auto',
            });
            observer.disconnect();
          },
          { rootMargin: '0px 0px -14% 0px' },
        );

        observer.observe(card);
        cleanups.push(() => observer.disconnect());

        if (!media || !image) return;

        const onEnter = () => {
          gsap.to(media, {
            y: -7,
            scale: 1.025,
            duration: 0.38,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          gsap.to(image, {
            scale: 1.065,
            duration: 0.8,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        };
        const onLeave = () => {
          gsap.to(media, {
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          gsap.to(image, {
            scale: 1,
            duration: 0.75,
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
