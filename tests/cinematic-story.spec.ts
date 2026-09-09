import { test, expect, type Page } from '@playwright/test';

const story = '[data-cinematic-story]';
const chapterTimes = [0, 12, 19.5, 28];

async function scrollStory(page: Page, seconds: number) {
  await expect(page.locator(story)).toHaveAttribute('data-enhanced', 'true');
  await expect(page.locator('html')).not.toHaveClass(/lenis-smooth/);
  await page.evaluate(time => {
    const track = document.querySelector<HTMLElement>('[data-cinematic-story]')!;
    const panel = track.firstElementChild as HTMLElement;
    const top = track.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (track.offsetHeight - panel.offsetHeight) * time / 30, behavior: 'instant' });
  }, seconds);
}

async function scrollFilm(page: Page, seconds: number) {
  await scrollStory(page, seconds);
  const video = page.locator(`${story} video`);
  // The decoder preloads up to two neighbouring frames for the visible canvas.
  await expect.poll(() => video.evaluate((v: HTMLVideoElement, time) => Math.abs(v.currentTime - (v.duration - 1 / 24) * time / 30), seconds)).toBeLessThan(0.13);
  await expect(video).toHaveJSProperty('seeking', false);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

test('home hero keeps its main content without story labels or chapter controls', async ({ page }, testInfo) => {
  await page.goto('/');
  const hero = page.locator(story);
  await expect(hero.locator('canvas')).toHaveAttribute('data-ready', 'true');
  await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(hero.getByRole('link', { name: 'Discover our products', exact: true })).toBeVisible();
  await expect(hero.getByRole('button')).toHaveCount(0);
  await expect(hero.getByRole('navigation')).toHaveCount(0);
  await expect(hero).not.toContainText(/From wire to world|A story of connection|Skip the story|Steel, at its beginning|Cinematic visualisation|Visualisation|travel through the story|01 \/ 04/i);
  await page.screenshot({ path: testInfo.outputPath('home-clean.png') });
});

async function paintedFrame(page: Page) {
  return page.locator(`${story} canvas`).evaluate((surface: HTMLCanvasElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 36;
    canvas.getContext('2d')!.drawImage(surface, 0, 0, 64, 36);
    return canvas.toDataURL();
  });
}

test('scrolling paints the full film, reverses it and holds its frame when scrolling stops', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const video = page.locator(`${story} video`);
  await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('button', { name: /watch|play|pause/i })).toHaveCount(0);
  expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(30, 1);
  const source = await video.getAttribute('src');
  const handle = await video.elementHandle();
  const frames = new Set<string>();
  // Includes all three connecting camera moves and the final frame.
  for (const seconds of [3, 7, 12, 16, 19.5, 23, 28, 30, 12, 0]) {
    await scrollFilm(page, seconds);
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('src', source!);
    expect(await handle!.evaluate(el => el === document.querySelector('[data-cinematic-story] video'))).toBe(true);
    await expect(video).toHaveJSProperty('paused', true);
    frames.add(await paintedFrame(page));
  }
  expect(frames.size).toBeGreaterThanOrEqual(9);
  const held = await paintedFrame(page);
  await page.waitForTimeout(300);
  expect(await paintedFrame(page)).toBe(held);
  expect(errors).toEqual([]);
});

