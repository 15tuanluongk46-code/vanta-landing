import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop wheel settles on the next section and reverses cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.mouse.move(30, 450);
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.locator('.story').evaluate(e => Math.abs(e.getBoundingClientRect().top)), { timeout: 5000 }).toBeLessThan(3);
  await page.mouse.wheel(0, -650);
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 5000 }).toBeLessThan(3);
});

test('viewer keeps each card theme inline and expanded', async ({ page }) => {
  await page.goto('/');
  for (const id of ['hero', 'story', 'campaign', 'detail-upper', 'detail-heel', 'detail-sole', 'color']) {
    const card = page.locator(`[data-preview-id="${id}"]`);
    const background = () => card.evaluate(e => {
      for (let node: Element | null = e; node; node = node.parentElement) {
        const color = getComputedStyle(node).backgroundColor;
        if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
      }
      return '';
    });
    const original = await background();
    await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
    await expect(card.locator('canvas')).toHaveAttribute('data-model-ready', 'true');
    expect(await background()).toBe(original);
    await card.getByRole('button', { name: 'Phóng to', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCSS('background-color', original);
    if (id === 'campaign') {
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
      await page.getByRole('dialog').screenshot({ path: 'test-results/v7-campaign-theme.png' });
    }
    await page.keyboard.press('Escape');
    await card.getByRole('button', { name: 'Xem ảnh', exact: true }).click();
  }
});

test('desktop sections fit their content and wheel through every stop', async ({ page }) => {
  test.setTimeout(60000);
  for (const size of [{ width: 1440, height: 700 }, { width: 1920, height: 1080 }, { width: 2494, height: 1321 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    await page.mouse.move(10, size.height / 2);
    for (const selector of ['.story', '.lookbook', '.details', '.color-section', '.closing']) {
      await page.mouse.wheel(0, size.height * .8);
      await expect.poll(() => page.locator(selector).evaluate(e => Math.abs(e.getBoundingClientRect().top))).toBeLessThan(3);
      if (selector !== '.closing') {
        // Measure parent and descendants in one frame: native snap can still
        // travel the final two pixels after the alignment assertion passes.
        const bounds = await page.locator(selector).evaluate(section => {
          const box = section.getBoundingClientRect();
          return { height: box.height, children: [...section.querySelectorAll('h2, h3, p, .product-preview')].map(child => {
            const rect = child.getBoundingClientRect();
            return { top: rect.top - box.top, bottom: rect.bottom - box.top };
          }) };
        });
        expect(bounds.height).toBeLessThanOrEqual(size.height + 2);
        for (const rect of bounds.children) {
          expect(rect.top).toBeGreaterThanOrEqual(-1);
          expect(rect.bottom).toBeLessThanOrEqual(bounds.height + 1);
        }
      }
    }
    await page.keyboard.press('End');
    await expect.poll(() => page.locator('.footer-bottom').evaluate(e => e.getBoundingClientRect().bottom)).toBeLessThanOrEqual(size.height + 1);
  }
});

test('mobile and short screens keep long sections readable; keyboard and resize remain usable', async ({ page }) => {
  for (const size of [{ width: 390, height: 844 }, { width: 768, height: 600 }, { width: 1440, height: 600 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    for (const article of await page.locator('.detail-grid article').all()) {
      await article.evaluate(e => e.scrollIntoView({ behavior: 'instant', block: 'start' }));
      await expect(article.getByRole('heading')).toBeInViewport();
      await expect(article.locator('p')).toBeInViewport();
    }
    await page.keyboard.press('End');
    await expect.poll(() => page.locator('.footer-bottom').evaluate(e => e.getBoundingClientRect().bottom)).toBeLessThanOrEqual(size.height + 1);
    await page.keyboard.press('Home');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3);
    await page.keyboard.press('PageDown');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('all colorway themes follow the active variant in the expanded viewer', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-preview-id="color"]');
  for (const [name, color] of [['Sakura', 'rgb(230, 215, 224)'], ['Lagoon', 'rgb(208, 226, 226)'], ['Citrus', 'rgb(223, 227, 200)']]) {
    await page.getByRole('button', { name, exact: true }).click();
    await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
    await card.getByRole('button', { name: 'Phóng to', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCSS('background-color', color);
    await expect(page.getByRole('dialog').locator('canvas')).toHaveAttribute('data-model-ready', 'true');
    await page.getByRole('dialog').screenshot({ path: `test-results/v7-theme-${name}.png` });
    await page.keyboard.press('Escape');
    await card.getByRole('button', { name: 'Xem ảnh', exact: true }).click();
  }
});

test('wheel scrolls page inline but zooms in expanded viewer', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-preview-id="story"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  const canvas = card.locator('canvas');
  await expect(canvas).toHaveAttribute('data-model-ready', 'true');
  const camera = await canvas.getAttribute('data-camera');
  const start = await page.evaluate(() => scrollY);
  await canvas.hover(); await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(start + 50);
  await expect(canvas).toHaveAttribute('data-camera', camera!);
  await card.getByRole('button', { name: 'Phóng to', exact: true }).click();
  const expanded = page.getByRole('dialog').locator('canvas');
  await expect(expanded).toHaveAttribute('data-model-ready', 'true');
  const before = await expanded.getAttribute('data-camera');
  const y = await page.evaluate(() => scrollY);
  await expanded.hover(); await page.mouse.wheel(0, 150);
  await expect(expanded).not.toHaveAttribute('data-camera', before!);
  expect(await page.evaluate(() => scrollY)).toBe(y);
});
