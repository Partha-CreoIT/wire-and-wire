import { test, expect, type Page } from '@playwright/test';

async function navigate(page: Page, href: string) {
  const menu = page.getByRole('button', { name: 'Open menu' });
  if (await menu.isVisible()) {
    await menu.click();
    await page.locator(`#mobile-menu a[href="${href}"]`).click();
  } else {
    await page.locator(`header nav[aria-label="Primary navigation"] a[href="${href}"]`).click();
  }
  await expect(page).toHaveURL(new URL(href, page.url()).href);
}

async function frameSignature(page: Page, index = 0) {
  return page.locator('.sw-scene video').nth(index).evaluate((video: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d')!;
    context.drawImage(video, 0, 0, 32, 32);
    const pixels = context.getImageData(0, 0, 32, 32).data;
    return Array.from(pixels).filter((_, i) => i % 4 !== 3).reduce((sum, pixel) => sum + pixel, 0);
  });
}

test('home and product films paint different frames as the user scrolls', async ({ page }, testInfo) => {
  for (const path of ['/', '/products', '/products/pc-strand']) {
    await page.goto(path);
    await expect(page.locator('.sw-scene video').first()).toHaveJSProperty('readyState', 4);
    // A real gesture exercises mobile video activation before scrolling.
    await page.locator('.sw-copy__title').first().click();
    await page.evaluate(() => window.scrollTo(0, innerHeight * 0.2));
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.4);
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.seeking)).toBe(false);
    const before = await frameSignature(page);
    expect(before).toBeGreaterThan(1000);
    await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll('/', '-') || 'home'}-start.png`) });
    await page.evaluate(() => window.scrollTo(0, innerHeight * 0.75));
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(2);
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.seeking)).toBe(false);
    expect(await frameSignature(page)).not.toBe(before);
    await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll('/', '-') || 'home'}-scrolled.png`) });
    await page.evaluate(() => window.scrollTo(0, innerHeight * 0.2));
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('product navigation replaces the film and returns to its beginning', async ({ page }) => {
  await page.goto('/products/pc-strand');
  await expect(page.locator('.sw-copy h1')).toHaveText('PC Strand');
  await page.locator('a[href="/products/pc-wire"]').first().click();
  await expect(page).toHaveURL(/\/products\/pc-wire$/);
  await expect(page.locator('.sw-copy h1')).toHaveText('PC Wire');
  await expect(page.locator('.sw-track')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  await page.goBack();
  await expect(page.locator('.sw-copy h1')).toHaveText('PC Strand');
});

test('story chapter buttons reveal their copy and do not retain invisible links', async ({ page }) => {
  for (const { path, count } of [{ path: '/', count: 4 }, { path: '/products', count: 6 }]) {
    await page.goto(path);
    await expect(page.locator('.sw-route__dot')).toHaveCount(count);
    for (const index of [...Array.from({ length: count - 1 }, (_, i) => i + 1), 0]) {
      await page.locator('.sw-route__dot').nth(index).click();
      await expect.poll(() => page.locator('.sw-copy').nth(index).evaluate(e => Number(getComputedStyle(e).opacity))).toBeGreaterThan(0.8);
      const inactiveLinks = await page.locator('.sw-copy').evaluateAll(copies => copies
        .filter(copy => Number(getComputedStyle(copy).opacity) <= 0.5)
        .flatMap(copy => Array.from(copy.querySelectorAll('a')))
        .filter(link => !link.closest('[inert]')));
      expect(inactiveLinks).toHaveLength(0);
    }
  }
  await page.locator('.sw-route__dot').last().click();
  await page.getByRole('link', { name: 'View products', exact: true }).click();
  await expect.poll(() => page.locator('#product-archive').evaluate(e => Math.abs(e.getBoundingClientRect().top - 58))).toBeLessThan(5);
});

test('all main and product routes remain reachable through navigation', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.sw-root')).toBeVisible();
  for (const href of ['/products', '/projects', '/about', '/contact', '/']) {
    await navigate(page, href);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await navigate(page, '/products');
  const productLinks = await page.locator('footer a[href^="/products/"]').evaluateAll(links => links.map(link => link.getAttribute('href')!));
  expect(productLinks.length).toBeGreaterThan(3);
  for (const href of productLinks) {
    await page.locator(`footer a[href="${href}"]`).click();
    await expect(page).toHaveURL(new URL(href, page.url()).href);
    await expect(page.locator('.sw-copy h1')).toBeVisible();
    await expect(page.locator('.sw-copy h1')).toHaveText(await page.locator('section[aria-label$="cinematic story"]').getAttribute('aria-label').then(label => label!.replace(' cinematic story', '')));
    await expect(page.locator('.sw-track')).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath(`${href.split('/').pop()}.png`) });
  }
  expect(errors).toEqual([]);
});

test('mobile menu closes on Escape and desktop resize, restoring scroll', async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile, 'Mobile menu workflow');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  if (browserName === 'webkit') await page.locator('.sw-route__dot').nth(1).click();
  else await page.mouse.wheel(0, 450);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test('leaving a film releases its video sources', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.sw-scene video').first()).toHaveJSProperty('readyState', 4);
  const videos = await page.locator('.sw-scene video').elementHandles();
  await navigate(page, '/about');
  for (const video of videos) {
    await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).getAttribute('src'))).toBeNull();
    expect(await video.evaluate(v => v.isConnected)).toBe(false);
  }
  await navigate(page, '/');
  await expect(page.locator('.sw-track')).toHaveCount(1);
});

test('compact and rotated screens keep film content clear of navigation', async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, 'Viewport matrix runs once alongside the touch-browser tests');
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    for (const path of ['/', '/products/pc-strand']) {
      await page.goto(path);
      await expect(page.locator('.sw-copy').first()).toHaveCSS('opacity', '1');
      await page.screenshot({ path: testInfo.outputPath(`${viewport.width}-${path.replaceAll('/', '-')}.png`) });
      const copy = await page.locator('.sw-copy').first().boundingBox();
      expect(copy!.y, `${path} at ${viewport.width}: copy clears header`).toBeGreaterThanOrEqual(66);
      expect(copy!.y + copy!.height, `${path} at ${viewport.width}: copy stays in viewport`).toBeLessThanOrEqual(viewport.height - 12);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('catalogue videos play when their section enters view', async ({ page }) => {
  await page.goto('/products/pc-strand');
  const video = page.locator('[id^="variant-"] video').first();
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  const time = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).not.toBe(time);
});

test('reduced motion keeps story navigation and content accessible without video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.sw-route__dot')).toHaveCount(4);
  await expect(page.locator('.sw-scene video')).toHaveCount(0);
  await page.locator('.sw-route__dot').nth(2).click();
  await expect(page.locator('.sw-route__dot').nth(2)).toHaveClass(/is-active/);
  await navigate(page, '/products');
  await expect(page.locator('.sw-scene video')).toHaveCount(0);
});
