import { expect, test } from '@playwright/test';

test('should display the blog overview page', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toContainText('Blog Übersicht');
  await expect(page.locator('app-blog-card')).toHaveCount(6);
});
