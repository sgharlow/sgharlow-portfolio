import { test, expect } from '@playwright/test';

test('spotlight closes to grid; mobile modal opens', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText("Today's Spotlight", { exact: false })).toBeVisible();

  await page.getByRole('link', { name: /Browse all projects/ }).click();
  await expect(page).toHaveURL(/\/grid/);
  await expect(page.getByRole('heading', { name: 'All projects' })).toBeVisible();

  // mobile viewport — modal trigger
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const firstCard = page.locator('article').first();
  await firstCard.locator('button').click();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
});
