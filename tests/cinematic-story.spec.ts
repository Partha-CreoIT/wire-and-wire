import { test, expect, type Page } from '@playwright/test';

const story = '[data-cinematic-story]';
const chapterButtons = 'nav[aria-label="Story chapters"] button';

async function scrollFilm(page: Page, seconds: number) {
  await expect(page.locator('html')).not.toHaveClass(/lenis-smooth/);
  await page.evaluate(time => {
    const track = document.querySelector<HTMLElement>('[data-cinematic-story]')!;
    const panel = track.firstElementChild as HTMLElement;
    const top = track.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (track.offsetHeight - panel.offsetHeight) * time / 30, behavior: 'instant' });
  }, seconds);
  const video = page.locator(`${story} video`);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement, time) => Math.abs(v.currentTime - (v.duration - 1 / 24) * time / 30), seconds)).toBeLessThan(0.08);
  await expect(video).toHaveJSProperty('seeking', false);
}

async function paintedFrame(page: Page) {
  return page.locator(`${story} video`).evaluate((v: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 36;
    canvas.getContext('2d')!.drawImage(v, 0, 0, 64, 36);
    return canvas.toDataURL();
  });
}

test('scrolling paints the full film, reverses it and holds its frame when scrolling stops', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const video = page.locator(`${story} video`);
  await expect(video).toHaveAttribute('data-ready', 'true');
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

test('chapter links follow decoded frames and captions clear the connecting moves', async ({ page }) => {
  await page.goto('/');
  const buttons = page.locator(chapterButtons);
  for (const index of [1, 2, 3, 0]) {
    await buttons.nth(index).click();
    await expect(buttons.nth(index)).toHaveAttribute('aria-current', 'step');
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
});

test('fast scroll input settles at the latest frame and navigation releases the decoder', async ({ page }) => {
  await page.goto('/');
  const video = page.locator(`${story} video`);
  await expect(video).toHaveAttribute('data-ready', 'true');
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
  await expect(page.locator(`${story} video`)).toHaveAttribute('data-ready', 'true');
  await page.getByRole('link', { name: 'Skip the story', exact: true }).click();
  await expect.poll(() => page.locator('#home-content').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(100);
});

test('resizing switches the film crop without leaving an extra decoder', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop window resize across the mobile breakpoint');
  await page.goto('/');
  await expect(page.locator(`${story} video`)).toHaveAttribute('src', '/world/cinematic/journey.mp4');
  await scrollFilm(page, 12);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(`${story} video`)).toHaveAttribute('src', '/world/cinematic/mobile/journey.mp4');
  await expect(page.locator(`${story} video`)).toHaveAttribute('data-ready', 'true');
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
    await page.locator(chapterButtons).nth(index).click();
    const poster = page.locator(`${story} figure[data-active] img`);
    await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(poster).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Explore our projects', exact: true })).toBeVisible();
});

test('reduced motion loads no film and preserves chapter navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mediaRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('/cinematic/') && request.url().endsWith('.mp4')) mediaRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.locator(`${story} video`)).toHaveCount(0);
  await page.locator(chapterButtons).nth(3).click();
  await expect(page.locator('#story-skyline')).toHaveAttribute('data-active', 'true');
  expect(await page.locator('#story-skyline').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThan(0.01);
  expect(mediaRequests).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator(`${story} video`)).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(`${story} video`)).toHaveCount(0);
});

test('compact layouts retain readable titles and reachable chapter controls', async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, 'Viewport matrix runs once');
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator(`${story} video`)).toHaveAttribute('data-ready', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const title = await page.locator(`${story} h1`).boundingBox();
    expect(title!.y).toBeGreaterThan(65);
    for (const index of [1, 2, 3]) {
      await page.locator(chapterButtons).nth(index).click();
      await expect(page.locator(chapterButtons).nth(index)).toHaveAttribute('aria-current', 'step');
      const buttons = await page.locator('nav[aria-label="Story chapters"]').boundingBox();
      expect(buttons!.y + buttons!.height).toBeLessThanOrEqual(viewport.height);
    }
    await page.screenshot({ path: testInfo.outputPath(`cinematic-${viewport.width}.png`) });
  }
});
