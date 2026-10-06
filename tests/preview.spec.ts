import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('hero image stays fully inside its own stage during motion and at every width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [360, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const image = page.locator('.hero-shoe');
    const stage = page.locator('.hero-art');
    for (let sample = 0; sample < 5; sample++) {
      const a = (await image.boundingBox())!; const b = (await stage.boundingBox())!;
      expect(a.x).toBeGreaterThanOrEqual(b.x - 1);
      expect(a.y).toBeGreaterThanOrEqual(b.y - 1);
      expect(a.x + a.width).toBeLessThanOrEqual(b.x + b.width + 1);
      expect(a.y + a.height).toBeLessThanOrEqual(b.y + b.height + 1);
      await page.waitForTimeout(250);
    }
    await stage.screenshot({ path: `test-results/hero-fit-${width}.png` });
  }
});

test('every product card opens a drawn model, only one canvas stays active', async ({ page }) => {
  const modelRequests: string[] = [];
  page.on('request', request => { if (request.url().endsWith('.glb')) modelRequests.push(request.url()); });
  await page.goto('/');
  expect(await page.locator('canvas').count()).toBe(0);
  expect(modelRequests).toHaveLength(0);
  const cards = page.locator('[data-preview-id]');
  await expect(cards).toHaveCount(7);
  for (const card of await cards.all()) {
    await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(card.locator('canvas')).toHaveAttribute('data-model-ready', 'true');
    await card.screenshot({ path: `test-results/inline-${await card.getAttribute('data-preview-id')}.png` });
  }
  expect(modelRequests).toHaveLength(1);
});

test('orbit, zoom, reset, expanded dialog and focus return work', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-preview-id="hero"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  const canvas = card.locator('canvas');
  await expect(canvas).toHaveAttribute('data-model-ready', 'true');
  const initial = await canvas.getAttribute('data-camera');
  const b = (await canvas.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + 80, b.y + b.height / 2 + 50, { steps: 8 }); await page.mouse.up();
  await expect(canvas).not.toHaveAttribute('data-camera', initial!);
  await card.getByRole('button', { name: 'Đặt lại góc nhìn' }).click();
  await expect(canvas).toHaveAttribute('data-camera', initial!);
  await card.getByRole('button', { name: 'Phóng to', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(dialog.locator('canvas')).toHaveAttribute('data-model-ready', 'true');
  const beforeZoom = await dialog.locator('canvas').getAttribute('data-camera');
  await dialog.getByRole('button', { name: 'Zoom gần' }).click();
  await expect(dialog.locator('canvas')).not.toHaveAttribute('data-camera', beforeZoom!);
  await dialog.getByRole('button', { name: 'Xem mặt đế' }).click();
  await expect(dialog.locator('canvas')).toHaveAttribute('data-view', 'bottom');
  await dialog.screenshot({ path: 'test-results/expanded-bottom.png' });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(card.getByRole('button', { name: 'Phóng to', exact: true })).toBeFocused();
  await card.getByRole('button', { name: 'Xem ảnh', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('color preview changes actual texture and supports mobile touch', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const card = page.locator('[data-preview-id="color"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  const pictures: Buffer[] = [];
  for (const name of ['Sakura', 'Lagoon', 'Citrus']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(card.locator('canvas')).toHaveAttribute('data-colorway', name.toLowerCase());
    await expect(card.locator('canvas')).toHaveAttribute('data-model-ready', 'true');
    await card.screenshot({ path: `test-results/preview-${name}-mobile.png` });
    pictures.push(await card.locator('canvas').screenshot());
  }
  expect(pictures[0].equals(pictures[1])).toBe(false);
  expect(pictures[1].equals(pictures[2])).toBe(false);
  const canvas = card.locator('canvas');
  const camera = await canvas.getAttribute('data-camera');
  const b = (await canvas.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 0 }] });
  for (let i = 1; i <= 6; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + i * 8, y: y + i * 5, id: 0 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(canvas).not.toHaveAttribute('data-camera', camera!);
  const beforePinch = await canvas.getAttribute('data-camera');
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 20, y, id: 0 }, { x: x + 20, y, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 45, y, id: 0 }, { x: x + 45, y, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(canvas).not.toHaveAttribute('data-camera', beforePinch!);
  await session.detach();
});
