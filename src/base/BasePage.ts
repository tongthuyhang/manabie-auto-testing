import { Page, Locator, expect } from '@playwright/test';
import { LocatorOptions } from '@src/type/LocatorOptions';
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
 * Normalize locator input:
 * - If locator is string → parse CSS/XPath/placeholder.
 * - If 'click' in locator → already a Locator → return directly.
 * - If not → treat as LocatorOptions → process according to properties: role, name, id, dataTestId, etc.
 * @throws Error if no valid locator can be built
 */
  private normalizeLocator(locator: string | Locator | LocatorOptions): Locator {
    // --- string case ---
    if (typeof locator === 'string') {
      const isPlaceholder =
        (locator.includes(' ') || locator.includes('...')) &&
        !['.', '#', '[', '//', 'xpath='].some(prefix => locator.startsWith(prefix));

      if (isPlaceholder) return this.page.getByPlaceholder(locator);
      if (locator.startsWith('//') || locator.startsWith('xpath=')) {
        return this.page.locator(locator.startsWith('//') ? `xpath=${locator}` : locator);
      }
      return this.page.locator(locator); // css fallback
    }

    // --- already a Locator ---
    if ('click' in (locator as Locator)) return locator as Locator;

    // --- LocatorOptions ---
    const opts = locator as LocatorOptions;

    // 1️⃣ Role-based
    if (opts.role) {


      // row scoping
      if (opts.rowIndex !== undefined || opts.rowText) {
        let rows = this.page.getByRole('row');
        if (opts.rowText) rows = rows.filter({ hasText: opts.rowText });
        const row = opts.rowIndex !== undefined ? rows.nth(opts.rowIndex) : rows.first();
        return opts.name ? row.getByRole(opts.role, { name: opts.name }) : row.getByRole(opts.role);
      }
      // no row scoping
      return opts.name ? this.page.getByRole(opts.role, { name: opts.name }) : this.page.getByRole(opts.role);
    }

    // 2️⃣ dataTestId
    if (opts.dataTestId) {
      return this.page.locator(
        `[data-test-id="${opts.dataTestId}"], [data-testid="${opts.dataTestId}"]`
      );
    }

    // 3️⃣ id
    if (opts.id) return this.page.locator(`#${opts.id}`);

    // 4️⃣ placeholder
    if (opts.placeholder) return this.page.getByPlaceholder(opts.placeholder);

    // 5️⃣ title
    if (opts.title) return this.page.getByTitle(opts.title);

    // 6️⃣ css
    if (opts.css) return this.page.locator(opts.css);

    // 7️⃣ xpath
    if (opts.xpath) {
      console.warn('[normalizeLocator] Using xpath (not recommended):', opts.xpath);
      return this.page.locator(`xpath=${opts.xpath}`);
    }

    throw new Error('[normalizeLocator] No valid locator provided: ' + JSON.stringify(locator));
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
  async type(locator: string | Locator | LocatorOptions, text: string, timeout = 10000): Promise<void> {
    const loc = this.normalizeLocator(locator);
    await loc.waitFor({ state: 'visible', timeout });
    if (!(await loc.isEnabled())) {
      throw new Error(`[type] Element is not enabled: ${JSON.stringify(locator)}`);
    }
    await loc.fill(text);
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

  async searchData(locator: string | Locator | LocatorOptions, text: string) {
    const fieldSearch = this.normalizeLocator(locator);
    await expect(fieldSearch).toBeVisible();
    await this.type(fieldSearch, text);
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
    if (rowCount === 0) {
      // Don't throw, let the test decide → avoid combining responsibilities
      return {};
    }
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
    if (Object.keys(rowData).length === 0) {
      throw new Error(
        `❌ Row found but no columns extracted for [${uniqueColumn}] = "${uniqueValue}". Check selectors or loading state.`
      );
    }
    return rowData;
  }
  /** Checkbox on grid */
  async checkOnGrid(items: string[]) {
    for (const item of items) {
      await this.page
        .locator('td[role="gridcell"]')
        .filter({
          has: this.page.locator('span.slds-form-element__label', { hasText: new RegExp(`^${this.escapeRegExp(item)}$`) })

        })
        .locator('span.slds-checkbox_faux')
        .click();

    }

  }
  /**
   * Handel there is no data after search data
   */
  async handelNoData() {
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
    //await expect(loc).toHaveCount(0);
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

  async expectConfirmDialogDisible() {
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
      hasText: new RegExp(this.escapeRegExp(message))
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
    labelText: string | Locator | LocatorOptions,
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
