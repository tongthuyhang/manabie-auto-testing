import { Page, Locator, expect } from '@playwright/test';
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
  * Convert a string selector or Locator object into a Playwright Locator
  * - Input: can be a CSS string (e.g. "button.save") or an existing Locator
  * - Output: always a Locator (so all actions are consistent)
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
  * Type text into an input field
  * - Step 1: Convert selector/locator → Locator
  * - Step 2: Wait until element is visible
  * - Step 3: 
  *    - If append=true → type characters one by one (pressSequentially)
  *    - Else (default) → replace content completely (fill)
  * - Extra: can set typing delay to simulate real user speed
  */
  async type(locator: string | Locator, text: string, append = false, delay = 0) {
    const loc = this.normalizeLocator(locator);
    await loc.waitFor({ state: 'visible', timeout: 10000 });
    if (append) {
      await loc.pressSequentially(text, { delay }); // simulates user typing
    } else {
      await loc.fill(text); // clears existing and replaces with new text
    }
  }

  /**
  * Verify text content inside an element
  * - Input: locator + expected text
  * - Retry: up to N times with delay (handles async UI updates)
  * - Process:
  *   1. Wait until element is visible
  *   2. Expect element text contains expected string
  *   3. If failed → retry after delay
  *   4. Throw error after max retries
  */
  async verifyData(locator: string | Locator, expectedText: string, retries = 3, retryDelay = 500) {
    const loc = this.normalizeLocator(locator);
    for (let i = 1; i <= retries; i++) {
      try {
        await loc.first().waitFor({ state: 'visible', timeout: 5000 });
        await expect(loc).toContainText(expectedText, { timeout: 5000 });
        console.log(`✅ Verified: "${expectedText}"`);
        return;
      } catch (e) {
        console.warn(`⚠️ Attempt ${i} failed for locator: ${locator}`);
        if (i < retries) await this.page.waitForTimeout(retryDelay);
        else throw e;
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

  /**
     * Check mandatory field validation message for an LWC input
     * @param label - Label hiển thị của field (ví dụ: "Event Master Name")
     * @param expectedMessage - Message mong đợi (default = "Complete this field.")
     */
  async checkMandatoryField(label: string, expectedMessage = 'Complete this field.'): Promise<void> {
    const errorMessage = this.page.locator('.slds-form-element', { has: this.page.getByLabel(label) }).locator('.slds-form-element__help');
    await expect(errorMessage).toBeVisible();

    // Lấy toàn bộ text thực tế
    const actualText = await errorMessage.innerText();
    console.log("message check", actualText);
    // Kiểm tra xem text có chứa message không
    expect(actualText.replace(/\s+/g, ' ').trim()).toContain(`${label} ${expectedMessage}`);
  }

  /**
   * Check mandatory validation messages for multiple fields
   */
  async checkMultipleMandatoryFields(
    labels: string[],
    expectedMessage = 'Complete this field.'
  ): Promise<void> {
    for (const label of labels) {
      await this.checkMandatoryField(label);
    }
  }

}
