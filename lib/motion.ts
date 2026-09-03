'use client';
/**
 * Motion layer — Lenis + GSAP ScrollTrigger primitives.
 * Every primitive returns a cleanup function for useEffect.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export const EASE = 'expo.out';
export const DUR = 0.9;
export const STAGGER = 0.06;

export type Cleanup = () => void;
const noop: Cleanup = () => {};

export const reduced = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isMobile = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 819px)').matches;

/**
 * QA mode: `?p=0.54` on any page jumps straight to that point in the hero.
 * Smooth scroll is disabled while it is active — otherwise Lenis eases toward
 * the target and anything sampling the page (a screenshot, a reviewer sharing
 * a link) catches it mid-flight.
 */
export function isQaMode(): boolean {
  if (typeof window === 'undefined') return false;
  const p = new URLSearchParams(window.location.search).get('p');
  return p !== null && !Number.isNaN(parseFloat(p));
}

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

export function initSmoothScroll(): Cleanup {
  if (typeof window === 'undefined') return noop;
  // No smooth scroll in reduced-motion or QA mode. Do NOT kill triggers here:
  // components own the triggers they create, and React StrictMode double-invokes
  // effects, so a provider that nukes getAll() destroys its children's work.
  if (reduced() || isQaMode()) {
    ScrollTrigger.refresh();
    return noop;
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });
  lenisInstance = lenis;
  lenis.on('scroll', ScrollTrigger.update);

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Stale offsets after webfonts land are the #1 cause of "it fires late".
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenisInstance = null;
    // Deliberately not killing triggers — each component disposes its own.
  };
}

export function scrollTo(target: string | number, offset = 0): void {
  if (lenisInstance) lenisInstance.scrollTo(target, { offset, duration: 1.4 });
  else if (typeof target === 'string')
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}

export function textReveal(
  el: HTMLElement,
  { type = 'lines', start = 'top 85%', stagger = STAGGER } = {},
): Cleanup {
  if (!el || reduced()) return noop;
  const split = new SplitText(el, {
    type,
    mask: type as 'lines' | 'words' | 'chars',
    autoSplit: true,
  });
  const units = (split as unknown as Record<string, Element[]>)[type];
  if (!units?.length) return () => split.revert();

  const tween = gsap.from(units, {
    yPercent: 105,
    opacity: 0,
    duration: DUR,
    ease: EASE,
    stagger,
    scrollTrigger: { trigger: el, start, once: true },
  });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    split.revert();
  };
}

export function reveal(
  el: HTMLElement,
  {
    y = 32,
    children,
    start = 'top 88%',
    stagger = STAGGER,
    duration = DUR,
  }: {
    y?: number;
    children?: string;
    start?: string;
    stagger?: number;
    duration?: number;
  } = {},
): Cleanup {
  if (!el) return noop;
  const targets: Element[] | HTMLElement = children
    ? Array.from(el.querySelectorAll(children))
    : el;
  if (Array.isArray(targets) && !targets.length) return noop;
  const targetList = Array.isArray(targets) ? targets : [targets];

  if (reduced()) {
    gsap.set(targetList, { opacity: 1, y: 0 });
    return noop;
  }

  let tween: gsap.core.Tween | null = null;
  let observer: IntersectionObserver | null = null;
  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    tween = gsap.to(targetList, {
      y: 0,
      opacity: 1,
      duration,
      ease: EASE,
      stagger,
      overwrite: 'auto',
    });
    observer?.disconnect();
  };

  gsap.set(targetList, { y, opacity: 0 });

  const visibleLine =
    start.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? '88';
  const threshold = Number(visibleLine) / 100;
  const rect = el.getBoundingClientRect();
  if (rect.top <= window.innerHeight * threshold) {
    play();
    return () => tween?.kill();
  }

  observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) play();
          },
          {
            rootMargin: `0px 0px -${Math.max(0, 100 - threshold * 100)}% 0px`,
          },
        )
      : null;

  if (observer) observer.observe(el);
  else play();

  return () => {
    observer?.disconnect();
    tween?.kill();
  };
}

export function countUp(
  el: HTMLElement,
  to: number,
  {
    duration = 2,
    decimals = 0,
    prefix = '',
    suffix = '',
    start = 'top 85%',
  } = {},
): Cleanup {
  if (!el) return noop;
  const fmt = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const write = (v: number) => {
    el.textContent = `${prefix}${fmt.format(v)}${suffix}`;
  };
  if (reduced()) {
    write(to);
    return noop;
  }
  write(0);
  const obj = { v: 0 };
  const tween = gsap.to(obj, {
    v: to,
    duration,
    ease: 'power2.out',
    onUpdate: () => write(obj.v),
    scrollTrigger: { trigger: el, start, once: true },
  });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

/** Generic pin + scrub. Hosts the film canvas. */
export function pinnedScene(
  el: HTMLElement,
  {
    id,
    distance = '500%',
    scrub = 0.3,
    onProgress,
    onRefresh,
  }: {
    id?: string;
    distance?: string;
    scrub?: number;
    onProgress?: (p: number, dir: number) => void;
    onRefresh?: () => void;
  },
): Cleanup {
  if (!el) return noop;
  if (reduced()) {
    onProgress?.(0, 1);
    return noop;
  }
  const st = ScrollTrigger.create({
    id,
    trigger: el,
    start: 'top top',
    end: `+=${distance}`,
    pin: true,
    anticipatePin: 1,
    scrub,
    onUpdate: (self) => onProgress?.(self.progress, self.direction),
    onRefresh: () => onRefresh?.(),
  });
  return () => st.kill();
}

export { ScrollTrigger, gsap };
