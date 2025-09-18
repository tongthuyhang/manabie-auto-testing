import { Page, Locator, expect } from '@playwright/test';
import { EventLocators } from '../locators/eventLocators';
import { BasePage } from '../base/BasePage';
import { SiteLocators } from '../locators/siteLocators';

/**
 * Page Object for the Event Master page
 * Encapsulates locators and actions for maintainability and reuse
 * Extends BasePage to use common helpers (click, type, verify, dropdown...)
 */
export class EventMasterPage extends BasePage {
  // Form input locators
  readonly inputEventMasterName: Locator;
  readonly inputReminders: Locator;
  readonly inputMaxEventPerStudent: Locator;
  readonly inputSearch: Locator;
  
  // Dropdown locators
  readonly selectEventType: Locator;
  readonly selectSendTo: Locator;
  
  // Button locators
  readonly buttonNew: Locator;
  readonly buttonSave: Locator;
  
  // Header and validation locators
  readonly headerPrimary: Locator;
  readonly headerSecondary: Locator;
  readonly popupEvent: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize form input locators
    this.inputEventMasterName = page.locator(EventLocators.INPUT_EVENT_MASTER_NAME);
    this.inputReminders = page.locator(EventLocators.INPUT_REMINDERS);
    this.inputMaxEventPerStudent = page.locator(EventLocators.INPUT_MAX_EVENT_PER_STUDENT);
    this.inputSearch = page.locator(SiteLocators.INPUT_SEARCH);

    // Initialize dropdown locators
    this.selectEventType = page.locator(EventLocators.SELECT_EVENT_TYPE);
    this.selectSendTo = page.locator(EventLocators.SELECT_SEND_TO);

    // Initialize button locators
    this.buttonNew = page.locator(SiteLocators.BUTTON_NEW);
    this.buttonSave = page.locator(SiteLocators.BUTTON_SAVE);

    // Initialize header and validation locators
    this.headerPrimary = page.locator(SiteLocators.HEADER_PRIMARY_FIELD);
    this.headerSecondary = page.locator(SiteLocators.HEADER_SECONDARY_FIELD);
    this.popupEvent = page.locator(SiteLocators.POPUP);
  }

  /**
   * Clicks the "New" button to create a new event
   * @throws Error when button is not clickable
   */
  async clickNewButton(): Promise<void> {
    await this.click(this.buttonNew);
  }

  /**
   * Clicks the "Save" button to save the event
   * @throws Error when button is not clickable
   */
  async clickSaveButton(): Promise<void> {
    await this.click(this.buttonSave);
  }

  /**
   * Fills the Event Master form with provided data
   * @param eventMasterName - The event name
   * @param eventType - Event type value
   * @param sendTo - Target audience
   * @param reminder - Reminder count
   * @param maxEventPerStudent - Maximum events per student
   */
  // async fillEventMasterForm(
  //   eventMasterName: string,
  //   eventType: string,
  //   sendTo: string,
  //   reminder: number,
  //   maxEventPerStudent: number
  // ) {
  //   await this.type(this.inputEventMasterName, eventMasterName);
  //   await this.selectFromDropdown(this.selectEventType, eventType);
  //   await this.selectFromDropdown(this.selectSendTo, sendTo);
  //   await this.inputReminders.fill(reminder.toString());
  //   await this.inputMaxEventPerStudent.fill(maxEventPerStudent.toString());
  // }


  /**
   * Fills the Event Master form with provided data
   * @param eventMasterName - The event name (required)
   * @param eventType - Event type value (required)
   * @param sendTo - Target audience (required)
   * @param reminder - Reminder count (optional)
   * @param maxEventPerStudent - Maximum events per student (optional)
   * @throws Error when required fields are empty
   */
  async fillEventMasterForm(
    eventMasterName: string,
    eventType: string,
    sendTo: string,
    reminder?: number,
    maxEventPerStudent?: number
  ): Promise<void> {
    // Validate required fields
    await this.validateRequiredFields(eventMasterName, eventType, sendTo);

    // Fill required fields
    await this.fillRequiredFields(eventMasterName, eventType, sendTo);

    // Fill optional fields
    await this.fillOptionalFields(reminder, maxEventPerStudent);
  }

  /**
   * Validates required form fields
   * @private
   */
  private async validateRequiredFields(
    eventMasterName: string,
    eventType: string,
    sendTo: string
  ): Promise<void> {
    if (!eventMasterName?.trim()) {
      throw new Error('Event Master Name is required');
    }
    if (!eventType?.trim()) {
      throw new Error('Event Type is required');
    }
    if (!sendTo?.trim()) {
      throw new Error('Send To is required');
    }
  }

  /**
   * Fills required form fields
   * @private
   */
  private async fillRequiredFields(
    eventMasterName: string,
    eventType: string,
    sendTo: string
  ): Promise<void> {
    await this.type(this.inputEventMasterName, eventMasterName);
    await this.selectFromDropdown(this.selectEventType, eventType);
    await this.selectFromDropdown(this.selectSendTo, sendTo);
  }

  /**
   * Fills optional form fields
   * @private
   */
  private async fillOptionalFields(
    reminder?: number,
    maxEventPerStudent?: number
  ): Promise<void> {
    if (reminder !== undefined) {
      await this.inputReminders.fill(reminder.toString());
    }

    if (maxEventPerStudent !== undefined) {
      await this.inputMaxEventPerStudent.fill(maxEventPerStudent.toString());
    }
  }


  /**
   * Verifies that the Event Master was created successfully
   * Checks for the success toast message
   * @throws Error when success message is not visible
   */
  async verifyEventMasterCreated(): Promise<void> {
    const successToast = this.page.locator('span.toastMessage:has-text("was created")');
    await expect(successToast).toBeVisible({ timeout: 10000 });
  }

  /**
   * Searches for an Event Master by entering its name in the search field
   * @param eventMasterName - Event name to search for
   * @throws Error when search operation fails
   */
  async searchEventMasterByName(eventMasterName: string): Promise<void> {
    if (!eventMasterName?.trim()) {
      throw new Error('Event Master Name is required for search');
    }
    await this.searchData(SiteLocators.INPUT_SEARCH, eventMasterName);
  }

  /**
   * Validates data in the grid by checking specific column values
   * @param column - Column name to search in
   * @param expectedData - Object containing column names and expected values
   * @throws Error when expected data is not found
   */
  async validateDataInGrid(column: string, expectedData: Record<string, string>): Promise<void> {
    const columnValue = expectedData[column];
    if (!columnValue) {
      throw new Error(`Column value for '${column}' is required for grid validation`);
    }
    await this.getAllGridRowData(column, columnValue);
  }

  /**
   * Validates that mandatory field validation messages are displayed
   * Checks for validation messages on required fields
   * @throws Error when validation messages are not displayed
   */
  async validateMandatoryFieldErrors(): Promise<void> {
    const requiredFields = ['Event Master Name', 'Event Type', 'Send To'];
    await this.checkMultipleMandatoryFields(requiredFields);
  }

  /**
   * Validates the maximum length constraint for a specific field
   * @param fieldName - Name of the field to validate
   * @param maxLength - Maximum allowed length (default: 80)
   * @throws Error when field exceeds maximum length
   */
  async validateFieldMaxLength(fieldName: string, maxLength: number = 80): Promise<void> {
    if (!fieldName?.trim()) {
      throw new Error('Field name is required for max length validation');
    }
    await this.checkMaxLengthByLabel(this.page, fieldName, maxLength);
  }
}
