'use client';

type ScrollFilmOptions = {
  src: string;
  initialProgress: number;
  onFrame: (progress: number) => void;
  onError: () => void;
};

/** Blend neighbouring decoded frames so small wheel deltas do not step at 24 fps. */
export function mountScrollFilm(video: HTMLVideoElement, canvas: HTMLCanvasElement, options: ScrollFilmOptions) {
  let progress = options.initialProgress;
  let disposed = false;
  let frame = 0;
  let videoFrame = 0;
  let pendingIndex = -1;
  let presentedIndex = -1;
  let displayedPosition = -1;
  let direction = 1;
  let failed = false;
  let primed = false;
  let priming = false;
  let active = true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const context = canvas.getContext('2d', { alpha: false });
  const frames = new Map<number, HTMLCanvasElement>();
  const frameCallbacks = typeof video.requestVideoFrameCallback === 'function';
  // Both journey encodes use 24 fps. Keep only a small window around the playhead.
  const frameDuration = 1 / 24;
  const lastIndex = () => Math.max(0, Math.round((video.duration || 0) / frameDuration) - 1);

  function schedule() {
    if (!disposed && !failed && active && !document.hidden && !frame) frame = requestAnimationFrame(update);
  }

  function capture(index: number) {
    if (disposed || failed || video.readyState < 2 || !video.videoWidth) return;
    if (pendingIndex === index) pendingIndex = -1;
    if (!frames.has(index)) {
      let buffer: HTMLCanvasElement | undefined;
      if (frames.size >= 4) {
        const target = progress * lastIndex();
        const oldest = [...frames.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
        buffer = frames.get(oldest);
        frames.delete(oldest);
      }
      buffer ??= document.createElement('canvas');
      if (buffer.width !== video.videoWidth || buffer.height !== video.videoHeight) {
        buffer.width = video.videoWidth;
        buffer.height = video.videoHeight;
      }
      const bufferContext = buffer.getContext('2d', { alpha: false });
      if (!bufferContext) { reportError(); return; }
      bufferContext.drawImage(video, 0, 0);
      frames.set(index, buffer);
    }
    schedule();
  }

  function requestCapture() {
    if (!frameCallbacks || disposed || failed || videoFrame) return;
    videoFrame = video.requestVideoFrameCallback((_, metadata) => {
      videoFrame = 0;
      // Safari can finish a seek before that frame is available to drawImage.
      presentedIndex = Math.round(metadata.mediaTime / frameDuration);
      capture(presentedIndex);
      if (pendingIndex >= 0) requestCapture();
    });
  }

  function draw(position: number, lower: number, upper: number) {
    if (!context || !frames.size) return;
    const left = frames.get(lower);
    const right = frames.get(upper);
    const closest = [...frames.keys()].sort((a, b) => Math.abs(a - position) - Math.abs(b - position))[0];
    const shown = left && right ? position : closest;
    if (shown === displayedPosition) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    context.globalAlpha = 1;
    context.drawImage(left && right ? left : frames.get(closest)!, 0, 0);
    if (left && right && upper !== lower) {
      context.globalAlpha = position - lower;
      context.drawImage(right, 0, 0);
      context.globalAlpha = 1;
    }
    displayedPosition = shown;
    options.onFrame(clamp(shown / (lastIndex() || 1)));
  }

  function update() {
    frame = 0;
    if (disposed || failed || !active || document.hidden || !lastIndex() || priming) return;
    const position = clamp(progress) * lastIndex();
    const lower = Math.floor(position);
    const upper = Math.min(lastIndex(), lower + 1);
    draw(position, lower, upper);
    // Cached frames can still be blended while the next frame is decoding.
    if (video.readyState < 2 || pendingIndex >= 0 || video.seeking) return;
    const ahead = Math.max(0, Math.min(lastIndex(), direction > 0 ? upper + 1 : lower - 1));
    const next = [lower, upper, ahead].find(index => !frames.has(index));
    if (next === undefined) return;
    pendingIndex = next;
    requestCapture();
    // Seek inside the frame, avoiding timestamp rounding onto its predecessor.
    try { video.currentTime = (next + 0.1) * frameDuration; }
    catch { reportError(); }
  }

  function seeked() {
    if (!frameCallbacks) capture(Math.floor(video.currentTime / frameDuration));
    else if (presentedIndex === pendingIndex) capture(presentedIndex);
    schedule();
  }

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
    if (!frameCallbacks) capture(Math.floor(video.currentTime / frameDuration));
    schedule();
  }

  function reportError() {
    if (disposed || failed) return;
    failed = true;
    cancelAnimationFrame(frame);
    if (videoFrame) video.cancelVideoFrameCallback(videoFrame);
    frame = videoFrame = 0;
    options.onError();
  }
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
  video.addEventListener('error', reportError);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('touchstart', prime, { passive: true });
  window.addEventListener('pointerdown', prime, { passive: true });
  if (!context) reportError();
  else {
    requestCapture();
    video.src = options.src;
    video.load();
  }

  return {
    fallback: reportError,
    setProgress(value: number) {
      const next = clamp(value);
      if (next !== progress) direction = next > progress ? 1 : -1;
      progress = next;
      schedule();
    },
    setActive(value: boolean) {
      active = value;
      if (value) schedule();
      else { cancelAnimationFrame(frame); frame = 0; video.pause(); }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      if (videoFrame) video.cancelVideoFrameCallback(videoFrame);
      video.removeEventListener('loadeddata', loaded);
      video.removeEventListener('canplay', schedule);
      video.removeEventListener('seeked', seeked);
      video.removeEventListener('error', reportError);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('touchstart', prime);
      window.removeEventListener('pointerdown', prime);
      video.pause();
      video.removeAttribute('src');
      video.load();
      frames.forEach(buffer => { buffer.width = buffer.height = 0; });
      frames.clear();
      canvas.width = canvas.height = 0;
    },
  };
}

export type ScrollFilm = ReturnType<typeof mountScrollFilm>;
