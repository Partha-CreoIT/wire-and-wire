import { test, expect, type Page } from '@playwright/test';

function filmSpans(page: Page, family = false) {
  const spans = family ? [1.6] : [1.45, 1.18, 1.18, 1.18, 1.18, 1.45];
  return page.viewportSize()!.width <= 760 ? spans.map(() => 0.55) : spans;
}

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

test('product films paint different frames as the user scrolls', async ({ page }, testInfo) => {
  for (const path of ['/products', '/products/pc-strand']) {
    await page.goto(path);
    await expect(page.locator('.sw-scene video').first()).toHaveJSProperty('readyState', 4);
    // A real gesture exercises mobile video activation before scrolling.
    await page.locator('.sw-copy__title').first().click();
    const span = filmSpans(page, path !== '/products')[0];
    await page.evaluate(span => window.scrollTo(0, innerHeight * span * 0.15), span);
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.4);
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.seeking)).toBe(false);
    const before = await frameSignature(page);
    expect(before).toBeGreaterThan(1000);
    await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll('/', '-') || 'home'}-start.png`) });
    await page.evaluate(span => window.scrollTo(0, innerHeight * span * 0.55), span);
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(2);
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.seeking)).toBe(false);
    expect(await frameSignature(page)).not.toBe(before);
    await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll('/', '-') || 'home'}-scrolled.png`) });
    await page.evaluate(span => window.scrollTo(0, innerHeight * span * 0.15), span);
    await expect.poll(() => page.locator('.sw-scene video').first().evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('product films cap fast gestures and return to ordinary scrolling after the intro', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Wheel input runs on desktop');
  for (const path of ['/products', '/products/pc-strand']) {
    await page.goto(path);
    await expect(page.locator('.sw-root')).toHaveAttribute('data-cinematic-duration');
    await page.mouse.move(1000, 400);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 500 }).toBe(120);
    await page.mouse.wheel(0, 100_000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
    await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
    expect(await page.evaluate(() => scrollY)).toBeLessThan(620);
    await page.locator('.sw-track').evaluate(track => window.scrollTo({ top: track.getBoundingClientRect().bottom + scrollY, behavior: 'instant' }));
    const position = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 1000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(position + 500);
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

test('opening products through home never carries the previous footer position', async ({ page }) => {
  await page.goto('/products/pc-bar');
  for (const product of ['PC Wire', 'PC Bar', 'PC Strand', 'Galvanized Strand & Wire', 'Other Wires']) {
    await page.locator('footer').evaluate(el => el.scrollIntoView({ block: 'end', behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    await page.getByRole('link', { name: 'Wire & Wire home', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(1);
    await page.getByRole('link', { name: `Explore ${product}`, exact: true }).click();
    await expect(page.locator('.sw-copy h1')).toHaveText(product);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => scrollY)).toBeLessThan(10);
  }
});

test('the logo restarts home while other home links remember the saved position', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cinematic-story]')).toHaveAttribute('data-enhanced', 'true');
  await page.locator('#home-content').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const position = await page.evaluate(() => scrollY);
  await navigate(page, '/about');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  await page.getByRole('link', { name: 'Wire & Wire home', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(1);
  await expect(page.locator('#story-mill')).toHaveAttribute('data-active', 'true');
  await page.locator('#home-content').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await navigate(page, '/contact');
  await page.locator('footer nav[aria-label="Footer navigation"] a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
});

test('the home logo resets the first scene from the film, footer and open mobile menu', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('[data-cinematic-story] canvas')).toHaveAttribute('data-ready', 'true');
  for (const top of [3000, 8000]) {
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click();
    else await page.mouse.wheel(0, 100_000);
    await page.getByRole('link', { name: 'Wire & Wire home', exact: true }).click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('#story-mill')).toHaveAttribute('data-active', 'true');
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
});

test('navigation clears wheel inertia but Back and Forward preserve their positions', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop wheel inertia and history restoration');
  await page.goto('/products/pc-bar');
  await expect(page.locator('.sw-copy h1')).toHaveText('PC Bar');
  await page.locator('footer').evaluate(el => el.scrollIntoView({ block: 'end', behavior: 'instant' }));
  await page.mouse.move(1100, 450);
  await page.mouse.wheel(0, -1200);
  await expect(page.locator('html')).toHaveClass(/lenis-scrolling/);
  await page.getByRole('link', { name: 'Wire & Wire home', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  await page.waitForTimeout(1400);
  expect(await page.evaluate(() => scrollY)).toBeLessThan(10);

  const product = page.getByRole('link', { name: 'Explore PC Wire', exact: true });
  await product.scrollIntoViewIfNeeded();
  // Capture at the click: revealing the card can move it during hit testing.
  await page.evaluate(() => document.addEventListener('click', () => {
    document.documentElement.dataset.leavingScrollY = String(scrollY);
  }, { once: true, capture: true }));
  await product.click();
  const homePosition = Number(await page.locator('html').getAttribute('data-leaving-scroll-y'));
  await expect(page.locator('.sw-copy h1')).toHaveText('PC Wire');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(homePosition, 0);
  await page.goForward();
  await expect(page).toHaveURL(/\/products\/pc-wire$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(500, 0);
});

test('product names and process copy remain accessible by scrolling without a route rail', async ({ page }, testInfo) => {
  await page.goto('/products');
  const spans = filmSpans(page);
  const scrollToScene = async (index: number) => {
    const position = spans.slice(0, index).reduce((sum, span) => sum + span, 0) + (index === 0 ? 0 : spans[index] / 2);
    await page.locator('.sw-root').evaluate((root, position) => {
      window.scrollTo({ top: root.getBoundingClientRect().top + scrollY + innerHeight * position, behavior: 'instant' });
    }, position);
  };
  await expect(page.locator('.sw-route')).toHaveCount(0);
  await expect(page.locator('.sw-hint')).toHaveCount(0);
  await expect(page.locator('.sw-copy__eyebrow')).toHaveText(['PC Strand', 'PC Strand', 'PC Wire', 'PC Bar', 'Galvanized Strand & Wire', 'Unbonded Strand']);
  await expect(page.locator('.sw-copy').nth(1)).toContainText('Prestressing is the process of tensioning PC strand');
  await expect(page.locator('.sw-root')).not.toContainText('Product cinematic');
  await page.screenshot({ path: testInfo.outputPath('products-clean.png') });
  for (const index of [1, 2, 3, 4, 5, 0]) {
    await scrollToScene(index);
    await expect.poll(() => page.locator('.sw-copy').nth(index).evaluate(e => Number(getComputedStyle(e).opacity))).toBeGreaterThan(0.8);
    if (index === 1) await page.screenshot({ path: testInfo.outputPath('pc-strand-process.png') });
    const inactiveLinks = await page.locator('.sw-copy').evaluateAll(copies => copies
      .filter(copy => Number(getComputedStyle(copy).opacity) <= 0.5)
      .flatMap(copy => Array.from(copy.querySelectorAll('a')))
      .filter(link => !link.closest('[inert]')));
    expect(inactiveLinks).toHaveLength(0);
  }
  await scrollToScene(5);
  await page.getByRole('link', { name: 'View products', exact: true }).click();
  await expect.poll(() => page.locator('#product-archive').evaluate(e => Math.abs(e.getBoundingClientRect().top - 58))).toBeLessThan(5);
});

test('all main and product routes remain reachable through navigation', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('[data-cinematic-story]')).toBeVisible();
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
  if (browserName === 'webkit') await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'instant' }));
  else await page.mouse.wheel(0, 450);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1);
});

