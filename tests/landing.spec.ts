import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('detail cards retain square framing and load the V5 images', async ({ page }) => {
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    for (const view of ['upper', 'heel', 'sole']) {
      const card = page.locator(`.detail-${view}`);
      await card.scrollIntoViewIfNeeded();
      const image = card.locator('img');
      await expect(image).toHaveAttribute('src', new RegExp(`detail-${view}-v5`));
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(Math.abs(box!.width - box!.height)).toBeLessThan(2);
      expect(await image.evaluate(img => getComputedStyle(img).objectFit)).toBe('contain');
      await card.screenshot({ path: `test-results/card-${view}-${width}.png` });
    }
  }
});

test('desktop navigation, colorways, demo form and accessibility', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/VANTA/);
  await page.screenshot({ path: 'test-results/desktop-hero.png' });
  await page.screenshot({ path: 'test-results/desktop-full.png', fullPage: true });
  await page.getByRole('link', { name: 'Phối màu', exact: true }).click();
  for (const name of ['Lagoon', 'Citrus', 'Sakura']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByAltText(`Toàn bộ FORM 01 phối màu ${name}`)).toBeVisible();
  }
  await page.getByRole('link', { name: /Theo dõi FORM 01/ }).click();
  await expect(page).toHaveURL(/#dang-ky$/);
  await expect(page.locator('#dang-ky')).toBeInViewport();
  await page.getByLabel('Email của bạn').fill('not-email');
  await page.getByRole('button', { name: 'Đăng ký ↗', exact: true }).click();
  await expect(page.locator('.signup').getByRole('status')).toBeEmpty();
  await page.getByLabel('Email của bạn').fill('demo@example.com');
  await page.getByRole('button', { name: 'Đăng ký ↗', exact: true }).click();
  await expect(page.locator('.signup').getByRole('status')).toContainText('Email không được lưu hay gửi đi');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('tablet and small phone preserve layout and anchor destinations', async ({ page }) => {
  for (const width of [360, 768]) {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const missing = await page.locator('a[href^="#"]').evaluateAll(links => links
      .map(link => link.getAttribute('href')!)
      .filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
    expect(missing).toEqual([]);
    await page.screenshot({ path: `test-results/layout-${width}.png`, fullPage: true });
  }
});

test('mobile fits and reduced motion avoids pinning', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/mobile-hero.png' });
  await page.screenshot({ path: 'test-results/mobile-full.png', fullPage: true });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('3D loads and static view is recoverable', async ({ page }) => {
  await page.goto('/');
  const model = page.waitForResponse(response => response.url().endsWith('/models/form-01-v5.glb'));
  const card = page.locator('[data-preview-id="story"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  expect((await model).status()).toBe(200);
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('canvas')).toHaveAttribute('data-model-ready', 'true');
  await card.getByRole('button', { name: 'Xem mặt đế' }).click();
  await page.screenshot({ path: 'test-results/viewer.png' });
  await card.getByRole('button', { name: 'Xem ảnh', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.story-poster')).toBeVisible();
});

test('failed model request provides recovery', async ({ page }) => {
  await page.route('**/models/form-01-v5.glb', route => route.abort());
  await page.goto('/');
  const card = page.locator('[data-preview-id="story"]');
  await card.getByRole('button', { name: 'Xem 3D', exact: true }).click();
  await expect(page.getByText('3D chưa khả dụng.', { exact: false })).toBeVisible();
  await card.getByRole('button', { name: 'Xem ảnh', exact: true }).click();
  await expect(page.locator('.story-poster')).toBeVisible();
});

test('every colorway stays inside its card at all target widths', async ({ page }) => {
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    for (const name of ['Sakura', 'Lagoon', 'Citrus']) {
      await page.getByRole('button', { name, exact: true }).click();
      const card=page.locator('.color-visual');
      const image=card.locator('img');
      await expect.poll(()=>image.evaluate((img: HTMLImageElement)=>img.complete && img.naturalWidth>0)).toBe(true);
      const bounds=await card.boundingBox(); const picture=await image.boundingBox();
      expect(bounds).not.toBeNull(); expect(picture).not.toBeNull();
      expect(picture!.x).toBeGreaterThanOrEqual(bounds!.x);
      expect(picture!.y).toBeGreaterThanOrEqual(bounds!.y);
      expect(picture!.x+picture!.width).toBeLessThanOrEqual(bounds!.x+bounds!.width+1);
      expect(picture!.y+picture!.height).toBeLessThanOrEqual(bounds!.y+bounds!.height+1);
      expect(await image.evaluate(img=>getComputedStyle(img).objectFit)).toBe('contain');
      await card.screenshot({path:`test-results/color-${name}-${width}.png`});
    }
  }
});

test('campaign preserves the complete source frame on every target width', async ({ page }) => {
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const card=page.locator('.lookbook-art');
    await card.scrollIntoViewIfNeeded();
    const image=card.locator('img');
    await expect.poll(()=>image.evaluate((img: HTMLImageElement)=>img.complete && img.naturalWidth>0)).toBe(true);
    expect(await image.evaluate(img=>getComputedStyle(img).objectFit)).toBe('contain');
    const bounds=await card.boundingBox(); const picture=await image.boundingBox();
    expect(picture!.width).toBeCloseTo(bounds!.width, 0);
    expect(picture!.height).toBeCloseTo(bounds!.height, 0);
    await card.screenshot({path:`test-results/campaign-${width}.png`});
  }
});

test('desktop viewer does not pin the page and section navigation works with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.locator('[data-preview-id="story"]').getByRole('button', { name: 'Xem 3D', exact: true }).click();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('canvas')).toBeVisible();
  await page.locator('#lookbook').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => page.locator('#lookbook').evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.locator('#thiet-ke').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => page.locator('#thiet-ke').evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(3);
});
