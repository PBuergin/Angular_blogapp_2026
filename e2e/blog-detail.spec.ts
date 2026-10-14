/*
Aufgabe 5:
Akzeptanzkriterien - Blog-detail-page
1.  Die Blog-Detailseite kann über einen Blog-Eintrag aus der Übersicht geöffnet werden.
2.  Die Detailseite zeigt den Titel des ausgewählten Blogs.
3.  Die Detailseite zeigt den Autor des ausgewählten Blogs.
4.  Die Detailseite zeigt den Inhalt des ausgewählten Blogs.
*/

import { test, expect } from '@playwright/test';
import { mockBlogApi } from './fixtures/mock-blogs';

test('Blog-Detailseite zeigt den ausgewählten Blog', async ({ page }) => {
  await mockBlogApi(page);
  await page.goto('/');

  const firstCard = page.locator('app-blog-card').first();
  await expect(firstCard).toBeVisible();

  // Informationen aus der Übersicht merken
  const title = (await firstCard.locator('mat-card-title').innerText()).trim();

  // Detailseite öffnen
  await firstCard.locator('mat-card-title').click();

  // 1. Navigation
  await expect(page).toHaveURL(/\/blog\/\d+$/);

  // 2. Titel
  await expect(page.locator('h1')).toHaveText(title);

  // 3. Autor
  await expect(page.locator('.blog-detail .author')).not.toBeEmpty();

  // 4. Inhalt (aktuell contentPreview)
  await expect(page.locator('.blog-detail .content')).not.toBeEmpty();
});
