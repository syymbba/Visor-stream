import { test, expect } from '@playwright/test';

// Baseline visual + runtime-health check: load key views headless, fail on
// any console error or uncaught page error, and capture a screenshot for
// manual review. Extend with more views/assertions as the app grows -
// this is a starting point, not a full regression suite.

function trackConsoleErrors(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test('landing page renders with no console errors', async ({ page }) => {
  const errors = trackConsoleErrors(page);

  // Bypass the splash screen so the screenshot captures the actual page,
  // not the fixed-position overlay mid-transition.
  await page.addInitScript(() => {
    window.localStorage.setItem('visor_splash_seen', 'true');
  });
  await page.goto('/');
  await expect(page.getByText('VISOR', { exact: false }).first()).toBeVisible();

  await page.screenshot({ path: 'e2e/screenshots/landing.png', fullPage: true });
  expect(errors, `Console/page errors on landing page:\n${errors.join('\n')}`).toEqual([]);
});

test('live player view renders with no console errors', async ({ page }) => {
  const errors = trackConsoleErrors(page);

  await page.addInitScript(() => {
    window.localStorage.setItem('visor_splash_seen', 'true');
  });
  await page.goto('/');
  await page.getByText('VISOR', { exact: false }).first().waitFor();

  // Best-effort: click the first stream card if the landing page renders one.
  // Falls back to just screenshotting the landing page if no card is found,
  // since stream data may be empty/loading in a fresh environment.
  const streamCard = page.locator('[class*="cursor-pointer"]').first();
  if (await streamCard.isVisible().catch(() => false)) {
    await streamCard.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'e2e/screenshots/stream-view.png', fullPage: true });
  expect(errors, `Console/page errors on stream view:\n${errors.join('\n')}`).toEqual([]);
});
