import { test, expect } from '@playwright/test';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`motion preference overrides ${reducedMotion}, persists and returns to live system settings`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    const preference = page.getByRole('combobox', { name: 'Chuyển động' });
    await expect(preference).toHaveValue('system');
    await expect(page.locator('html')).toHaveAttribute('data-motion', reducedMotion === 'reduce' ? 'reduced' : 'running');
    await preference.selectOption('on');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
    await expect.poll(() => page.locator('.hero-shoe').evaluate(el => getComputedStyle(el).animationName)).toContain('shoe-float');
    await page.reload();
    await expect(preference).toHaveValue('on');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
    await preference.selectOption('off');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    await page.reload();
    await expect(preference).toHaveValue('off');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    await preference.selectOption('system');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
    await expect(page.locator('.motion-status')).toContainText('giảm chuyển động của máy');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
  });
}

test('unavailable storage still allows changing motion during the visit', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Chuyển động' }).selectOption('on');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
});

test('readable but unwritable storage does not block the in-memory choice', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  });
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Chuyển động' }).selectOption('on');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
});
