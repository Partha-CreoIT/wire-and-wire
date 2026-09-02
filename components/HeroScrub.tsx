'use client';
import { useEffect, useRef, useState } from 'react';
import { FilmScrubber } from '@/lib/film-scrubber';
import { pinnedScene, ScrollTrigger, isMobile, reduced, getLenis } from '@/lib/motion';
import styles from './HeroScrub.module.css';

const FRAMES = 400;
const pad = (n: number) => String(n).padStart(3, '0');

export interface Chapter {
  at: number;      // scroll progress where this beat activates
  index: string;   // "01"
  label: string;   // eyebrow
  title: string;
}

export const CHAPTERS: Chapter[] = [
  { at: 0.0,  index: '01', label: 'Wire',      title: 'It starts as wire.' },
  { at: 0.15, index: '02', label: 'Strand',    title: 'Seven wires. One strand.' },
  { at: 0.3,  index: '03', label: 'Tension',   title: 'Tensioned to 1,860 MPa.' },
  { at: 0.45, index: '04', label: 'Concrete',  title: 'Concrete takes the compression.' },
  { at: 0.65, index: '05', label: 'Span',      title: 'The strand takes the tension.' },
  { at: 0.85, index: '06', label: 'Structure', title: '23 landmarks. One foundation.' },
];

export function HeroScrub() {
  const stageRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const filmRef = useRef<FilmScrubber | null>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    // Portrait set below 820px. Chosen once on mount: swapping mid-session
    // would discard every cached frame for no visual gain.
    const m = isMobile();
    const film = new FilmScrubber({
      canvas,
      frameCount: FRAMES,
      frameSrc: (i) => `/film/${m ? 'm' : 'd'}/${pad(i)}.webp`,
      atlas: {
        src: `/film/${m ? 'm' : 'd'}-atlas.webp`,
        cols: 12,
        tileWidth: m ? 180 : 320,
        tileHeight: m ? 320 : 180,
      },
      workerUrl: '/film-worker.js',
      onFirstFrame: () => setReady(true),
    });
    filmRef.current = film;
    film.init();

    // With no pin driving it, progress stays 0 and setProgress(0) short-circuits,
    // leaving only the blurry atlas. Nudge it so frame 001 renders sharp.
    if (reduced()) film.setProgress(0.0001);

    const cleanup = pinnedScene(stage, {
      id: 'hero',
      distance: '500%',
      scrub: 0.3,
      onProgress: (p) => {
        film.setProgress(p);
        let i = 0;
        for (let c = 0; c < CHAPTERS.length; c++) {
          if (p >= CHAPTERS[c].at) i = c;
        }
        setActive(i);
      },
    });

    // QA hook: ?p=0.54 jumps to that beat. Addressed BY ID — getAll()[0] is not
    // the hero once other sections register their own triggers, and jumping to
    // the wrong trigger's offsets lands past all content on a blank page.
    const qp = parseFloat(
      new URLSearchParams(window.location.search).get('p') ?? '',
    );
    let qaFrame = 0;
    if (!Number.isNaN(qp)) {
      qaFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const st = ScrollTrigger.getById('hero');
        if (!st) return;
        const y = st.start + (st.end - st.start) * Math.min(1, Math.max(0, qp));
        // Must go through Lenis, or Lenis immediately scrolls back.
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
        ScrollTrigger.update();
      });
    }

    return () => {
      if (qaFrame) cancelAnimationFrame(qaFrame);
      cleanup();
      film.dispose();
      filmRef.current = null;
    };
  }, []);

  return (
    <section ref={stageRef} className={styles.stage} data-theme="dark">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <span className={`${styles.pin} ${styles.tl}`} aria-hidden="true" />
      <span className={`${styles.pin} ${styles.br}`} aria-hidden="true" />

      {/* Real DOM text: readable to search engines and screen readers even
          though only one beat is visible at a time. */}
      <div className={styles.captions}>
        {CHAPTERS.map((c, i) => (
          <figure
            key={c.index}
            className={styles.cap}
            data-on={i === active ? '' : undefined}
            aria-hidden={i === active ? undefined : true}
          >
            <figcaption className="mono">
              {c.index} — {c.label}
            </figcaption>
            <h2 className="h3">{c.title}</h2>
          </figure>
        ))}
      </div>

      <p className={`${styles.hud} mono-sm`} aria-hidden="true">
        {ready ? 'Scroll to build' : 'Loading'}
      </p>

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/film/d/001.webp" alt="A single steel wire, magnified." />
      </noscript>
    </section>
  );
}
