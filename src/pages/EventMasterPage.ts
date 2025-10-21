import { Page, Locator, FrameLocator, expect } from '@playwright/test';
import { EventLocators } from '../locators/eventLocators';
import { BasePage } from '../base/BasePage';
import { SiteLocators } from '../locators/siteLocators';
import { EventData } from '@src/type/EventData';
import { CommonHelpers } from '../utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
/**
 * Page Object: Event Master Page
 * Purpose:
 * - Manage all locators and UI interactions on the Event Master page.
 * - Normalize all locator definitions via BasePage.normalizeLocator() 
 *   for consistent locator parsing and type-safety.
 */
export class EventMasterPage extends BasePage {
// Form Input Locators
  readonly inputEventMasterName: Locator;
  readonly inputReminders: Locator;
  readonly inputMaxEventPerStudent: Locator;
  readonly inputDescription: Locator;
  readonly inputSearch: Locator;

  // Dropdown Locators
  readonly selectEventType: Locator;
  readonly selectSendTo: Locator;

  // Button Locators
  readonly buttonNew: Locator;
  readonly buttonEditOnGrid: Locator;
  readonly buttonDeleteOnGrid: Locator;
  readonly buttonChangeOwnerOnGrid: Locator;
  readonly buttonEditLabelsOnGrid: Locator;
  readonly buttonImport: Locator;
  readonly buttonChangeOwner: Locator;
  readonly buttonAssignLabel: Locator;
  readonly buttonSave: Locator;
  readonly buttonCancel: Locator;
  readonly buttonSave_New: Locator;

  // Modal / Header Locators
  readonly popupEvent: Locator;

  // Iframe Locator
  readonly iframe: FrameLocator;

  constructor(page: Page) {
    super(page);

    //  Use BasePage.normalizeLocator() for all locators
    // It auto-detects whether the locator is CSS, XPath, placeholder, or role-based.

    // --- Form Inputs ---
    this.inputEventMasterName = this.normalizeLocator(EventLocators.INPUT_EVENT_MASTER_NAME);
    this.inputReminders = this.normalizeLocator(EventLocators.INPUT_REMINDERS);
    this.inputMaxEventPerStudent = this.normalizeLocator(EventLocators.INPUT_MAX_EVENT_PER_STUDENT);
    this.inputDescription = this.normalizeLocator(EventLocators.INPUT_DESCRIPTION);
    this.inputSearch = this.normalizeLocator(SiteLocators.INPUT_SEARCH);

    // --- Dropdowns ---
    this.selectEventType = this.normalizeLocator(EventLocators.SELECT_EVENT_TYPE);
    this.selectSendTo = this.normalizeLocator(EventLocators.SELECT_SEND_TO);

    // --- Buttons ---
    this.buttonNew = this.normalizeLocator(EventLocators.BUTTON_NEW);
    this.buttonEditOnGrid = this.normalizeLocator(EventLocators.BUTTON_EDIT_ON_GRID);
    this.buttonDeleteOnGrid = this.normalizeLocator(EventLocators.BUTTON_DELETE_ON_GRID);
    this.buttonChangeOwnerOnGrid = this.normalizeLocator(EventLocators.BUTTON_CHANGE_OWNER_ON_GRID);
    this.buttonEditLabelsOnGrid = this.normalizeLocator(EventLocators.BUTTON_EDIT_LABELS_ON_GRID);
    this.buttonImport = this.normalizeLocator(EventLocators.BUTTON_IMPORT);
    this.buttonChangeOwner = this.normalizeLocator(EventLocators.BUTTON_CHANGE_OWNER);
    this.buttonAssignLabel = this.normalizeLocator(EventLocators.BUTTON_ASIGN_LABEL);
    this.buttonSave = this.normalizeLocator(EventLocators.BUTTON_SAVE);
    this.buttonSave_New = this.normalizeLocator(EventLocators.BUTTON_SAVE_NEW);
    this.buttonCancel = this.normalizeLocator(EventLocators.BUTTON_CANCEL);

    // --- Popup / Modal ---
    this.popupEvent = this.normalizeLocator(EventLocators.MODAL_TITLE);

    // --- Iframe ---
    this.iframe = page.frameLocator(SiteLocators.IFRAME);
  }

  /**
 * Go to Event Master Page
 */
  async goToEventMasterPage(): Promise<void> {
    await CommonHelpers.navigateToPage(this.page, CommonConstants.PAGE_EVENT_MASTER);
  };

  /**
   * Clicks the "New" button to create a new event
   * @throws Error when button is not clickable
   */
  async clickNewButton(): Promise<void> {
    await this.click(this.buttonNew);
  }

  async clickEditOnGridButton(): Promise<void> {
    await this.click(this.buttonEditOnGrid);
  }

  async clickDeleteOnGridButton(): Promise<void> {
    await this.click(this.buttonDeleteOnGrid);
  }

  async clickChangeOwneronGridButton(): Promise<void> {
    await this.click(this.buttonChangeOwnerOnGrid);
  }

  async clickEditLabelOnGridButton(): Promise<void> {
    await this.click(this.buttonEditLabelsOnGrid);
  }

