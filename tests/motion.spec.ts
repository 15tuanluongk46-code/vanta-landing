import { test, expect } from '@playwright/test';

test('motion can be paused, reveal runs once and click feedback clears', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const toggle = page.getByRole('combobox', { name: 'Chuyển động' });
  await expect(toggle).toBeVisible();
  await toggle.selectOption('off');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await toggle.selectOption('on');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
  await expect(page.locator('.tech-ripple')).toHaveCount(0);
  await page.locator('.hero-copy .button').dispatchEvent('click');
  await expect(page.locator('.tech-ripple')).toHaveCount(1);
  await expect(page.locator('.tech-ripple')).toHaveCount(0);
  const heading = page.locator('.story-copy h2');
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAttribute('data-revealed', 'true');
  await page.waitForTimeout(900);
  await expect.poll(() => heading.evaluate(el => el.getAnimations().length)).toBe(0);
  await page.locator('.hero').scrollIntoViewIfNeeded();
  await heading.scrollIntoViewIfNeeded();
  expect(await heading.evaluate(el => el.getAnimations().length)).toBe(0);
});

test('slow model keeps its poster and failure replaces the loading status', async ({ page }) => {
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/models/form-01-v5.glb', async route => { await blocked; await route.abort(); });
  await page.goto('/');
  const card = page.locator('[data-preview-id="hero"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  await expect(card.locator('.viewer-loading-poster img')).toBeVisible();
  await expect(card.locator('.viewer-load-status')).toHaveText('Đang tải mô hình 3D…');
  release();
  await expect(card.locator('.preview-message')).toContainText('3D chưa khả dụng');
  await expect(card.locator('.viewer-load-status')).not.toContainText('Đang tải');
  await card.getByRole('button', { name: 'Xem ảnh', exact: true }).click();
  await expect(card.locator('.preview-poster')).toBeVisible();
});

test('offscreen float pauses and rapid camera commands remain cancellable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
  const hero = page.locator('.hero');
  await expect(hero).toHaveAttribute('data-in-view', 'true');
  const story = page.locator('[data-preview-id="story"]');
  await story.scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-in-view', 'false');
  expect(await page.locator('.hero-shoe').evaluate(el => getComputedStyle(el).animationPlayState)).toContain('paused');
  await story.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  const canvas = story.locator('canvas');
  await expect(canvas).toHaveAttribute('data-model-ready', 'true');
  const home = await canvas.getAttribute('data-camera');
  for (const name of ['Xem mặt đế', 'Zoom gần', 'Zoom xa', 'Đặt lại góc nhìn']) {
    await story.getByRole('button', { name, exact: true }).dispatchEvent('click');
  }
  await expect(canvas).toHaveAttribute('data-camera-moving', 'false');
  await expect(canvas).toHaveAttribute('data-camera', home!);
  await page.screenshot({ path: 'test-results/v8-story-ready.png' });
});

test('3D waits for real draw, eases commands and preserves angle across colors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('[data-preview-id="color"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  await expect(card.locator('.viewer-session')).toHaveAttribute('data-ready', 'true');
  await expect(card.locator('.view-angle')).toContainText('°');
  const canvas = card.locator('canvas');
  await card.getByRole('button', { name: 'Xem mặt đế' }).click();
  await expect(canvas).toHaveAttribute('data-camera-moving', 'true');
  await expect(canvas).toHaveAttribute('data-camera-moving', 'false');
  const camera = await canvas.getAttribute('data-camera');
  for (const name of ['Lagoon', 'Citrus', 'Sakura', 'Citrus']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(canvas).toHaveAttribute('data-colorway', name.toLowerCase());
    await expect(canvas).toHaveAttribute('data-camera', camera!);
  }
  await card.getByRole('button', { name: 'Phóng to', exact: true }).click();
  await expect(page.getByRole('dialog').locator('.viewer-session')).toHaveAttribute('data-ready', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('reduced motion keeps content visible and camera commands instant', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  const card = page.locator('[data-preview-id="hero"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  await expect(card.locator('.viewer-session')).toHaveAttribute('data-ready', 'true');
  await card.getByRole('button', { name: 'Xem mặt đế' }).click();
  await expect(card.locator('canvas')).toHaveAttribute('data-camera-moving', 'false');
  expect(await page.locator('.hero-shoe').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
});