test.describe('desktop wheel input', () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test('small wheel deltas blend the origin-to-material transition and hold when scrolling stops', async ({ page }) => {
    for (const path of ['/?p=0', '/']) {
      await page.goto(path);
      await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
      await scrollFilm(page, 7.8);
      const frames = new Set<string>();
      const positions = new Set<number>();
      // One-pixel wheel updates cross fewer than ten source frames here.
      for (let i = 0; i < 36; i++) {
        await page.mouse.wheel(0, 1);
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        frames.add(await paintedFrame(page));
        positions.add(await page.evaluate(() => scrollY));
      }
      // Device pixel ratios can coalesce one-pixel inputs; check actual movement.
      expect(positions.size).toBeGreaterThan(10);
      expect(frames.size).toBeGreaterThan(positions.size * 0.8);
      await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
      const held = await paintedFrame(page);
      await page.waitForTimeout(300);
      expect(await paintedFrame(page)).toBe(held);
    }
  });

  test('ordinary wheel gestures retain their full distance without a settling delay', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
    await scrollFilm(page, 3);
    await page.mouse.move(1000, 400);
    for (const delta of [120, 90, -120]) {
      const before = await page.evaluate(() => scrollY);
      await page.evaluate(() => window.addEventListener('wheel', event => {
        // Chrome scales injected wheel coordinates on high-DPI device profiles.
        document.documentElement.dataset.normalWheelDelta = String(event.deltaY);
      }, { once: true, passive: true }));
      await page.mouse.wheel(0, delta);
      await expect.poll(() => page.locator('html').getAttribute('data-normal-wheel-delta'), { timeout: 500 }).not.toBeNull();
      const input = Number(await page.locator('html').getAttribute('data-normal-wheel-delta'));
      await expect.poll(() => page.evaluate(() => scrollY), { timeout: 500 }).toBeCloseTo(before + input, 0);
      await page.locator('html').evaluate(el => { delete el.dataset.normalWheelDelta; });
      const position = await page.evaluate(() => scrollY);
      await page.waitForTimeout(120);
      expect(await page.evaluate(() => scrollY)).toBe(position);
    }
  });

  test('huge and high-frequency wheel input is limited without slowing ordinary gestures', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
    await scrollFilm(page, 7.5);
    await page.mouse.move(1000, 30);
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 100_000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
    await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
    const after = await page.evaluate(() => scrollY);
    expect(after - before).toBeGreaterThan(200);
    expect(after - before).toBeLessThan(350);

    const burst = await page.evaluate(async () => {
      const track = document.querySelector<HTMLElement>('[data-cinematic-story]')!;
      const distance = track.offsetHeight - (track.firstElementChild as HTMLElement).offsetHeight;
      const start = performance.now();
      const initial = scrollY;
      const samples: { time: number; position: number }[] = [];
      while (performance.now() - start < 2000) {
        // Many events in a frame must not accumulate a multi-scene destination.
        for (let i = 0; i < 20; i++) window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100_000, cancelable: true }));
        await new Promise(resolve => requestAnimationFrame(resolve));
        samples.push({ time: performance.now() - start, position: scrollY });
      }
      return { distance, initial, samples };
    });
    for (const sample of burst.samples) {
      const filmSeconds = (sample.position - burst.initial) / burst.distance * 30;
      // A short initial burst is allowed, then only five film seconds per second.
      expect(filmSeconds).toBeLessThanOrEqual(5 * (sample.time / 1000 + 0.3) + 0.1);
    }
    expect(burst.samples.at(-1)!.position - burst.initial).toBeGreaterThan(1200);
    const reversingAt = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, -100_000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(reversingAt);
    await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
    const stoppedAt = await page.evaluate(() => scrollY);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBe(stoppedAt);
  });

  test('successive wheel gestures settle within every chapter and across all chapter boundaries', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
    for (const time of [3, 7.8, 11, 15.8, 19.5, 22.8, 27]) {
      await scrollFilm(page, time);
      // Include wheel input over the fixed header while the film is visible.
      await page.mouse.move(1000, time === 11 ? 30 : 400);
      for (const direction of [1, 1, -1]) {
        const before = await paintedFrame(page);
        await page.evaluate(() => {
          window.addEventListener('wheel', event => {
            document.documentElement.dataset.wheelPrevented = String(event.defaultPrevented);
          }, { once: true, passive: true });
        });
        for (const delta of [2, 5, 8, 12, 8, 5, 2, 1]) {
          await page.mouse.wheel(0, delta * direction);
          await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
        }
        await expect(page.locator('html')).toHaveAttribute('data-wheel-prevented', 'true');
        await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
        const stoppedAt = await page.evaluate(() => scrollY);
        const held = await paintedFrame(page);
        expect(held, `Film moves at ${time}s, direction ${direction}`).not.toBe(before);
        await page.waitForTimeout(200);
        expect(await page.evaluate(() => scrollY), `No movement after the gesture settles at ${time}s`).toBe(stoppedAt);
        expect(await paintedFrame(page), `No delayed frame jump at ${time}s`).toBe(held);
      }
    }
    await page.locator('#home-content').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect.poll(() => page.locator('#home-content').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(100);
    await expect(page.locator('html')).not.toHaveClass(/lenis-smooth/);
    await page.mouse.move(1000, 400);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.locator(story).evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    await page.evaluate(() => {
      window.addEventListener('wheel', event => {
        document.documentElement.dataset.wheelPrevented = String(event.defaultPrevented);
      }, { once: true, passive: true });
    });
    await page.mouse.wheel(0, 80);
    await expect(page.locator('html')).toHaveAttribute('data-wheel-prevented', 'true');
  });
});

