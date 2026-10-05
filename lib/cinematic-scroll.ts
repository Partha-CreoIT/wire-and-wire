'use client';

import type Lenis from 'lenis';
import type { VirtualScrollData } from 'lenis';

export const MOBILE_CINEMATIC_QUERY = '(max-width: 760px)';
// A deliberate phone swipe should cover a scene without several repeat gestures.
export const MOBILE_SCENE_SCROLL = 0.55;

// Leave ordinary wheel steps and finger movement at 1:1. Only trim bursts that
// would race through the film; fast scrolling can traverse it about 5x playback.
const MAX_PLAYBACK_RATE = 5;
const BURST_SECONDS = 0.3;
const MOBILE_SWIPE_THRESHOLD = 36;
const MOBILE_SCROLL_LERP = 0.1;

type MobileGesture = {
  track: HTMLElement;
  origin: number;
  initial: number;
  target: number;
  direction: number;
  delta: number;
  input: 'touch' | 'wheel' | 'key';
};

/** Limit the scroll position itself, so the film and its copy stay together. */
export function createCinematicScroll(getLenis: () => Lenis) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia(MOBILE_CINEMATIC_QUERY);
  let cinematicTouch = false;
  let budgetTrack: HTMLElement | null = null;
  let budgetDirection = 0;
  let budget = 0;
  let lastInput = 0;
  let lastPosition = 0;
  let mobileGesture: MobileGesture | null = null;
  let wheelTimeout: number | undefined;

  function clearMobileGesture() {
    window.clearTimeout(wheelTimeout);
    wheelTimeout = undefined;
    mobileGesture = null;
  }

  function moveMobile(target: number) {
    // Use the same damping during the drag and its finish. Retargeting a tween
    // on every touch event, or jumping immediately, makes the film stutter.
    getLenis().scrollTo(target, {
      duration: 0,
      lerp: MOBILE_SCROLL_LERP,
      programmatic: false,
      immediate: motion.matches,
    });
  }

  function finishMobileGesture() {
    const gesture = mobileGesture;
    clearMobileGesture();
    const lenis = getLenis();
    if (!gesture || !compact.matches || !gesture.track.isConnected || lenis.isStopped || lenis.isLocked) return;
    const target = gesture.delta * gesture.direction >= MOBILE_SWIPE_THRESHOLD ? gesture.target : gesture.origin;
    if (Math.abs(target - lenis.animatedScroll) < 1 && gesture.target === gesture.origin) return;
    // Finish on a readable frame, rather than leaving the film between chapters.
    moveMobile(target);
  }

  function scrollMobile(track: HTMLElement, start: number, distance: number, delta: number, event: WheelEvent | TouchEvent | KeyboardEvent) {
    event.preventDefault();
    budgetTrack = null;
    const touch = event.type.startsWith('touch');
    const lenis = getLenis();
    const position = lenis.animatedScroll;
    const input = touch ? 'touch' : event.type === 'wheel' ? 'wheel' : 'key';
    if (!mobileGesture || mobileGesture.track !== track || mobileGesture.input !== input) {
      clearMobileGesture();
      const end = start + distance;
      const stops = (track.dataset.cinematicStops ?? '0,1').split(',')
        .map(Number).filter(value => Number.isFinite(value) && value >= 0 && value <= 1)
        .map(progress => start + progress * distance);
      if (!stops.length) stops.push(start, end);
      const nearest = stops.reduce((nearest, stop, i) =>
        Math.abs(stop - position) < Math.abs(stops[nearest] - position) ? i : nearest, 0);
      // A fresh swipe takes over immediately. If the previous swipe is still
      // approaching its reading stop, advance from that intended scene rather
      // than repeatedly selecting the same stop from the lagging scroll position.
      const pending = lenis.isScrolling === 'smooth'
        ? stops.findIndex(stop => Math.abs(stop - lenis.targetScroll) < 1) : -1;
      const index = pending >= 0 ? pending : nearest;
      const direction = Math.sign(delta);
      // Entering from ordinary content first holds the nearest end of the story.
      const entering = position < start || position > end;
      const origin = entering ? position < start ? start : end : position;
      const target = entering ? origin : stops[Math.max(0, Math.min(stops.length - 1, index + direction))];
      mobileGesture = { track, origin, initial: position, target, direction, delta: 0, input };
    }
    const gesture = mobileGesture;
    gesture.delta += delta;
    // The same finger drag or wheel burst cannot go beyond its next scene,
    // including when that scene is the final frame at the end of the track.
    const target = Math.max(Math.min(gesture.origin, gesture.target),
      Math.min(Math.max(gesture.origin, gesture.target), gesture.initial + gesture.delta));
    moveMobile(target);
    if (input === 'wheel') {
      window.clearTimeout(wheelTimeout);
      wheelTimeout = window.setTimeout(finishMobileGesture, 160);
    } else if (input === 'key') finishMobileGesture();
    return true;
  }

  function scroll(delta: number, event: WheelEvent | TouchEvent | KeyboardEvent) {
    const lenis = getLenis();
    if (!delta || !event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey ||
      motion.matches && !compact.matches || lenis.isStopped || lenis.isLocked) return false;
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
      if (compact.matches && mobileGesture?.track === track) {
        return scrollMobile(track, start, distance, delta, event);
      }
      // A new gesture can leave a completed final scene while its easing is
      // still catching up. The original gesture remains bounded above.
      if (compact.matches && !mobileGesture && lenis.isScrolling === 'smooth' &&
        (direction > 0 && Math.abs(lenis.targetScroll - end) < 1 ||
          direction < 0 && Math.abs(lenis.targetScroll - start) < 1)) {
        lenis.scrollTo(position, { immediate: true });
        continue;
      }
      if (position < start && destination < start || position > end && destination > end ||
        position <= start && direction < 0 || position >= end && direction > 0) continue;

      if (compact.matches) return scrollMobile(track, start, distance, delta, event);
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
      if (event.type === 'touchstart') {
        cinematicTouch = false;
        clearMobileGesture();
      }
      if (event.type === 'touchend') {
        if (cinematicTouch) {
          cinematicTouch = false;
          finishMobileGesture();
          return false;
        }
      }
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
    dispose() {
      clearMobileGesture();
    },
  };
}
