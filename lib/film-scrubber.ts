/**
 * FilmScrubber — canvas frame-sequence player driven by scroll progress.
 *
 * Framework-free on purpose: React only owns its lifecycle (see HeroScrub).
 * Frames stream from a web worker, nearest-to-playhead first, so scrubbing
 * never blocks on the network. An atlas sprite-sheet paints immediately so
 * the canvas is never blank.
 */

export interface AtlasSpec {
  src: string;
  cols: number;
  tileWidth: number;
  tileHeight: number;
}

export interface FilmScrubberOptions {
  canvas: HTMLCanvasElement;
  frameCount: number;
  frameSrc: (i: number) => string; // 1-based, matches 001.webp
  atlas?: AtlasSpec | null;
  workerUrl?: string;
  concurrency?: number;
  onFirstFrame?: () => void;
}

interface WorkerBlob { url: string; blob: Blob }

export class FilmScrubber {
  private o: Required<Pick<FilmScrubberOptions, 'frameCount' | 'frameSrc'>> &
    FilmScrubberOptions;
  private ctx: CanvasRenderingContext2D | null;
  private images: (HTMLImageElement | null)[];
  private objectUrls: string[] = [];
  private urlIndex = new Map<string, number>();
  private requested = new Set<number>();
  private worker: Worker | null = null;
  private atlasImg: HTMLImageElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  private raf = 0;
  private firstShown = false;

  progress = 0;
  private drawn = -1;
  private settled = true;
  private dir: 1 | -1 = 1;