test('fast touch swipes are capped and settle without native momentum', async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile || browserName !== 'chromium', 'Real touch input through Chromium mobile emulation');
  await page.goto('/');
  await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
  const touch = await page.context().newCDPSession(page);
  const before = await page.evaluate(() => scrollY);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y: 700 }] });
  for (const y of [600, 400, 200, 100]) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 320, y }] });
  }
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
  const after = await page.evaluate(() => scrollY);
  expect(after - before).toBeGreaterThan(150);
  expect(after - before).toBeLessThan(500);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(after);
  await expect(page.locator('#story-mill')).toHaveAttribute('data-active', 'true');
  await touch.detach();
});

test('scrolling keys are paced while deliberate navigation can leave the film', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('PageDown');
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(150);
  expect(await page.evaluate(() => scrollY)).toBeLessThan(400);
  // End remains an explicit way to reach content immediately.
  await page.keyboard.press('End');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(5000);
});

test('scrolling reveals chapter copy and clears it during connecting moves', async ({ page }) => {
  await page.goto('/');
  for (const index of [1, 2, 3, 0]) {
    await scrollFilm(page, chapterTimes[index]);
    await expect(page.locator('[id^="story-"]').nth(index)).toHaveAttribute('data-active', 'true');
    await expect(page.locator(`${story}[data-travelling]`)).toHaveCount(0);
    await expect(page.locator('[id^="story-"][data-active][aria-hidden="false"]')).toHaveCount(1);
    for (const item of await page.locator('[id^="story-"][aria-hidden="true"]').all()) {
      await expect(item).toHaveAttribute('inert', '');
    }
  }
  await scrollFilm(page, 16);
  await expect(page.locator(story)).toHaveAttribute('data-travelling', 'true');
  await expect(page.locator('[id^="story-"][inert]')).toHaveCount(4);
  await scrollFilm(page, 19.5);
  await page.getByRole('link', { name: 'See the applications' }).click();
  await expect(page).toHaveURL(/\/products\/pc-strand#applications$/);
  // Native anchors include both the header padding and section scroll margin.
  const anchorOffset = () => page.locator('#applications').evaluate(el => Math.abs(
    el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop)
      - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
  ));
  await expect.poll(anchorOffset).toBeLessThan(5);
  await page.getByRole('link', { name: 'Wire & Wire home', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('#story-mill')).toHaveAttribute('data-active', 'true');
  await scrollFilm(page, 19.5);
  await page.getByRole('link', { name: 'See the applications' }).click();
  await expect(page).toHaveURL(/\/products\/pc-strand#applications$/);
  await expect.poll(anchorOffset).toBeLessThan(5);
  await page.reload();
  await expect.poll(anchorOffset).toBeLessThan(5);
});

test('fast scroll input settles at the latest frame and navigation releases the decoder', async ({ page }) => {
  await page.goto('/');
  const video = page.locator(`${story} video`);
  await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
  await page.evaluate(async () => {
    const track = document.querySelector<HTMLElement>('[data-cinematic-story]')!;
    const distance = track.offsetHeight - (track.firstElementChild as HTMLElement).offsetHeight;
    for (const progress of [0.95, 0.2, 0.7, 0.1, 0.99]) {
      window.scrollTo({ top: distance * progress, behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(29.5);
  await expect(video).toHaveJSProperty('seeking', false);
  await scrollFilm(page, 0);
  const handle = await video.elementHandle();
  await page.getByRole('link', { name: 'Discover our products', exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect.poll(() => handle!.evaluate(el => el.isConnected)).toBe(false);
  expect(await handle!.evaluate(el => el.getAttribute('src'))).toBeNull();
  await page.goBack();
  await expect(page.locator(`${story} video`)).toHaveCount(1);
  await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
  await page.locator('#home-content').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect.poll(() => page.locator('#home-content').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(100);
});

test('resizing switches the film crop without leaving an extra decoder', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop window resize across the mobile breakpoint');
  await page.goto('/');
  await expect(page.locator(`${story} video`)).toHaveAttribute('src', '/world/cinematic/journey.mp4');
  await scrollFilm(page, 12);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(`${story} video`)).toHaveAttribute('src', '/world/cinematic/mobile/journey.mp4');
  await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
  await scrollFilm(page, 19.5);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(`${story} video`)).toHaveCount(1);
  await expect(page.locator(`${story} video`)).toHaveAttribute('src', '/world/cinematic/journey.mp4');
  await scrollFilm(page, 28);
});

test('all chapters retain their photographic posters when video fails', async ({ page }) => {
  await page.route('**/world/cinematic/**/*.mp4', route => route.abort());
  await page.goto('/');
  for (const index of [0, 1, 2, 3]) {
    await scrollStory(page, chapterTimes[index]);
    await expect(page.locator('[id^="story-"]').nth(index)).toHaveAttribute('data-active', 'true');
    const poster = page.locator(`${story} figure[data-active] img`);
    await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(poster).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Explore our projects', exact: true })).toBeVisible();
});

test('reduced motion loads no film and preserves scroll access to all chapters', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mediaRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('/cinematic/') && request.url().endsWith('.mp4')) mediaRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.locator(`${story} video`)).toHaveCount(0);
  await scrollStory(page, chapterTimes[3]);
  await expect(page.locator('#story-skyline')).toHaveAttribute('data-active', 'true');
  expect(await page.locator('#story-skyline').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThan(0.01);
  expect(mediaRequests).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator(`${story} video`)).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(`${story} video`)).toHaveCount(0);
});

test('compact layouts retain readable titles and reachable product links', async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, 'Viewport matrix runs once');
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator(`${story} canvas`)).toHaveAttribute('data-ready', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const title = await page.locator(`${story} h1`).boundingBox();
    expect(title!.y).toBeGreaterThan(65);
    const firstLink = await page.locator('#story-mill a').boundingBox();
    expect(firstLink!.y + firstLink!.height).toBeLessThanOrEqual(viewport.height - 12);
    for (const index of [1, 2, 3]) {
      await scrollFilm(page, chapterTimes[index]);
      const copy = page.locator('[id^="story-"]').nth(index);
      await expect(copy).toHaveAttribute('data-active', 'true');
      await expect(copy).toHaveCSS('opacity', '1');
      await expect(copy.locator('..')).toHaveCSS('opacity', '1');
      const content = await copy.boundingBox();
      const heading = await copy.getByRole('heading').boundingBox();
      const link = await copy.getByRole('link').boundingBox();
      expect(content!.y).toBeGreaterThan(65);
      expect(heading!.y).toBeGreaterThan(65);
      expect(link!.y + link!.height).toBeLessThanOrEqual(viewport.height - 12);
      if (index === 2) await page.screenshot({ path: testInfo.outputPath(`making-clean-${viewport.width}.png`) });
    }
    await page.screenshot({ path: testInfo.outputPath(`cinematic-${viewport.width}.png`) });
  }
});
