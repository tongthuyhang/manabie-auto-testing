import { Page, Locator, expect } from '@playwright/test';
import { LogStep } from '../decorators/logStep';

/**
 * BasePage
 * - Acts as the parent class for all Page Objects
 * - Provides common actions: click, type, verify, select dropdown...
 * - Helps keep code clean, reduces duplication, and improves maintainability
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Normalize a string selector or Locator into a Locator
   */
  protected normalizeLocator(locator: string | Locator): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  /**
   * Click an element with auto-wait
   */
  async click(locator: string | Locator): Promise<void> {
    const loc = this.normalizeLocator(locator);
    await loc.waitFor({ state: 'visible', timeout: 10000 });
    await loc.click();
  }

  /**
   * Type text into an element with option to append or fill
   */
  async type(locator: string | Locator, text: string, append = false, delay = 0) {
    const loc = this.normalizeLocator(locator);
    await loc.waitFor({ state: 'visible', timeout: 10000 });

    if (append) {
      await loc.pressSequentially(text, { delay });
    } else {
      await loc.fill(text);
    }
  }

  /**
   * Verify text content (exact match or contains)
   */
  // async verifyData(locator: string | Locator, expectedText: string, exact = true) {
  //   const loc = this.normalizeLocator(locator);
  //   await loc.first().waitFor({ state: 'attached', timeout: 15000 });

  //   if (exact) {
  //     await expect(loc).toHaveText(expectedText, { timeout: 15000 });
  //   } else {
  //     await expect(loc).toContainText(expectedText, { timeout: 15000 });
  //   }
  // }

  async  verifyData(
  locator: string | Locator,
  expectedText: string,
  exact = true,
  retries = 3,
  retryDelay = 500 // ms
) {
  const loc: Locator = typeof locator === 'string' ? this.normalizeLocator(locator) : locator;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      //await locator appear in DOM
      await loc.first().waitFor({ state: 'attached', timeout: 5000 });

      if (exact) {
        await expect(loc).toHaveText(expectedText, { timeout: 5000 });
      } else {
        await expect(loc).toContainText(expectedText, { timeout: 5000 });
      }

      console.log(`✅ Verified: "${expectedText}" (${exact ? 'exact' : 'partial'})`);
      return;
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed for locator: ${locator}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, retryDelay));
      } else {
        console.error(`❌ Verification failed after ${retries} attempts`);
        throw error;
      }
    }
  }
}

  /**
   * Select an option from a dropdown (by data-value or visible text)
   */
  async selectFromDropdown(
    dropdown: Locator,
    identifier: string,
    by: 'value' | 'text' = 'value',
    delay: number = 200
  ): Promise<void> {
    await dropdown.waitFor({ state: 'visible', timeout: 10000 });
    await dropdown.click();

    let option: Locator;
    if (by === 'value') {
      option = this.page.locator(`.slds-listbox__option[data-value="${identifier}"]`);
    } else {
      option = this.page.locator(`.slds-listbox__option`, { hasText: identifier });
    }

    await option.waitFor({ state: 'visible', timeout: 5000 });
    const selected = await option.getAttribute('aria-selected');
    if (selected !== 'true') {
      await option.click();
    }

    if (delay > 0) {
      await this.page.waitForTimeout(delay);
    }

    // Verify the dropdown shows the selected value after choosing
    if (by === 'text') {
      await expect(dropdown).toHaveText(identifier);
    }
  }
}
