import { Page, Locator, expect } from '@playwright/test';
import { LocatorOptions } from '@src/type/LocatorOptions';
import { SiteLocators } from '../locators/siteLocators';
import { normalizeWhitespace, escapeRegExp, normalizeToString } from '../utils/stringHelper';
import { normalizeLocator } from '../utils/locatorHelper';
import { normalizeToArray } from '../utils/arrayHelper';

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
   * Normalize locator using utility function
   */
  protected normalizeLocator(locator: string | Locator | LocatorOptions): Locator {
    return normalizeLocator(this.page, locator);
  }

  /**
   * Normalize input into an array using utility function
   */
  public normalizeToArrayGeneric<T>(value: T | T[]): T[] {
    return normalizeToArray(value);
  }

  /**
   * Click an element with auto-wait (Click action, EX: new button, save button ...)
   */
  async click(locator: string | Locator | LocatorOptions, timeout = 10000, retries = 2): Promise<void> {
    const loc = this.normalizeLocator(locator);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await loc.waitFor({ state: 'visible', timeout });
        if (!(await loc.isEnabled())) {
          throw new Error('Element is not enabled: ' + JSON.stringify(locator));
        }
        await loc.click();
        return; // ✅ success -> exit
      } catch (err) {
        console.warn(`⚠️ Click attempt ${attempt} failed for ${JSON.stringify(locator)}`, err);
        if (attempt === retries) throw err; // throw when retries are over
        await this.page.waitForTimeout(500); // wait a moment then retry
      }
    }
  }

  /**
 * Overwrite the content of an input field with new text
 * - Step 1: Convert selector/locator → Locator
 * - Step 2: Wait until element is visible
 * - Step 3: Ensure element is enabled
 * - Step 4: Clear and replace with new text
 */
  // async type(locator: string | Locator | LocatorOptions, text: string , timeout = 10000): Promise<void> {
  //   const loc = this.normalizeLocator(locator);
  //   await loc.waitFor({ state: 'visible', timeout });
  //   if (!(await loc.isEnabled())) {
  //     throw new Error(`[type] Element is not enabled: ${JSON.stringify(locator)}`);
  //   }
  //   await loc.fill(text);
  // }

  async type(locator: string | Locator | LocatorOptions, text: string | number | boolean, timeout = 10000): Promise<void> {
    const vale = String(text);
    const loc = this.normalizeLocator(locator);
    await loc.waitFor({ state: 'visible', timeout });

    if (!(await loc.isEnabled())) {
      throw new Error(`[type] Element is not enabled: ${JSON.stringify(locator)}`);
    }

    // Detect capabilities on the element (runs in browser context)
    const support: any = await loc.evaluate((el: Element) => {
      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return { kind: 'native' }; // direct fill
      }
      if ((el as HTMLElement).isContentEditable) {
        return { kind: 'contenteditable' }; // direct fill
      }
      const desc = el.querySelector('[contenteditable="true"], [contenteditable]:not([contenteditable="false"])');
      if (desc) {
        return { kind: 'descendant', selector: '[contenteditable="true"], [contenteditable]:not([contenteditable="false"])' };
      }
      return { kind: 'none' }; // fallback
    });

    // 🎯 Native fill support
    if (support.kind === 'native' || support.kind === 'contenteditable') {
      await loc.fill(vale);
      return;
    }

    // 🎯 Nested editable → select child
    if (support.kind === 'descendant') {
      const editable = loc.locator(support.selector);
      await editable.click();
      await editable.fill(vale);
      return;
    }

    // 🎯 Fallback: click then keyboard.type()
    await loc.click();
    await this.page.waitForTimeout(100);
    await this.page.keyboard.type(vale);
  }

  // Append text (simulate typing)
  /**
 * Append text into an input field (keep existing content)
 * - Step 1: Convert selector/locator → Locator
 * - Step 2: Wait until element is visible
 * - Step 3: Ensure element is enabled
 * - Step 4: Type characters one by one (simulates real user typing)
 * - Extra: optional delay to mimic natural typing speed
 */
  async appendType(locator: string | Locator | LocatorOptions, text: string, delay = 0, timeout = 10000): Promise<void> {
    const loc = this.normalizeLocator(locator);

    // Wait until visible
    await loc.waitFor({ state: 'visible', timeout: timeout });

    // Ensure input is enabled before appending
    if (!(await loc.isEnabled())) {
      throw new Error('Element is not enabled: ' + locator);
    }

    // Append text (without clearing existing value)
    await loc.pressSequentially(text, { delay });
  }

  /**
  * entityName: string,   // EX: "Event Master", "Lesson Master"
  * action: string,       // EX: "Add new records", "Update existing records", "Add new and update existing records"
  * fileType: string,     // EX: "CSV"
  * filePath: string      // path file
  */
  async importFile(
    entityName: string,   
    action: string,
    fileType: string,
    filePath: string
  ): Promise<void> {
    const iframe = this.page.frameLocator(SiteLocators.IFRAME);
    // 1. option entity
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
  async verifyData(locator: string | Locator | LocatorOptions, expectedText: string, retries = 3, retryDelay = 500) {
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

  async searchData(locator: string | Locator | LocatorOptions, text: string | string[]) {
    const fieldSearch = this.normalizeLocator(locator);
    await expect(fieldSearch).toBeVisible();
    const inputText = normalizeToString(text);
    await this.type(fieldSearch, inputText);
    await fieldSearch.press("Enter", { timeout: 5000 });
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
      ).filter({ hasText: escapeRegExp(uniqueValue) })
    }).first(); // Take only the first matching row

    const rowCount = await this.page.locator('tr').filter({
      has: this.page.locator(
        `td[data-label="${uniqueColumn}"], th[data-label="${uniqueColumn}"]`
      ).filter({ hasText: escapeRegExp(uniqueValue) })
    }).count();

    console.log(`Found ${rowCount} matching rows, using first one`);
    if (rowCount === 0) {
      return {};
    }

    // Get all cells in the first matching row only
    const cells = rowLocator.locator('td[data-label], th[data-label]');
    const cellCount = await cells.count();
    const rowData: Record<string, string> = {};

    console.log(`\n📋 Extracting data from first matching row`);
    console.log(`   Found ${cellCount} columns in the row`);

    for (let i = 0; i < cellCount; i++) {
      const cell = cells.nth(i);
      const columnLabel = await cell.getAttribute('data-label');
      const cellText = (await cell.innerText()).trim();

      if (columnLabel && !rowData[columnLabel]) { // Avoid duplicates
        rowData[columnLabel] = cellText;
        console.log(`   [${columnLabel}]: "${cellText}"`);
      }
    }

    console.log(`\n📊 Quality Summary:`);
    console.log(`   Total columns extracted: ${Object.keys(rowData).length}`);
    if (Object.keys(rowData).length === 0) {
      throw new Error(
        `❌ Row found but no columns extracted for [${uniqueColumn}] = "${uniqueValue}". Check selectors or loading state.`
      );
    }
    return rowData;
  }
  /** Checkbox on grid */
  async checkOnGrid(items: string | string[]) {
    const itemList = this.normalizeToArrayGeneric(items);
    for (const item of itemList) {
      await this.page
        .locator('td[role="gridcell"]')
        .filter({
          has: this.page.locator('span.slds-form-element__label', { hasText: new RegExp(`^${escapeRegExp(item)}$`) }) // ^ = start of string, $ = end of string
        })
        .locator('span.slds-checkbox_faux')
        .click();

    }

  }
  /**
   * Handel there is no data after search data
   */
  async handleNoData() {
    const messageNodata = this.page.locator('lst-empty-state-illustration div.slds-illustration div p.slds-text-body_regular').first();
    await expect(messageNodata).toContainText("There's nothing in your list yet. Try adding a new record.");
  }

  /**
   * Verify modal title text
   * @param expectedTitle The expected title text
   */
  async verifyModalTitle(locator: string | Locator | LocatorOptions, expectedTitle: string): Promise<void> {
    const loc = this.normalizeLocator(locator);
    await expect(loc).toHaveText(expectedTitle);
    console.log(`✅ Verified modal title: "${expectedTitle}"`);
  }

  async verifyModalClose(locator: string | Locator | LocatorOptions): Promise<void> {
    const loc = this.normalizeLocator(locator);
    await expect(loc).toBeHidden();
  }

  /**
 * Verify confirm dialog is visible
 * @param text optional - check that dialog contains specific text
 */
  async expectConfirmDialogVisible(text?: string) {
    const dialog = this.page.locator(SiteLocators.DIALOG_CONFIRM);
    await expect(dialog).toBeVisible();

    if (text) {
      await expect(dialog).toContainText(text);
    }
  }

  async expectConfirmDialogInvisible() {
    const dialog = this.page.locator(SiteLocators.DIALOG_CONFIRM);
    await expect(dialog).toHaveCount(0, { timeout: 5000 });
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
  async verifySuccessMessage(message: string, timeout = 5000): Promise<void> {
    await this.page.locator(SiteLocators.SUCCESS_TOAST).waitFor({ state: 'visible', timeout });
    const toastmessage = this.page.locator(SiteLocators.SUCCESS_TOAST, {
      hasText: new RegExp(escapeRegExp(message))
    });
    await toastmessage.waitFor({ state: 'visible', timeout });
    console.log(`✅ Verified success message: "${message}"`);
    await expect(toastmessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select option in combobox with search functionality
   * @param comboboxName The accessible name of the combobox
   * @param searchText Text to search/filter options
   * @param waitTime Optional wait time after typing (default 2000ms)
   */
  async searchAndSelectComboboxOption(
    comboboxName: string,
    searchText: string,
    waitTime: number = 2000
  ): Promise<void> {
    const combobox = this.page.getByRole('combobox', { name: comboboxName });

    // Click to open dropdown
    await combobox.click();

    // Type search text
    await combobox.fill(searchText);

    // Wait for search results
    await this.page.waitForTimeout(waitTime);

    // Navigate to first option and select
    await combobox.press('ArrowDown');
    await combobox.press('Enter');
  }

  /**
  * Select option dropdown based label text
  * @param labelText Label of dropdown
  * @param optionValue value want to select
  */
  async selectComboboxOptionBy(
    locatorOrLabel: string | Locator | LocatorOptions,
    optionValue: string,
    by: 'value' | 'text' = 'value'
  ) {
    // Check if it's a CSS selector (contains special characters) or plain label text
    const isCssSelector = typeof locatorOrLabel === 'string' &&
      /[\[\]#\.:>~\+\*=\(\)"']/.test(locatorOrLabel);

    // Try normal listbox approach first (for CSS selectors and Locator objects)
    if (isCssSelector || typeof locatorOrLabel !== 'string') {
      try {
        const combobox = this.normalizeLocator(locatorOrLabel);
        await combobox.waitFor({ state: 'visible', timeout: 2000 });
        await combobox.click();

        const option = by === 'value'
          ? this.page.locator(`.slds-listbox__option[data-value="${optionValue}"]`)
          : this.page.locator('.slds-listbox__option', { hasText: optionValue });

        await option.waitFor({ state: 'visible', timeout: 5000 });

        if ((await option.getAttribute('aria-selected')) !== 'true') {
          await option.click();
        }
        return;
      } catch (error) {
        throw new Error(`Failed to select option "${optionValue}" using normal approach: ${error}`);
      }
    }

    // Try iframe approach for plain label text
    try {
      const frame = this.page.frameLocator('iframe[title="accessibility title"]');
      const label = frame.locator(`label:has-text("${locatorOrLabel}")`);
      if (!label) {
        throw new Error(`Label "${locatorOrLabel}" not found in iframe`);
      }
      const selectId = await label.getAttribute('for');
      // Use attribute selector instead of ID selector to handle special characters
      const dropdown = frame.locator(`select[id="${selectId}"]`);
      await dropdown.waitFor({ state: 'visible', timeout: 5000 });
      await dropdown.selectOption(optionValue);
      console.log("Selected from iframe dropdown:", optionValue);
    } catch (error) {
      throw new Error(`Failed to select option "${optionValue}" using iframe approach: ${error}`);
    }
  }

  /**
    * Auto detect field type and validate:
    * - Field has maxlength → check maxlength
    * - If there is a specific message → check text containing expectedValue
    * - Otherwise → check label/static text containing expectedValue
  */
  async verifyInputValue(locatorInput: string | Locator, expectedValue: string) {
    const locator = this.normalizeLocator(locatorInput);
    await this.page.waitForTimeout(1000);
    await expect(locator).toBeVisible({ timeout: 5000 });

    // Detect maxlength attribute -> INPUT/textarea case
    const maxLengthAttr = await locator.getAttribute('maxlength');

    if (maxLengthAttr !== null) {
      console.log(`🔍 Detected as INPUT-like field with maxlength = ${maxLengthAttr}`);
      expect(maxLengthAttr).toBe(expectedValue);
      console.log(`✅ Maxlength check passed = ${expectedValue}`);
      return;
    }
    // If the element is in a notification container → it is defined as an error message
    const hasNotificationClass = await locator.evaluate((el) =>
      el.closest('.errorsList, .toastContainer, .slds-notify')
    );

    const textContent = (await locator.innerText()).trim();

    if (hasNotificationClass) {
      console.log(`🔍 Detected ERROR/NOTIFICATION BLOCK -->`, textContent);
      expect(textContent).toContain(expectedValue);
      console.log(`✅ Passed error message check`);
      return;
    }

    // If not INPUT has maxlength and not NOTIFICATION → Fail clea
    throw new Error(
      ` Locator does not match expected patterns (input with maxlength OR notification block): ${locatorInput}`
    );

  }

}
