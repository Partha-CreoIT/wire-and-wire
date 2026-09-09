'use client';

import type Lenis from 'lenis';
import type { VirtualScrollData } from 'lenis';

// Leave ordinary wheel steps and finger movement at 1:1. Only trim bursts that
// would race through the film; fast scrolling can traverse it about 5x playback.
const MAX_PLAYBACK_RATE = 5;
const BURST_SECONDS = 0.3;

/** Limit the scroll position itself, so the film and its copy stay together. */
export function createCinematicScroll(getLenis: () => Lenis) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cinematicTouch = false;
  let budgetTrack: HTMLElement | null = null;
  let budgetDirection = 0;
  let budget = 0;
  let lastInput = 0;
  let lastPosition = 0;

  function scroll(delta: number, event: WheelEvent | TouchEvent | KeyboardEvent) {
    const lenis = getLenis();
    if (!delta || !event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey ||
      motion.matches || lenis.isStopped || lenis.isLocked) return false;
    const touch = event.type.startsWith('touch');
    if (touch && (event as TouchEvent).touches.length > 1) return false;
    const preventSelector = `[data-lenis-prevent], [data-lenis-prevent-vertical], [data-lenis-prevent-${touch ? 'touch' : 'wheel'}]`;
    if (event.composedPath().some(node => node instanceof HTMLElement && node.matches(preventSelector))) return false;

    const position = lenis.animatedScroll;
    const direction = Math.sign(delta);
    for (const track of document.querySelectorAll<HTMLElement>('[data-cinematic-duration]')) {
      const stage = track.querySelector<HTMLElement>('[data-cinematic-stage]');
      const duration = Number(track.dataset.cinematicDuration);
      const distance = track.offsetHeight - (stage?.offsetHeight ?? window.innerHeight);
      if (!duration || distance <= 0) continue;
      const start = track.getBoundingClientRect().top + window.scrollY;
      const end = start + distance;
      const destination = position + delta;
      if (position < start && destination < start || position > end && destination > end ||
        position <= start && direction < 0 || position >= end && direction > 0) continue;

      event.preventDefault();
      const now = performance.now();
      const maxSpeed = distance / duration * MAX_PLAYBACK_RATE;
      const maxBurst = maxSpeed * BURST_SECONDS;
      // Refill by elapsed time, not event count. Changing direction or explicitly
      // navigating starts a fresh gesture without carrying a scroll backlog.
      if (budgetTrack !== track || budgetDirection !== direction || Math.abs(position - lastPosition) > 2) {
        budget = maxBurst;
      } else {
        budget = Math.min(maxBurst, budget + maxSpeed * (now - lastInput) / 1000);
      }
      const movement = Math.min(Math.abs(delta), budget);
      budget -= movement;
      budgetTrack = track;
      budgetDirection = direction;
      lastInput = now;
      let target = position + direction * movement;
      // Approach a film from ordinary content without jumping into its middle.
      if (position < start) target = start;
      else if (position > end) target = end;
      // A fresh gesture can leave the finished film in either direction.
      else target = Math.max(start, Math.min(end, target));
      lenis.scrollTo(target, { immediate: true });
      lastPosition = lenis.animatedScroll;
      return true;
    }
    return false;
  }

  return {
    virtualScroll({ deltaX, deltaY, event }: VirtualScrollData) {
      if (event.type === 'touchstart') cinematicTouch = false;
      // A touch gesture follows the finger without adding native fling momentum.
      if (event.type === 'touchend' && cinematicTouch) { cinematicTouch = false; return false; }
      if (event.type !== 'wheel' && event.type !== 'touchmove' || Math.abs(deltaX) > Math.abs(deltaY)) return true;
      const handled = scroll(deltaY, event);
      if (event.type === 'touchmove') cinematicTouch = handled;
      return !handled;
    },
    onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="slider"]')) return;
      const page = window.innerHeight * 0.85;
      const delta = { ArrowDown: 60, ArrowUp: -60, PageDown: page, PageUp: -page, ' ': event.shiftKey ? -page : page }[event.key];
      if (delta) scroll(delta, event);
    },
  };
}
