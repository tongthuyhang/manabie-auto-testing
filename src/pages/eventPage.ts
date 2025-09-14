import { Page, Locator } from '@playwright/test';
import { EventLocators } from '../locators/eventLocators';
import { BasePage } from '../base/BasePage';
import { SiteLocators } from '../locators/siteLocators';
import { LogStep } from '../decorators/logStep';

/**
 * Page Object for the Event Master page
 * - Encapsulates locators and actions for maintainability and reuse
 * - Extends BasePage to use common helpers (click, type, verify, dropdown...)
 */
export class EventPage extends BasePage {
  readonly inputEventMasterName: Locator;
  readonly inputReminders: Locator;
  readonly selectEventType: Locator;
  readonly selectSendTo: Locator;
  readonly inputMaxEventPerStudent: Locator;
  readonly btnNew: Locator;
  readonly btnSave: Locator;
  readonly headerPrimary: Locator;
  readonly headerSecondary: Locator;
  readonly popupEvent: Locator

  constructor(page: Page) {
    super(page);

    // Buttons
    this.btnNew = page.locator(SiteLocators.BUTTON_NEW);
    this.btnSave = page.locator(SiteLocators.BUTTON_SAVE);

    // Input fields
    this.inputEventMasterName = page.locator(EventLocators.INPUT_EVENT_MASTER_NAME);
    this.inputReminders = page.locator(EventLocators.INPUT_REMINDERS);
    this.inputMaxEventPerStudent = page.locator(EventLocators.INPUT_MAX_EVENT_PER_STUDENT);

    // Dropdowns
    this.selectEventType = page.locator(EventLocators.SELECT_EVENT_TYPE);
    this.selectSendTo = page.locator(EventLocators.SELECT_SEND_TO);

    // Header (used for validation after save)
    this.headerPrimary = page.locator(SiteLocators.HEADER_PRIMARY_FIELD);
    this.headerSecondary = page.locator(SiteLocators.HEADER_SECONDARY_FIELD);
    this.popupEvent = page.locator(SiteLocators.POPUP);
  }

  /** Clicks the "New" button */
  async clickNewButton() {
    await this.click(this.btnNew);
  }

  /** Clicks the "Save" button */
  async clickSaveButton() {
    await this.click(this.btnSave);
  }

  /**
   * Fills the Event Master form with provided data
   * @param eventMasterName - The event name
   * @param eventType - Event type value
   * @param sendTo - Target audience
   * @param reminder - Reminder count
   * @param maxEventPerStudent - Maximum events per student
   */
  async fillEventMasterForm(
    eventMasterName: string,
    eventType: string,
    sendTo: string,
    reminder: number,
    maxEventPerStudent: number
  ) {
    await this.type(this.inputEventMasterName, eventMasterName);
    await this.selectFromDropdown(this.selectEventType, eventType);
    await this.selectFromDropdown(this.selectSendTo, sendTo);
    await this.inputReminders.fill(reminder.toString());
    await this.inputMaxEventPerStudent.fill(maxEventPerStudent.toString());
  }

  /**
   * Verifies the Event Master name appears in the page header
   * @param expected - Expected event name
   */
  async verifyEventMasterName(expected: string) {
    await this.verifyData(this.headerPrimary, expected);
  }

  /**
   * Searches for an Event Master by entering its name
   * @param eventMasterName - Event name to search
   */
  async searchEventMaster(eventMasterName: string) {
    await this.type(this.inputEventMasterName, eventMasterName);
  }
  async checkMandatoryFieldValidation() {
    await this.checkMultipleMandatoryFields(['Event Master Name', 'Event Type', 'Send To']);
  }
}
