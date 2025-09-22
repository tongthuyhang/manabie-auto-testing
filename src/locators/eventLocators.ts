/**
 * Event Master page locators
 * Organized by component type for better maintainability
 * 
 * @example Basic Usage:
 * ```typescript
 * import { EventLocators, EventFieldLabels, EventGridColumns } from '@src/locators/eventLocators';
 * 
 * // Fill form fields
 * await page.locator(EventLocators.INPUT_EVENT_MASTER_NAME).fill('Demo Event');
 * await page.locator(EventLocators.SELECT_EVENT_TYPE).click();
 * 
 * // Click buttons
 * await page.locator(EventLocators.BUTTON_NEW).click();
 * await page.locator(EventLocators.BUTTON_SAVE).click();
 * 
 * // Search functionality
 * await page.locator(EventLocators.INPUT_SEARCH).fill('demo');
 * await page.locator(EventLocators.BUTTON_SEARCH).click();
 * ```
 * 
 * @example Dynamic Locators:
 * ```typescript
 * // Select dropdown options
 * await page.locator(EventLocators.OPTION_EVENT_TYPE('Meeting')).click();
 * await page.locator(EventLocators.OPTION_SEND_TO('All Students')).click();
 * 
 * // Grid operations
 * const eventName = await page.locator(EventLocators.TABLE_CELL('Event Master Name')).textContent();
 * await page.locator(EventLocators.CHECKBOX_ROW_SELECT('row-123')).check();
 * ```
 * 
 * @example Validation and Assertions:
 * ```typescript
 * // Check validation messages
 * await expect(page.locator(EventLocators.ERROR_REQUIRED_FIELD)).toBeVisible();
 * await expect(page.locator(EventLocators.SUCCESS_TOAST)).toContainText('Event created');
 * 
 * // Validate field labels
 * await expect(page.locator(EventLocators.LABEL_EVENT_MASTER_NAME)).toBeVisible();
 * ```
 * 
 * @example Using Constants:
 * ```typescript
 * // Field validation
 * if (eventName.length > EventValidation.EVENT_NAME_MAX_LENGTH) {
 *   throw new Error('Event name too long');
 * }
 * 
 * // Dropdown selections
 * await selectEventType(EventOptions.EVENT_TYPES.WORKSHOP);
 * 
 * // Grid column validation
 * await validateGridColumn(EventGridColumns.EVENT_MASTER_NAME, expectedValue);
 * 
 * // Field label validation
 * await validateFieldMaxLength(EventFieldLabels.EVENT_MASTER_NAME);
 * ```
 * 
 * @example Page Object Usage:
 * ```typescript
 * export class EventPage extends BasePage {
 *   readonly inputEventName = this.page.locator(EventLocators.INPUT_EVENT_MASTER_NAME);
 *   readonly buttonSave = this.page.locator(EventLocators.BUTTON_SAVE);
 *   
 *   async fillEventForm(data: EventData): Promise<void> {
 *     await this.inputEventName.fill(data.eventMasterName);
 *     await this.page.locator(EventLocators.SELECT_EVENT_TYPE).click();
 *     await this.page.locator(EventLocators.OPTION_EVENT_TYPE(data.eventType)).click();
 *   }
 * }
 * ```
 * 
 * @example Test Usage:
 * ```typescript
 * test('Create event master', async ({ page }) => {
 *   await page.locator(EventLocators.BUTTON_NEW).click();
 *   await page.locator(EventLocators.INPUT_EVENT_MASTER_NAME).fill('Test Event');
 *   await page.locator(EventLocators.BUTTON_SAVE).click();
 *   
 *   await expect(page.locator(EventLocators.SUCCESS_TOAST)).toBeVisible();
 *   
 *   // Verify in grid
 *   const cellLocator = EventLocators.TABLE_CELL(EventGridColumns.EVENT_MASTER_NAME);
 *   await expect(page.locator(cellLocator)).toContainText('Test Event');
 * });
 * ```
 */
