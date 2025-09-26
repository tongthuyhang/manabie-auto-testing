import { Page, Locator, expect } from '@playwright/test';
import { SiteLocators } from '../locators/siteLocators';
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
  public normalizeLocator(locator: string | Locator): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  /**
   * Escapes special characters in a string
   * so it can be safely used inside a RegExp.
   *
   * Example:
   *  Input: "hello.world"
   *  Output: "hello\.world"
   *
   * @param s The input string
   * @returns The escaped string safe for regex
   */
  public escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  /**
   * Click an element with auto-wait
   */
  async click(locator: string | Locator): Promise<void> {
    const loc = this.normalizeLocator(locator);
    await loc.waitFor({ state: 'visible', timeout: 10000 });
    if (!(await loc.isEnabled())) {
      throw new Error('Element is not enabled: ' + locator);
    }
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
   * 
   */
  async importFile(
  entityName: string,   // ví dụ: "Event Master", "Lesson Master"
  action: string,       // ví dụ: "Add new records", "Update existing records", "Add new and update existing records"
  fileType: string,     // ví dụ: "CSV"
  filePath: string      // path file
): Promise<void> {
  const iframe = this.page.frameLocator(SiteLocators.IFRAME);
  // 1. Chọn entity
  await this.click(iframe.locator(`a.lv-link:has-text("${entityName}")`));

  // 2. select action
  await this.click(iframe.locator(`a.lv-link:has-text("${action}")`));

  // 3. Select file
  await this.click(iframe.locator(`a.stdcolor div div span:has-text("${fileType}")`));

  // 4. Upload file
  await iframe.locator('input[type="file"]').setInputFiles(filePath);
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
     * Check mandatory field validation message for an LWC input
     * @param label - Label display of field (EX: "Event Master Name")
     * @param expectedMessage - Message (default = "Complete this field.")
     */
  async checkMandatoryField(label: string, expectedMessage = 'Complete this field.'): Promise<void> {
    const errorMessage = this.page.locator('.slds-form-element', { has: this.page.getByLabel(label) }).locator('.slds-form-element__help');
    await expect(errorMessage).toBeVisible();

    // get all text reality
    const actualText = await errorMessage.innerText();
    console.log("message check", actualText);
    // Verify text contains message
    expect(actualText.replace(/\s+/g, ' ').trim()).toContain(`${label} ${expectedMessage}`);
  }

  /**
   * Check mandatory validation messages for multiple fields
   */
  async checkMultipleMandatoryFields(
    labels: string[]
  ): Promise<void> {
    for (const label of labels) {
      await this.checkMandatoryField(label);
    }
  }

  async searchData(locator: string, text: string) {
    const fieldSearch = this.page.getByPlaceholder(locator);
    await expect(fieldSearch).toBeVisible();
    await fieldSearch.fill(text);
    await fieldSearch.press("Enter");
  }


  /**
   * Gets all data from a grid row and returns it as an object
   * @param uniqueColumn The column used to identify the row
   * @param uniqueValue The value in the unique column
   * @returns Object with all column data from the row
   */
  async getAllGridRowData(
    uniqueColumn: string,
    uniqueValue: string
  ): Promise<Record<string, string>> {
    console.log(`\n🔍 Starting data extraction for [${uniqueColumn}] = "${uniqueValue}"`);

    const rowLocator = this.page.locator('tr').filter({
      has: this.page.locator(
        `td[data-label="${uniqueColumn}"], th[data-label="${uniqueColumn}"]`
      ).filter({ hasText: this.escapeRegExp(uniqueValue) })
    });

    const rowCount = await rowLocator.count();
    console.log(`Found ${rowCount} matching rows`);

    // if (rowCount === 0) {
    //   console.log(`❌ No rows found with [${uniqueColumn}] = "${uniqueValue}"`);
    //   const messageNodata = this.page.locator('lst-empty-state-illustration div.slds-illustration div p.slds-text-body_regular').first();
    //   expect(messageNodata).toContainText(`There's nothing in your list yet. Try adding a new record.`);
    //    const mes = await messageNodata.innerText();
    //   console.log(`nodata`, mes);
    //   return {};
    // }

    // Get all cells in the row
    const cells = rowLocator.locator('td[data-label], th[data-label]');
    const cellCount = await cells.count();
    const rowData: Record<string, string> = {};

    console.log(`\n📋 Extracting all data from row where [${uniqueColumn}] = "${uniqueValue}"`);
    console.log(`   Found ${cellCount} columns in the row`);

    for (let i = 0; i < cellCount; i++) {
      const cell = cells.nth(i);
      const columnLabel = await cell.getAttribute('data-label');
      const cellText = (await cell.innerText()).trim();

      if (columnLabel) {
        rowData[columnLabel] = cellText;
        console.log(`   [${columnLabel}]: "${cellText}"`);
      }
    }

    console.log(`\n📊 Quality Summary:`);
    console.log(`   Total columns extracted: ${Object.keys(rowData).length}`);
    console.log(`   Row identification: [${uniqueColumn}] = "${uniqueValue}"`);

    return rowData;
  }

  async handelNoData () {
    const messageNodata = this.page.locator('lst-empty-state-illustration div.slds-illustration div p.slds-text-body_regular').first();
    await expect(messageNodata).toContainText("There's nothing in your list yet. Try adding a new record.");
  }


  /**
   * Verify modal title text
   * @param expectedTitle The expected title text
   */
  async verifyModalTitle(locator: string | Locator, expectedTitle: string): Promise<void> {
    const loc = this.normalizeLocator(locator);
    await expect(loc).toHaveText(expectedTitle);
    console.log(`✅ Verified modal title: "${expectedTitle}"`);
  }

  async verifyModalClose(locator: string | Locator): Promise<void> {
    const loc = this.normalizeLocator(locator);
    //await expect(loc).toHaveCount(0);
    await expect(loc).toBeHidden();
  }

  /**
   * Check the maximum length of an input field by its label text.
   * @param page Playwright Page object
   * @param labelText The text of the label associated with the input
   * @param maxLength The maximum number of characters allowed
   */
  async checkMaxLengthByLabel(page: Page, labelText: string, maxLength: number) {
    // Locate the input based on the label text
    const input: Locator = page.locator(`label:has-text("${labelText}") + div input`);

    // Try to fill more than maxLength characters
    const longText = 'A'.repeat(maxLength + 20);
    console.log("length of longText", longText.length); // 25
    console.log("longText", longText); // "AAAAAAAAAAAAAAAAAAAAAAAAA" (25 word A)
    await input.fill(longText);
    const maxLengthAttr = await input.getAttribute('maxlength');
    await expect(page.locator(`label:has-text("${labelText}")`)).toBeEnabled();
    console.log("maxLengthAttr", maxLengthAttr);

    // Get the actual value in the input
    const actualValue = await input.inputValue();

    // Assert the value length does not exceed maxLength
    expect(Number(maxLengthAttr)).toBe(maxLength);
    expect(actualValue.length).toBeLessThanOrEqual(maxLength);

  }
  /** Show message after save success */
  async verifySuccessMessage(): Promise<void> {
    const successToast = this.page.locator(`span.toastMessage:has-text("was created")`);
    await expect(successToast).toBeVisible({ timeout: 10000 });
  }

  /**
  * Select option dropdown based label text
  * @param labelText Label of dropdown
  * @param optionValue value want to select
  */
  async selectOptionSmart(
  labelText: string | Locator,
  optionValue: string,
  by: 'value' | 'text' = 'value'
) {
  const frame = this.page.frameLocator('iframe[title="accessibility title"]');

  // Only use string labelText for iframe approach
  if (typeof labelText !== 'string') {
    // Use regular combobox approach for Locator
    const combobox = this.normalizeLocator(labelText);
    await combobox.click();
    
    const option = by === 'value'
      ? this.page.locator(`.slds-listbox__option[data-value="${optionValue}"]`)
      : this.page.locator('.slds-listbox__option', { hasText: optionValue });
    
    await option.waitFor({ state: 'visible', timeout: 5000 });
    
    if ((await option.getAttribute('aria-selected')) !== 'true') {
      await option.click();
    }
    return;
  }
  
  const label = frame.locator(`label:has-text("${labelText}")`);;
  const selectId = await label.getAttribute('for');
    // Use iframe approach with select element
    const dropdown = frame.locator(`//select[@id="${selectId}"]`);
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    await dropdown.selectOption(optionValue);
    console.log("Selected from iframe dropdown:", optionValue);

}

}
