/*
Aufgabe 4:
Akzeptanzkriterien – Blog-Liste 
1.	Wenn die Seite geladen wird und Blog-Einträge vorhanden sind, werden diese in der Blog-Übersicht angezeigt.
2.	Jeder Blog-Eintrag zeigt seinen Titel und eine Zusammenfassung (contentPreview) an.
3.	Jeder Blog-Eintrag besitzt einen anklickbaren Titel, über den die Detailansicht geöffnet werden kann.
*/

import { test, expect } from '@playwright/test';

test('Blog-Liste erfüllt die Akzeptanzkriterien', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  // Kriterium 1: Blog-Einträge werden angezeigt
  const cards = page.locator('app-blog-card');
  await expect(cards.first()).toBeVisible();

  // Kriterium 2: Titel und Zusammenfassung sind vorhanden
  const firstCard = cards.first();
  await expect(firstCard.locator('mat-card-title')).not.toBeEmpty();
  await expect(firstCard.locator('mat-card-content').first()).not.toBeEmpty();

  // Kriterium 3: Titel führt zur Detailansicht
  await firstCard.locator('mat-card-title').click();
  await expect(page).toHaveURL(/\/blog\/\d+$/);
});
