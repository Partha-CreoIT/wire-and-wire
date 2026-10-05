'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { mountScrollFilm, type ScrollFilm } from '@/lib/scroll-film';
import { MobileScrollIndicator } from './MobileScrollIndicator';
import styles from './CinematicStory.module.css';

const chapters = [
  {
    id: 'mill', eyebrow: 'It starts with people',
    title: ['The strength behind', 'the skyline.'],
    body: 'Before a bridge carries its first journey, steel begins another. Drawn into wire. Shaped by people. Made for what comes next.',
    href: '/products', link: 'Discover our products',
    alt: 'A technician beside steel wire production equipment in a full-scale industrial mill.',
  },
  {
    id: 'strand', eyebrow: 'A closer look at strength',
    title: ['One wire becomes', 'something stronger.'],
    body: 'Six wires wind around a central core. Together, they become the pre-stressing strand that carries tension deep within concrete.',
    href: '/products/pc-strand', link: 'Explore PC strand',
    alt: 'A cinematic macro view along the helical wires of a silver steel strand.',
  },
  {
    id: 'build', eyebrow: 'From material to possibility',
    title: ['Hidden in concrete.', 'Felt in every crossing.'],
    body: 'Steel carries tension. Concrete carries compression. Working together, they give engineers the strength to span further.',
    href: '/products/pc-strand#applications', link: 'See the applications',
    alt: 'A close view of steel strand anchorage on an elevated construction deck, with Kuala Lumpur beyond.',
  },
  {
    id: 'skyline', eyebrow: 'Malaysia. Connected to the world.',
    title: ['A city moves.', 'A future takes shape.'],
    body: 'Behind the places we live, work and travel is a world of materials. From our home in Malaysia, Wire & Wire is part of that bigger story.',
    href: '/projects', link: 'Explore our projects',
    alt: 'Kuala Lumpur at blue hour, with the Petronas Twin Towers and illuminated city streets.',
  },
] as const;

function Arrow() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export function CinematicStory() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const film = useRef<ScrollFilm | null>(null);
  const progressRef = useRef(0);
  const displayedProgress = useRef(0);
  const current = useRef(0);
  const mediaReady = useRef(false);
  const [chapter, setChapter] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [ready, setReady] = useState(false);
  const [travelling, setTravelling] = useState(false);
  const copyTravelling = ready && travelling && !portrait;

  // Times correspond to the continuous master: mill → zoom → strand → pullback
  // → construction → aerial ascent → Kuala Lumpur. Copy follows decoded frames.
  const showProgress = useCallback((progress: number) => {
    displayedProgress.current = progress;
    if (root.current) root.current.dataset.cinematicSettled = String(Math.abs(progress - progressRef.current) < 0.004);
    const time = progress * 30;
    const next = time < 8 ? 0 : time < 16 ? 1 : time < 23 ? 2 : 3;
    if (current.current !== next) { current.current = next; setChapter(next); }
    setTravelling((time > 6.2 && time < 9.6) || (time > 14.2 && time < 17.6) || (time > 21.2 && time < 24.6));
  }, []);

  useLayoutEffect(() => {
    // Reserve the scroll track before browser history restores its position.
    setEnhanced(true);
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewport = window.matchMedia('(max-width: 760px)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const preference = () => setMediaEnabled(!motion.matches && !connection?.saveData);
    const size = () => setPortrait(viewport.matches);
    preference();
    size();
    motion.addEventListener('change', preference);
    viewport.addEventListener('change', size);
    return () => {
      motion.removeEventListener('change', preference);
      viewport.removeEventListener('change', size);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    mediaReady.current = false;
    setReady(false);
    if (!video || !canvas || !mediaEnabled) { showProgress(progressRef.current); return; }
    const controller = mountScrollFilm(video, canvas, {
      src: `/world/cinematic/${portrait ? 'mobile/' : ''}journey.mp4`,
      initialProgress: progressRef.current,
      onFrame: progress => {
        if (!mediaReady.current) { mediaReady.current = true; setReady(true); }
        showProgress(progress);
      },
      onError: () => { mediaReady.current = false; setReady(false); showProgress(progressRef.current); },
    });
    film.current = controller;
    const fallback = () => controller.fallback();
    const track = root.current;
    track?.addEventListener('cinematic-fallback', fallback);
    const observer = new IntersectionObserver(([entry]) => controller.setActive(entry.isIntersecting));
    if (stage.current) observer.observe(stage.current);
    return () => {
      observer.disconnect();
      track?.removeEventListener('cinematic-fallback', fallback);
      controller.dispose();
      film.current = null;
      mediaReady.current = false;
    };
  }, [mediaEnabled, portrait, showProgress]);

  useEffect(() => {
    const track = root.current;
    const panel = stage.current;
    if (!track || !panel) return;
    let frame = 0;
    function measure() {
      frame = 0;
      if (!track || !panel) return;
      const distance = Math.max(1, track.offsetHeight - panel.offsetHeight);
      const progress = Math.max(0, Math.min(1, -track.getBoundingClientRect().top / distance));
      progressRef.current = progress;
      film.current?.setProgress(progress);
      if (!mediaReady.current) showProgress(progress);
      else track.dataset.cinematicSettled = String(Math.abs(displayedProgress.current - progress) < 0.004);
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(schedule);
    resize.observe(track);
    resize.observe(panel);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [showProgress]);

  return (
    <section ref={root} className={styles.story} data-cinematic-story data-cinematic-duration="30" data-cinematic-stops="0,0.4,0.65,1" data-travelling={copyTravelling || undefined} data-film-tone="dark" data-enhanced={enhanced || undefined} aria-label="Wire & Wire">
      <div ref={stage} className={styles.stage} data-cinematic-stage>
        <div className={styles.frames}>
          {chapters.map((item, index) => <figure key={item.id} className={styles.shot} data-active={index === chapter || undefined} data-scene={item.id} aria-hidden={index !== chapter}>
            <picture>
              <source media="(max-width: 760px)" srcSet={`/world/cinematic/mobile/${item.id}.webp`} />
              <img src={`/world/cinematic/${item.id}.webp`} alt={item.alt} fetchPriority={index === 0 ? 'high' : 'low'} />
            </picture>
          </figure>)}
          {mediaEnabled && <>
            <video ref={videoRef} className={styles.video} muted playsInline preload="auto" aria-hidden="true" />
            <canvas ref={canvasRef} className={styles.video} data-ready={ready || undefined} aria-hidden="true" />
          </>}
        </div>
        <div className={styles.shade} aria-hidden="true" />

        <div className={styles.copyStack}>
          {chapters.map((item, index) => <div key={item.id} id={`story-${item.id}`} className={styles.copy} data-active={index === chapter || undefined} aria-hidden={index !== chapter || copyTravelling} inert={index !== chapter || copyTravelling}>
            <p className={styles.eyebrow}>{item.eyebrow}</p>
            {index === 0 ? <h1>{item.title[0]}<br /><em>{item.title[1]}</em></h1> : <h2>{item.title[0]}<br /><em>{item.title[1]}</em></h2>}
            <p className={styles.body}>{item.body}</p>
            <div className={styles.actions}>
              <Link className={styles.cta} href={item.href}>{item.link}<Arrow /></Link>
            </div>
          </div>)}
        </div>
        <MobileScrollIndicator active={chapter} complete={chapter === chapters.length - 1} />
      </div>
    </section>
  );
}
