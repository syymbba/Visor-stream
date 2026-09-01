import { test, expect } from '@playwright/test';

// Proves the i18n wiring actually re-renders UI text, not just that t()
// calls compile. The switcher control itself lives in SettingsView, which
// is behind auth and not reachable in an unauthenticated smoke test - so
// this drives the same mechanism the switcher calls (localStorage +
// LanguageProvider reading it on mount) and asserts the landing page
// chrome renders translated text instead of English.

test('landing page renders French when language is set to fr', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('visor_selected_language', 'fr');
  });
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Se Connecter' })).toBeVisible();
  await expect(page.getByText('Diffusions en Direct', { exact: false }).first()).toBeVisible();
});

test('landing page switches to RTL layout for Arabic', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('visor_selected_language', 'ar');
  });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByRole('button', { name: 'تسجيل الدخول' })).toBeVisible();
});

test('landing page defaults to English with ltr layout', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
});
