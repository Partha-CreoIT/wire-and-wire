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
const MOBILE_TOUCH_GAIN = 1.4;
const MOBILE_SNAP_DELAY = 120;
const MOBILE_DECODE_TIMEOUT = 2000;

type MobileGesture = {
  track: HTMLElement;
  direction: number;
  target: number;
  boundary: number;
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
  let snapTimeout: number | undefined;
  let decodeFrame = 0;

  function clearMobileGesture() {
    window.clearTimeout(wheelTimeout);
    wheelTimeout = undefined;
    mobileGesture = null;
  }

  function moveMobile(target: number) {
    // Follow each finger sample with a short catch-up, rather than launching a
    // whole scene after a threshold. A new sample or reversal can retarget it.
    getLenis().scrollTo(target, {
      duration: 0,
      lerp: 0.35,
      programmatic: false,
      immediate: motion.matches,
      userData: { cinematic: true },
    });
  }

  function geometry(track: HTMLElement) {
    const stage = track.querySelector<HTMLElement>('[data-cinematic-stage]');
    const filmDistance = Number(track.dataset.cinematicDistance);
    const distance = filmDistance > 0 ? filmDistance : track.offsetHeight - (stage?.offsetHeight ?? window.innerHeight);
    const start = track.getBoundingClientRect().top + window.scrollY;
    const end = start + distance;
    const stops = [...new Set((track.dataset.cinematicStops ?? '0,1').split(',')
      .map(Number).filter(value => Number.isFinite(value) && value >= 0 && value <= 1)
      .concat(0, 1))].sort((a, b) => a - b).map(progress => start + progress * distance);
    return { start, end, distance, stops };
  }

  function watchFinalFrame(track: HTMLElement) {
    if (decodeFrame) return;
    const started = performance.now();
    const check = (now: number) => {
      decodeFrame = 0;
      const lenis = getLenis();
      const { end } = geometry(track);
      if (!compact.matches || !track.isConnected || lenis.isStopped || lenis.isLocked ||
        Math.abs(lenis.targetScroll - end) > 1 || track.dataset.cinematicSettled !== 'false') return;
      if (now - started >= MOBILE_DECODE_TIMEOUT) {
        // Keep the final scene readable if a phone decoder stalls, without
        // locking every intermediate gesture behind a decode timer.
        track.dispatchEvent(new Event('cinematic-fallback'));
        return;
      }
      decodeFrame = requestAnimationFrame(check);
    };
    decodeFrame = requestAnimationFrame(check);
  }

  function nextStop(stops: number[], position: number, direction: number) {
    return direction > 0 ? stops.find(stop => stop > position + 1) ?? stops.at(-1)!
      : stops.findLast(stop => stop < position - 1) ?? stops[0];
  }

  function finishMobileGesture(snap = true) {
    const gesture = mobileGesture;
    clearMobileGesture();
    if (!gesture || !snap || motion.matches) return;
    // Like a resting point in a continuous timeline: settle only when already
    // close, and never snap backwards or queue another scene automatically.
    snapTimeout = window.setTimeout(() => {
      snapTimeout = undefined;
      const lenis = getLenis();
      if (!compact.matches || !gesture.track.isConnected || lenis.isStopped || lenis.isLocked ||
        lenis.userData.cinematic !== true && Math.abs(lenis.animatedScroll - gesture.target) > 2) return;
      const { stops, end } = geometry(gesture.track);
      const target = nextStop(stops, gesture.target, gesture.direction);
      if (Math.abs(target - gesture.target) > Math.min(110, window.innerHeight * 0.12)) return;
      lenis.scrollTo(target, { duration: 0.18, easing: value => 1 - (1 - value) ** 3,
        programmatic: false, userData: { cinematic: true } });
      if (Math.abs(target - end) < 1) watchFinalFrame(gesture.track);
    }, MOBILE_SNAP_DELAY);
  }

  function scrollMobile(track: HTMLElement, delta: number, event: WheelEvent | TouchEvent | KeyboardEvent) {
    if (event.cancelable) event.preventDefault();
    budgetTrack = null;
    const touch = event.type.startsWith('touch');
    const input = touch ? 'touch' : event.type === 'wheel' ? 'wheel' : 'key';
    window.clearTimeout(snapTimeout);
    snapTimeout = undefined;
    const direction = Math.sign(delta);
    const lenis = getLenis();
    const { start, end, stops } = geometry(track);
    if (!mobileGesture || mobileGesture.track !== track || mobileGesture.input !== input) {
      clearMobileGesture();
      const position = lenis.animatedScroll;
      mobileGesture = { track, direction, target: position, boundary: nextStop(stops, position, direction), input };
    }
    const gesture = mobileGesture;
    if (direction !== gesture.direction) {
      gesture.direction = direction;
      gesture.target = lenis.animatedScroll;
      gesture.boundary = nextStop(stops, gesture.target, direction);
    }
    // A long flick still meets the next reading point instead of skipping text.
    // Within that range the animation follows every pixel of finger travel.
    gesture.target = Math.max(start, Math.min(end, gesture.target + delta * (touch ? MOBILE_TOUCH_GAIN : 1)));
    gesture.target = direction > 0 ? Math.min(gesture.target, gesture.boundary) : Math.max(gesture.target, gesture.boundary);
    moveMobile(gesture.target);
    if (Math.abs(gesture.target - end) < 1) watchFinalFrame(track);
    if (input === 'wheel') {
      window.clearTimeout(wheelTimeout);
      wheelTimeout = window.setTimeout(finishMobileGesture, 120);
    } else if (input === 'key') finishMobileGesture();
    return true;
  }

  function scroll(delta: number, event: WheelEvent | TouchEvent | KeyboardEvent) {
    const lenis = getLenis();
    const touch = event.type.startsWith('touch');
    // Safari may mark later samples non-cancelable. Our phone touch path already
    // owns the swipe; those samples still need the same scene boundary.
    if (!delta || (!event.cancelable && !(compact.matches && touch)) || event.defaultPrevented || event.ctrlKey || event.metaKey ||
      motion.matches && !compact.matches || lenis.isStopped || lenis.isLocked) return false;
    if (touch && (event as TouchEvent).touches.length > 1) return false;
    const preventSelector = `[data-lenis-prevent], [data-lenis-prevent-vertical], [data-lenis-prevent-${touch ? 'touch' : 'wheel'}]`;
    if (event.composedPath().some(node => node instanceof HTMLElement && node.matches(preventSelector))) return false;

    const position = lenis.animatedScroll;
    const direction = Math.sign(delta);
    if (compact.matches) {
      const ownedTrack = mobileGesture?.track;
      if (ownedTrack?.isConnected) return scrollMobile(ownedTrack, delta, event);
      clearMobileGesture();
    }
    for (const track of document.querySelectorAll<HTMLElement>('[data-cinematic-duration]')) {
      const stage = track.querySelector<HTMLElement>('[data-cinematic-stage]');
      const duration = Number(track.dataset.cinematicDuration);
      const filmDistance = compact.matches ? Number(track.dataset.cinematicDistance) : 0;
      const distance = filmDistance > 0 ? filmDistance : track.offsetHeight - (stage?.offsetHeight ?? window.innerHeight);
      if (!duration || distance <= 0) continue;
      const start = track.getBoundingClientRect().top + window.scrollY;
      const end = start + distance;
      const destination = position + delta;
      if (compact.matches && track.dataset.cinematicSettled === 'false' &&
        position >= start - 1 && position <= end + 1 &&
        (position <= start + 1 && direction < 0 || position >= end - 1 && direction > 0)) {
        return scrollMobile(track, delta, event);
      }
      // Browser scroll positions round to pixels; weighted product tracks can
      // finish between pixels. A fresh gesture must be able to leave that end.
      if (compact.matches && (position <= start + 1 && direction < 0 || position >= end - 1 && direction > 0)) continue;
      if (position < start && destination < start || position > end && destination > end ||
        position <= start && direction < 0 || position >= end && direction > 0) continue;

      if (compact.matches) return scrollMobile(track, delta, event);
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

  function onTouchCancel() {
    if (!compact.matches) return;
    if (cinematicTouch) getLenis().scrollTo(getLenis().animatedScroll, { immediate: true });
    cinematicTouch = false;
    clearMobileGesture();
    window.clearTimeout(snapTimeout);
    snapTimeout = undefined;
    getLenis().isTouching = false;
  }
  // Safari can cancel a touch without sending Lenis a touchend.
  window.addEventListener('touchcancel', onTouchCancel, { passive: true });

  return {
    virtualScroll({ deltaX, deltaY, event }: VirtualScrollData) {
      if (compact.matches && event.type.startsWith('touch') && (event as TouchEvent).touches.length > 1) {
        onTouchCancel();
        return false;
      }
      if (event.type === 'touchstart') {
        cinematicTouch = false;
        clearMobileGesture();
        window.clearTimeout(snapTimeout);
        snapTimeout = undefined;
      }
      if (event.type === 'touchend') {
        if (cinematicTouch) {
          cinematicTouch = false;
          finishMobileGesture();
          if (compact.matches) getLenis().isTouching = false;
          return false;
        }
        if (compact.matches) {
          const lenis = getLenis();
          // A flick from ordinary content can enter the film during inertia,
          // after all touchmoves have ended. Cap that destination at its first stop.
          const inertia = Math.sign(deltaY) * Math.abs(lenis.velocity) ** lenis.options.touchInertiaExponent;
          if (scroll(inertia, event)) {
            finishMobileGesture();
            lenis.isTouching = false;
            return false;
          }
        }
      }
      if (event.type !== 'wheel' && event.type !== 'touchmove') return true;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Once this finger owns a scene, diagonal movement cannot hand it to native scroll.
        if (compact.matches && event.type === 'touchmove') {
          const path = event.composedPath();
          if (getLenis().isStopped || getLenis().isLocked || event.defaultPrevented ||
            path.some(node => node instanceof HTMLElement && node.matches('[data-lenis-prevent], [data-lenis-prevent-touch]'))) return true;
          const horizontalRail = path.some(node => node instanceof HTMLElement && node.hasAttribute('data-lenis-prevent-horizontal'));
          const onStory = path.some(node => node instanceof HTMLElement && node.hasAttribute('data-cinematic-duration'));
          if (cinematicTouch || !horizontalRail && onStory) {
            if (event.cancelable) event.preventDefault();
            cinematicTouch = true;
          }
          return false;
        }
        return true;
      }
      const handled = scroll(deltaY, event);
      if (event.type === 'touchmove') cinematicTouch = compact.matches ? cinematicTouch || handled : handled;
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
      window.clearTimeout(snapTimeout);
      cancelAnimationFrame(decodeFrame);
      window.removeEventListener('touchcancel', onTouchCancel);
    },
  };
}