  async clickUnDoButton(): Promise<void> {
    await this.click(EventLocators.BUTTON_UNDO);
  }

  async clickChangeOwnerButton(): Promise<void> {
    await this.click(this.buttonChangeOwner);
  }

  async clickAssignLabelButton(): Promise<void> {
    await this.click(this.buttonAssignLabel);
  }

  async clickImportButton(): Promise<void> {
    await this.click(this.buttonImport);
  }

  /**
   * Click "Show Actions" button in the table
   */
  async clickMoreActionsButton() {
    //const moreActionsBtn = this.page.locator(SiteLocators.BUTTON_MORE_ACTION, { hasText: 'Show Actions' }).first();
    const moreActionsBtn = this.page.locator(SiteLocators.BUTTON_MORE_ACTION).first();
    await this.click(moreActionsBtn);
  }

  /**
  * Click vào button "More actions" trong li.oneActionsDropDown đầu tiên
  */

  /**
   * Clicks the "Save" button to save the event
   * @throws Error when button is not clickable
   */
  async clickSaveButton(): Promise<void> {
    await this.click(this.buttonSave);
  }

  async clickSave_NewButton(): Promise<void> {
    await this.click(this.buttonSave_New);
  }

  async clickCancelButton(): Promise<void> {
    await this.click(this.buttonCancel);
  }

  async clickDialogDeleteButton(): Promise<void> {
    await this.click(SiteLocators.BUTTON_DIALOG_DELETE);
  }

  async clickDialogCancelButton(): Promise<void> {
    await this.click(SiteLocators.BUTTON_DIALOG_CANCEL);
  }

  async importEventMaster(action: string, filePath: string): Promise<void> {
    this.importFile("Event Master", action, "CSV", filePath);
  }

  async clickNextButton(): Promise<void> {

    await this.click(this.iframe.locator(SiteLocators.BUTTON_NEXT_IMPORT));
  }


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
    event: EventData
  ): Promise<void> {
    // Validate required fields
    await this.validateRequiredFields(event.eventMasterName, event.eventType, event.sendTo);

    // Fill required fields
    await this.fillRequiredFields(event.eventMasterName, event.eventType, event.sendTo);

    // Fill optional fields
    await this.fillOptionalFields(event.reminder, event.maxEventPerStudent, event.description);
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
  public async fillRequiredFields(
    eventMasterName: string,
    eventType: string,
    sendTo: string
  ): Promise<void> {
    await this.type(this.inputEventMasterName, eventMasterName);
    await this.selectComboboxOptionBy(this.selectEventType, eventType);
    await this.selectComboboxOptionBy(this.selectSendTo, sendTo);
  }

  /**
   * Fills optional form fields
   * @private
   */
  public async fillOptionalFields(
    reminder?: string | number | boolean,
    maxEventPerStudent?: string | number | boolean,
    description?: string
  ): Promise<void> {
    if (reminder !== undefined) {
      await this.type(this.inputReminders, reminder);
    }

    if (maxEventPerStudent !== undefined) {
      await this.type(this.inputMaxEventPerStudent, maxEventPerStudent);
    }

    if (description !== undefined) {
      await this.type(this.inputDescription, description);
    }
  }

  /**
   * Searches for an Event Master by entering its name in the search field
   * @param eventMasterName - Event name to search for
   * @throws Error when search operation fails
   */
  async searchEventMasterByName(eventMasterName: string | EventData | EventData[]): Promise<void> {
    let searchText = '';

    if (typeof eventMasterName === 'string') {
      searchText = eventMasterName.trim();
    } else if (Array.isArray(eventMasterName)) {
      // ✅ Lấy danh sách tên từ mảng EventData
      searchText = eventMasterName.map(e => e.eventMasterName).join(' ');
    } else if (eventMasterName && 'eventMasterName' in eventMasterName) {
      // ✅ Trường hợp là 1 object EventData
      searchText = eventMasterName.eventMasterName.trim();
    }

    if (!searchText) {
      throw new Error('Event Master Name is required for search');
    }
    //await this.searchData('Search this list...', searchText);
    await this.searchData(this.inputSearch, searchText);
  }

  /**
   * Validates data in the grid by checking specific column values
   * @param column - Column name to search in
   * @param expectedData - Object containing column names and expected values
   * @throws Error when expected data is not found
   */
  async getEventRowByName(eventName: string) {
    return this.getAllGridRowData('Event Master Name', eventName);
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
  async validateFieldMaxLength(fieldName: string, maxLength: number): Promise<void> {
    if (!fieldName?.trim()) {
      throw new Error('Field name is required for max length validation');
    }
    await this.checkMaxLengthByLabel(this.page, fieldName, maxLength);
  }

  /**Verify title of popuo */
  async verifyPopupTitle(expectedTitle: string): Promise<void> {
    await this.verifyModalTitle(this.popupEvent, expectedTitle);
  }

  /** Verify confirm delete dialog*/
  async verifyConfirmDeleteDialog(): Promise<void> {
    await this.expectConfirmDialogVisible("Delete Event Master");
  }


}
