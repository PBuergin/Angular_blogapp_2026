import { expect, test } from '@playwright/test';

test('Blog-Liste erfüllt die Akzeptanzkriterien', async ({ page }) => {
  // Blog-Übersicht öffnen
  await page.goto('/');

  // Kriterium 1: Blog-Einträge werden angezeigt
  const cards = page.locator('app-blog-card');
  await expect(cards.first()).toBeVisible();

  // Kriterium 2: Titel und Zusammenfassung sind vorhanden
  const firstCard = cards.first();

  const title = firstCard.locator('mat-card-title');
  await expect(title).not.toBeEmpty();

  const content = firstCard.locator('mat-card-content');
  await expect(content).not.toBeEmpty();

  // Kriterium 3: Navigation zur Detailansicht
  await title.click();

  await expect(page).toHaveURL(/\/blog\/\d+$/);
});
