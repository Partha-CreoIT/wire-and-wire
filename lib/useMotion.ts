'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Cleanup } from './motion';

/**
 * Runs `fn(element)` after mount and disposes with the returned cleanup.
 * The single hook every animated component uses.
 */
export function useMotion<T extends HTMLElement = HTMLDivElement>(
  fn: (el: T) => Cleanup | void,
  deps: unknown[] = [],
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const cleanup = fn(ref.current);
    return typeof cleanup === 'function' ? cleanup : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/**
 * Reduced-motion flag. Starts false and corrects after mount so server and
 * client render the same thing — never read matchMedia during render.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
