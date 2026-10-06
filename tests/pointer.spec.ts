import { test, expect } from '@playwright/test';

test('speed lines follow direction, fade on rest and release on pause', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveAttribute('data-in-view', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
  await page.mouse.move(200, 180);
  const trail = page.locator('.speed-trail');
  await expect(page.locator('.pointer-light, .pointer-trail')).toHaveCount(0);
  // Sample inside animation frames while moving: a tool round-trip can outlast
  // the intentionally short 170ms trail when the full suite loads the CPU.
  const sampleMove = async (x: number, y: number) => {
    const [samples] = await Promise.all([
      trail.evaluate(el => new Promise<string[]>(resolve => {
        const samples: string[] = [], start = performance.now();
        const sample = () => {
          const stroke = el.querySelector('i')!;
          if (Number(getComputedStyle(stroke).opacity) > 0) samples.push(stroke.style.transform);
          if (performance.now() - start < 800) requestAnimationFrame(sample);
          else resolve(samples);
        };
        requestAnimationFrame(sample);
      })),
      page.mouse.move(x, y, { steps: 12 }),
    ]);
    expect(samples.length).toBeGreaterThan(0);
    return samples.at(-1)!;
  };
  const horizontal = await sampleMove(400, 180);
  const vertical = await sampleMove(400, 350);
  expect(vertical.split('rotate(')[1]).not.toBe(horizontal.split('rotate(')[1]);
  const card = page.locator('[data-preview-id="hero"]');
  const bounds = (await card.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * .75, bounds.y + bounds.height * .4, { steps: 15 });
  await expect(card).toHaveAttribute('data-pointer', 'true');
  await expect.poll(() => card.evaluate(el => el.style.getPropertyValue('--pointer-x'))).not.toBe('');
  await expect.poll(() => card.locator('.preview-poster').evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await expect(trail).toHaveAttribute('data-visible', 'false');
  const action = card.getByRole('button', { name: 'Xem 3D', exact: true });
  await action.hover();
  await expect(action).toHaveAttribute('data-magnetic', 'true');
  await page.mouse.move(bounds.x + bounds.width * .75, bounds.y + bounds.height * .4, { steps: 15 });
  await page.screenshot({ path: 'test-results/v10-pointer-hero.png' });
  await page.getByRole('combobox', { name: 'Chuyển động' }).selectOption('off');
  await expect(trail).toHaveAttribute('data-visible', 'false');
  await expect(card).not.toHaveAttribute('data-pointer', 'true');
});

test('pointer in 3D follows without changing the camera, also in the dialog', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('[data-preview-id="story"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  const canvas = card.locator('canvas');
  await expect(canvas).toHaveAttribute('data-model-ready', 'true');
  const camera = await canvas.getAttribute('data-camera');
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.move(box.x + box.width - 40, box.y + box.height / 2, { steps: 15 });
  await expect(card).toHaveAttribute('data-pointer', 'true');
  await expect(canvas).toHaveAttribute('data-camera', camera!);
  await card.getByRole('button', { name: 'Phóng to', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('canvas').hover();
  await expect(dialog).toHaveAttribute('data-pointer', 'true');
  await expect(dialog.locator('.speed-trail')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.mouse.move(100, 100);
  await expect(page.locator('.speed-trail')).toHaveCount(1);
});

test('reduced motion has no pointer trail or tilt', async ({ page }) => {
  await page.goto('/');
  await page.mouse.move(700, 350);
  await expect(page.locator('.speed-trail')).toHaveAttribute('data-visible', 'false');
  expect(await page.locator('[data-pointer=true]').count()).toBe(0);
});

test('touch produces a short pulse without a persistent cursor or blocked scrolling', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  // Explicit absolute URL also works when this suite targets the public deployment.
  await page.goto(test.info().project.use.baseURL!);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
  await page.touchscreen.tap(200, 250);
  await expect(page.locator('.touch-pulse')).toHaveCount(1);
  await expect(page.locator('.speed-trail')).toHaveAttribute('data-visible', 'false');
  await expect(page.locator('.touch-pulse')).toHaveCount(0);
  const client = await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 650 }] });
  for (const y of [590, 520, 440, 350]) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await context.close();
});
