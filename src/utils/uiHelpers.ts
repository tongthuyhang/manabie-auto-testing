import { Page, Locator, expect } from '@playwright/test';

export async function waitForToast(page: Page, message: string, timeout = 5000) {
  const toast = page.getByText(message, { exact: false });
  await expect(toast).toBeVisible({ timeout });
}

export async function waitForLoader(page: Page, timeout = 10000) {
  const loader = page.locator('[role="progressbar"], .loading-spinner');
  await loader.waitFor({ state: 'detached', timeout });
}

/** Click element with retry to avoid stale UI issues */
export async function safeClick(locator: Locator) {
  await locator.waitFor({ state: 'visible' });
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ delay: 100 });
}