test('leaving a film releases its video sources', async ({ page }) => {
  await page.goto('/products');
  await expect(page.locator('.sw-scene video').first()).toHaveJSProperty('readyState', 4);
  const videos = await page.locator('.sw-scene video').elementHandles();
  await navigate(page, '/about');
  for (const video of videos) {
    await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).getAttribute('src'))).toBeNull();
    expect(await video.evaluate(v => v.isConnected)).toBe(false);
  }
  await navigate(page, '/products');
  await expect(page.locator('.sw-track')).toHaveCount(1);
});

test('compact and rotated screens keep film content clear of navigation', async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, 'Viewport matrix runs once alongside the touch-browser tests');
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    for (const path of ['/products', '/products/pc-strand']) {
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

test('reduced motion keeps home and product content accessible by scrolling without video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('nav[aria-label="Story chapters"]')).toHaveCount(0);
  await expect(page.locator('.sw-scene video')).toHaveCount(0);
  await expect(page.locator('[data-cinematic-story]')).toHaveAttribute('data-enhanced', 'true');
  await page.locator('[data-cinematic-story]').evaluate(track => {
    const panel = track.firstElementChild as HTMLElement;
    window.scrollTo({ top: track.getBoundingClientRect().top + scrollY + ((track as HTMLElement).offsetHeight - panel.offsetHeight) * 19.5 / 30, behavior: 'instant' });
  });
  await expect(page.locator('#story-build')).toHaveAttribute('data-active', 'true');
  await expect(page.getByRole('link', { name: 'See the applications', exact: true })).toBeVisible();
  await navigate(page, '/products');
  await expect(page.locator('.sw-scene video')).toHaveCount(0);
  await expect(page.locator('.sw-route')).toHaveCount(0);
  const spans = filmSpans(page);
  await page.evaluate(position => window.scrollTo({ top: innerHeight * position, behavior: 'instant' }), spans[0] + spans[1] / 2);
  await expect.poll(() => page.locator('.sw-copy').nth(1).evaluate(e => Number(getComputedStyle(e).opacity))).toBeGreaterThan(0.8);
  await page.locator('footer a[href="/products/pc-bar"]').click();
  await expect(page.locator('.sw-copy h1')).toHaveText('PC Bar');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  await page.getByRole('link', { name: 'Open the catalogue', exact: true }).click();
  await expect.poll(() => page.locator('#product-data').evaluate(el => Math.abs(el.getBoundingClientRect().top - 58))).toBeLessThan(5);
});
