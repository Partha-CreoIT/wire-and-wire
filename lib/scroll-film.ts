'use client';

type ScrollFilmOptions = {
  src: string;
  initialProgress: number;
  onFrame: (progress: number) => void;
  onError: () => void;
};

/** A single paused film, with scroll controlling its complete timeline. */
export function mountScrollFilm(video: HTMLVideoElement, options: ScrollFilmOptions) {
  let progress = options.initialProgress;
  let disposed = false;
  let frame = 0;
  let presented = false;
  let primed = false;
  let priming = false;
  let active = true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const end = () => Math.max(0, (video.duration || 0) - 1 / 24);

  function schedule() {
    if (!disposed && active && !document.hidden && !frame) frame = requestAnimationFrame(update);
  }

  function publish() {
    if (disposed || video.readyState < 2 || !video.videoWidth || priming) return;
    presented = true;
    options.onFrame(clamp(video.currentTime / (end() || 1)));
  }

  function update() {
    frame = 0;
    if (disposed || !active || document.hidden || video.readyState < 2 || !end()) return;
    if (priming || video.seeking) { schedule(); return; }
    const target = clamp(progress) * end();
    const delta = target - video.currentTime;
    if (Math.abs(delta) <= 1 / 48) { publish(); return; }
    // Coalesce decoder work. Chasing every wheel event can freeze mobile video.
    // The first seek restores the right point immediately after a resize/back navigation.
    const next = !presented || Math.abs(delta) < 0.12 ? target : video.currentTime + delta * 0.32;
    try { video.currentTime = next; }
    catch { options.onError(); }
    schedule();
  }

  function seeked() { publish(); schedule(); }

  function prime() {
    if (!coarse || primed || priming || disposed || video.readyState < 2) return;
    priming = true;
    // iOS needs a muted decoder activation, retried on touch if autoplay is blocked.
    video.play().then(() => {
      video.pause();
      if (disposed) return;
      primed = true;
      priming = false;
      schedule();
    }).catch(() => { priming = false; schedule(); });
  }

  function loaded() {
    if (disposed) return;
    prime();
    if (progress <= 0.001) publish();
    schedule();
  }

  function failed() { if (!disposed) options.onError(); }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; video.pause(); }
    else schedule();
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.addEventListener('loadeddata', loaded);
  video.addEventListener('canplay', schedule);
  video.addEventListener('seeked', seeked);
  video.addEventListener('error', failed);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('touchstart', prime, { passive: true });
  window.addEventListener('pointerdown', prime, { passive: true });
  video.src = options.src;
  video.load();

  return {
    setProgress(value: number) { progress = clamp(value); schedule(); },
    setActive(value: boolean) {
      active = value;
      if (value) schedule();
      else { cancelAnimationFrame(frame); frame = 0; video.pause(); }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      video.removeEventListener('loadeddata', loaded);
      video.removeEventListener('canplay', schedule);
      video.removeEventListener('seeked', seeked);
      video.removeEventListener('error', failed);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('touchstart', prime);
      window.removeEventListener('pointerdown', prime);
      video.pause();
      video.removeAttribute('src');
      video.load();
    },
  };
}

export type ScrollFilm = ReturnType<typeof mountScrollFilm>;
