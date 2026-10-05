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
const MOBILE_SWIPE_THRESHOLD = 28;
const MOBILE_TRANSITION_SECONDS = 0.65;
// Let the copy's fade finish before a queued swipe advances again.
const MOBILE_READING_HOLD = 650;
const MOBILE_DECODE_TIMEOUT = 2000;

type MobileGesture = {
  track: HTMLElement;
  delta: number;
  committed: boolean;
  input: 'touch' | 'wheel' | 'key';
};

type MobileStep = { direction: number; delta: number };
type MobileTransition = {
  track: HTMLElement;
  index: number;
  target: number;
  startedAt: number;
  reachedAt: number | null;
  queued: MobileStep | null;
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
  let mobileTransition: MobileTransition | null = null;
  let transitionFrame = 0;
  let wheelTimeout: number | undefined;

  function clearMobileGesture() {
    window.clearTimeout(wheelTimeout);
    wheelTimeout = undefined;
    mobileGesture = null;
  }

  function moveMobile(target: number) {
    // One bounded tween per scene. Touch events never restart its easing.
    getLenis().scrollTo(target, {
      duration: MOBILE_TRANSITION_SECONDS,
      easing: value => 1 - Math.pow(1 - value, 3),
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

  function clearMobileTransition() {
    cancelAnimationFrame(transitionFrame);
    transitionFrame = 0;
    mobileTransition = null;
  }

  function requestMobileStep(track: HTMLElement, step: MobileStep) {
    if (mobileTransition?.track === track) {
      // Remember one follow-up gesture without building a backlog that skips copy.
      mobileTransition.queued = step;
      return;
    }
    const lenis = getLenis();
    const { start, end, stops } = geometry(track);
    const position = lenis.animatedScroll;
    const nearest = stops.reduce((nearest, stop, i) =>
      Math.abs(stop - position) < Math.abs(stops[nearest] - position) ? i : nearest, 0);
    const entering = position < start - 1 || position > end + 1;
    let index = entering ? position < start ? 0 : stops.length - 1 : nearest + step.direction;
    let queued: MobileStep | null = null;
    if ((index < 0 || index >= stops.length) && track.dataset.cinematicSettled === 'false') {
      // History restoration can put the page at an endpoint before its film decodes.
      index = nearest;
      queued = step;
    }
    if (index < 0 || index >= stops.length) {
      // A queued exit runs only after the final frame and copy have been shown.
      const movement = Math.min(window.innerHeight * 0.85, Math.max(60, Math.abs(step.delta)));
      moveMobile(position + step.direction * movement);
      return;
    }
    mobileTransition = {
      track, index, target: stops[index], startedAt: performance.now(), reachedAt: null, queued,
    };
    moveMobile(stops[index]);
    transitionFrame = requestAnimationFrame(finishMobileTransition);
  }

  function finishMobileTransition(now: number) {
    transitionFrame = 0;
    const transition = mobileTransition;
    if (!transition) return;
    const lenis = getLenis();
    const { track } = transition;
    const { stops } = geometry(track);
    const position = lenis.animatedScroll;
    if (!compact.matches || !track.isConnected || lenis.isStopped || lenis.isLocked ||
      Math.abs(position - transition.target) > 2 && lenis.userData.cinematic !== true) {
      clearMobileTransition();
      return;
    }
    // Recompute the destination if rotation changes the track during a gesture.
    const target = stops[Math.min(transition.index, stops.length - 1)];
    if (Math.abs(target - transition.target) > 1) {
      transition.target = target;
      transition.reachedAt = null;
      moveMobile(target);
    }
    const arrived = Math.abs(position - transition.target) < 1;
    if (arrived && track.dataset.cinematicSettled === 'false' &&
      now - transition.startedAt > MOBILE_DECODE_TIMEOUT) {
      // A slow/blocked iPhone decoder must not trap the page: show the scene still.
      track.dispatchEvent(new Event('cinematic-fallback'));
    }
    if (arrived && track.dataset.cinematicSettled !== 'false') {
      transition.reachedAt ??= now;
      if (now - transition.reachedAt >= (motion.matches ? 0 : MOBILE_READING_HOLD)) {
        const queued = transition.queued;
        clearMobileTransition();
        if (queued) requestMobileStep(track, queued);
        return;
      }
    } else transition.reachedAt = null;
    transitionFrame = requestAnimationFrame(finishMobileTransition);
  }

  function finishMobileGesture() {
    clearMobileGesture();
  }

  function scrollMobile(track: HTMLElement, delta: number, event: WheelEvent | TouchEvent | KeyboardEvent) {
    if (event.cancelable) event.preventDefault();
    budgetTrack = null;
    const touch = event.type.startsWith('touch');
    const input = touch ? 'touch' : event.type === 'wheel' ? 'wheel' : 'key';
    if (!mobileGesture || mobileGesture.track !== track || mobileGesture.input !== input) {
      clearMobileGesture();
      mobileGesture = { track, delta: 0, committed: false, input };
    }
    const gesture = mobileGesture;
    gesture.delta += delta;
    if (!gesture.committed && Math.abs(gesture.delta) >= MOBILE_SWIPE_THRESHOLD) {
      gesture.committed = true;
      requestMobileStep(track, { direction: Math.sign(gesture.delta), delta: gesture.delta });
    }
    if (input === 'wheel') {
      window.clearTimeout(wheelTimeout);
      wheelTimeout = window.setTimeout(finishMobileGesture, 160);
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
      const ownedTrack = mobileGesture?.track ?? mobileTransition?.track;
      if (ownedTrack?.isConnected) return scrollMobile(ownedTrack, delta, event);
      clearMobileGesture();
      clearMobileTransition();
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
    cinematicTouch = false;
    clearMobileGesture();
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
        if (compact.matches && mobileTransition && !getLenis().isStopped && !getLenis().isLocked) {
          // Lenis syncTouch normally resets on touchstart; keep this scene moving.
          getLenis().isTouching = true;
          return false;
        }
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
          if (cinematicTouch || !horizontalRail && (onStory || mobileTransition)) {
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
      clearMobileTransition();
      window.removeEventListener('touchcancel', onTouchCancel);
    },
  };
}
