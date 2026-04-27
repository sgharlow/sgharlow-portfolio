import { test, expect } from '@playwright/test';

test('homepage shows the grid; clicking a card title navigates to the detail page', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The lab' })).toBeVisible();

  // At least one card is visible
  const firstCard = page.locator('article').first();
  await expect(firstCard).toBeVisible();

  // Click the first card's title link to navigate to its detail page
  const titleLink = firstCard.locator('a[href^="/projects/"]').first();
  await expect(titleLink).toBeVisible();
  const href = await titleLink.getAttribute('href');
  expect(href).toMatch(/^\/projects\//);
  await titleLink.click();

  // Detail page renders
  await expect(page.getByText(/back to the lab/i)).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
});