  constructor(opts: FilmScrubberOptions) {
    this.o = opts as FilmScrubber['o'];
    this.ctx = opts.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    }) as CanvasRenderingContext2D | null;
    this.images = new Array(opts.frameCount).fill(null);
    for (let i = 0; i < opts.frameCount; i++) {
      this.urlIndex.set(opts.frameSrc(i + 1), i);
    }
  }

  /**
   * Resolve when the image is usable. `decode()` alone is not safe: it can
   * stall indefinitely (observed here — the atlas reported complete=true,
   * naturalWidth=3840, yet decode() never settled), which leaves the canvas
   * blank forever. Race it against `load`, and short-circuit if the image is
   * already complete from cache.
   */
  private static ready(img: HTMLImageElement): Promise<void> {
    return new Promise<void>((resolve, rejectNever) => {
      void rejectNever;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      if (img.complete && img.naturalWidth > 0) return finish();
      img.addEventListener('load', finish, { once: true });
      img.addEventListener('error', () => {}, { once: true });
      img.decode().then(finish).catch(() => {});
    });
  }

  init(): void {
    this.resize();
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
      this.invalidate();
    });
    this.resizeObserver.observe(this.o.canvas);

    if (this.o.atlas) {
      const img = new Image();
      img.src = this.o.atlas.src;
      FilmScrubber.ready(img).then(() => {
        this.atlasImg = img;
        this.invalidate();
      });
    }
    if (this.o.workerUrl) this.startWorker(this.o.workerUrl);
  }

  private startWorker(url: string): void {
    this.worker = new Worker(url);
    this.worker.addEventListener('message', (e: MessageEvent) => {
      const blobs: WorkerBlob[] = e.data?.payload?.blobs ?? [];
      for (const { url: u, blob } of blobs) {
        const idx = this.urlIndex.get(u);
        if (idx === undefined) continue;
        const img = new Image();
        const objectUrl = URL.createObjectURL(blob);
        this.objectUrls.push(objectUrl);
        img.src = objectUrl;
        FilmScrubber.ready(img).then(() => {
          this.images[idx] = img;
          this.invalidate();
        });
      }
      this.pump();
    });
    this.pump();
  }

  /** Nearest-to-playhead first; frames behind the scroll direction cost 3x. */
  private pump(): void {
    if (!this.worker) return;
    const cur = this.progress * (this.o.frameCount - 1);
    const limit = this.o.concurrency ?? 8;
    const batch: string[] = [];

    while (batch.length < limit) {
      let best = -1;
      let bestCost = Infinity;
      for (let i = 0; i < this.o.frameCount; i++) {
        if (this.images[i] || this.requested.has(i)) continue;
        const d = i - cur;
        const cost =
          d >= 0 ? d * (this.dir >= 0 ? 1 : 3) : -d * (this.dir >= 0 ? 3 : 1);
        if (cost < bestCost) {
          bestCost = cost;
          best = i;
        }
      }
      if (best < 0) break;
      this.requested.add(best);
      batch.push(this.o.frameSrc(best + 1));
    }
    if (batch.length) {
      this.worker.postMessage({ type: 'frames', payload: { frames: batch } });
    }
  }

  setProgress(p: number): void {
    const next = Math.min(1, Math.max(0, p));
    if (next === this.progress) return;
    this.dir = next >= this.progress ? 1 : -1;
    this.progress = next;
    this.settled = false;
    if (this.settleTimer) clearTimeout(this.settleTimer);
    // Once scrolling stops, snap to the exact nearest frame.
    this.settleTimer = setTimeout(() => {
      this.settled = true;
      this.drawn = -1;
      this.invalidate();
    }, 140);
    this.invalidate();
    this.pump();
  }

  private invalidate(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const { clientWidth: w, clientHeight: h } = this.o.canvas;
    this.o.canvas.width = Math.max(1, Math.round(w * dpr));
    this.o.canvas.height = Math.max(1, Math.round(h * dpr));
    this.drawn = -1;
  }

  private draw(): void {
    if (!this.ctx) return;
    const exact = this.progress * (this.o.frameCount - 1);
    if (this.drawn >= 0 && Math.abs(exact - this.drawn) < 0.01) return;

    const floor = Math.floor(exact);
    const next = Math.min(floor + 1, this.o.frameCount - 1);
    const frac = exact - floor;
    const target = this.settled ? Math.round(exact) : floor;

    const targetImg = this.images[target];
    if (targetImg) {
      this.blit(targetImg, 1);
      // Cross-fade the neighbour while actively scrubbing — hides stepping.
      const nextImg = this.images[next];
      if (!this.settled && nextImg && next !== target && frac > 0.04) {
        this.blit(nextImg, frac);
      }
      this.markFirst();
    } else if (this.atlasImg && this.o.atlas) {
      const a = this.o.atlas;
      const i = Math.round(exact);
      this.blit(
        this.atlasImg,
        1,
        (i % a.cols) * a.tileWidth,
        Math.floor(i / a.cols) * a.tileHeight,
        a.tileWidth,
        a.tileHeight,
      );
      this.markFirst();
    } else {
      const n = this.nearestLoaded(target);
      const img = n >= 0 ? this.images[n] : null;
      if (img) {
        this.blit(img, 1);
        this.markFirst();
      }
    }
    this.drawn = exact;
  }

  private nearestLoaded(i: number): number {
    for (let d = 1; d < this.o.frameCount; d++) {
      if (this.images[i - d]) return i - d;
      if (this.images[i + d]) return i + d;
    }
    return -1;
  }

  /** cover-fit draw; optional source rect for atlas tiles */
  private blit(
    img: HTMLImageElement,
    alpha: number,
    sx = 0,
    sy = 0,
    sw = 0,
    sh = 0,
  ): void {
    const c = this.o.canvas;
    const ctx = this.ctx;
    if (!ctx) return;
    let w = sw || img.naturalWidth || img.width;
    let h = sh || img.naturalHeight || img.height;
    const cr = c.width / c.height;
    if (w / h > cr) {
      const nw = h * cr;
      sx += (w - nw) / 2;
      w = nw;
    } else {
      const nh = w / cr;
      sy += (h - nh) / 2;
      h = nh;
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, w, h, 0, 0, c.width, c.height);
    ctx.globalAlpha = 1;
  }

  private markFirst(): void {
    if (this.firstShown) return;
    this.firstShown = true;
    this.o.onFirstFrame?.();
  }

  get loadedCount(): number {
    let n = 0;
    for (const im of this.images) if (im) n++;
    return n;
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.resizeObserver?.disconnect();
    this.worker?.terminate();
    this.worker = null;
    // Revoke the blob URLs we created, not img.src (which may be the atlas).
    for (const u of this.objectUrls) URL.revokeObjectURL(u);
    this.objectUrls = [];
    this.images.fill(null);
  }
}