export const EventLocators = {
  // Modal and Headers
  MODAL_TITLE: 'h2.header.slds-modal__title.slds-hyphenate',
  PAGE_HEADER: 'h1.slds-page-header__title',
  
  // Form Input Fields
  INPUT_EVENT_MASTER_NAME: '[name="Name"]',
  INPUT_REMINDERS: '[name="MANAERP__Reminders__c"]',
  INPUT_MAX_EVENT_PER_STUDENT: '[name="MANAERP__Max_Event_Per_Student__c"]',
  FOCUS_DESCRIPTION: '[role="group"][aria-label="Description"]',
  INPUT_DESCRIPTION: 'div.slds-rich-text-area__content',
  
  // Dropdown Selectors
  SELECT_EVENT_TYPE: 'button[aria-label="Event Type"]',
  SELECT_SEND_TO: 'button[aria-label="Send To"]',
  SELECT_WHO_CAN_RESERVE: 'button[aria-label="Who Can Reserve"]',
  
  // Dropdown Options
  OPTION_EVENT_TYPE: (value: string) => `lightning-base-combobox-item[data-value="${value}"]`,
  OPTION_SEND_TO: (value: string) => `lightning-base-combobox-item[data-value="${value}"]`,
  
  // Action Buttons
  BUTTON_NEW: 'button[name="New"]',
  BUTTON_SAVE: '[apiname="SaveEdit"]',
  BUTTON_CANCEL: '[apiname="CancelEdit"]',
  BUTTON_SAVE_NEW: '[apiname="SaveAndNew"]',
  
  // Search and Filter
  INPUT_SEARCH: '[name="Event Master-search-input"]',
  BUTTON_SEARCH: 'button[title="Search"]',
  BUTTON_CLEAR_SEARCH: 'button[title="Clear Search"]',
  
  // Data Grid
  TABLE_EVENT_MASTER: 'table[role="grid"]',
  TABLE_ROW: 'tr[data-row-key-value]',
  TABLE_CELL: (columnName: string) => `td[data-label="${columnName}"]`,
  
  // Validation Messages
  ERROR_REQUIRED_FIELD: '.slds-form-element__help',
  ERROR_INVALID_FORMAT: '.slds-has-error .slds-form-element__help',
  SUCCESS_TOAST: '.slds-notify--toast.slds-theme--success',
  ERROR_TOAST: '.slds-notify--toast.slds-theme--error',
  
  // Loading States
  LOADING_SPINNER: '.slds-spinner',
  LOADING_OVERLAY: '.slds-backdrop',
  
  // Labels and Text
  LABEL_EVENT_MASTER_NAME: 'label[for*="Name"]',
  LABEL_EVENT_TYPE: 'label[for*="Event_Type"]',
  LABEL_SEND_TO: 'label[for*="Send_To"]',
  LABEL_WHO_CAN_RESERVE: 'Who Can Reserve',
  LABEL_REMINDERS: 'label[for*="Reminders"]',
  LABEL_MAX_EVENT_PER_STUDENT: 'label[for*="Max_Event_Per_Student"]',
} as const;

/**
 * Event Master field validation rules
 */
export const EventValidation = {
  EVENT_NAME_MAX_LENGTH: 80,
  REMINDERS_MIN_VALUE: 0,
  REMINDERS_MAX_VALUE: 999,
  MAX_EVENT_PER_STUDENT_MIN: 1,
  MAX_EVENT_PER_STUDENT_MAX: 100
} as const;

/**
 * Event Master dropdown options
 */
export const EventOptions = {
  EVENT_TYPES: {
    MEETING: 'Meeting',
    WORKSHOP: 'Workshop',
    SEMINAR: 'Seminar',
    CONFERENCE: 'Conference'
  },
  SEND_TO_OPTIONS: {
    ALL_STUDENTS: 'All Students',
    SELECTED_STUDENTS: 'Selected Students',
    SPECIFIC_GRADE: 'Specific Grade'
  }
} as const;

/**
 * Field labels for validation testing
 */
export const EventFieldLabels = {
  EVENT_MASTER_NAME: 'Event Master Name',
  EVENT_TYPE: 'Event Type',
  SEND_TO: 'Send To',
  WHO_CAN_RESERVE: 'Who Can Reserve',
  REMINDERS: 'Reminders',
  MAX_EVENT_PER_STUDENT: 'Max Event Per Student',
  DESCRIPTION: 'Description'
} as const;

/**
 * Grid column names
 */
export const EventGridColumns = {
  EVENT_MASTER_NAME: 'Event Master Name',
  EVENT_TYPE: 'Event Type',
  SEND_TO: 'Send To',
  REMINDERS: 'Reminders',
  MAX_EVENT_PER_STUDENT: 'Max Event Per Student',
  CREATED_DATE: 'Created Date',
  LAST_MODIFIED: 'Last Modified',
  OWNER: 'Owner',
  STATUS: 'Status'
} as const;