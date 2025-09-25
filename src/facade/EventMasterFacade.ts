import { Page, expect } from '@playwright/test';
import { EventMasterPage } from '../pages/EventMasterPage';
import { EventData } from '../type/EventData';
import { LogStep, Retry, TrackTime } from '../decorators/index';
import { EventFieldLabels, EventGridColumns,EventLocators } from '../locators/eventLocators';

/**
 * Facade for Event operations
 * Provides high-level business actions by combining EventPage methods
 * Keeps test cases clean and focused on business logic instead of UI details
 */
export class EventMasterFacade {
  private readonly eventPage: EventMasterPage;

  constructor(page: Page) {
    this.eventPage = new EventMasterPage(page);
  }

  /**
   * Searches for an event by name
   */
  @LogStep('Search event by name')
  @Retry(2) // ✅ will retry if search fails
  async searchEventByName(eventName: string): Promise<void> {
    if (!eventName?.trim()) {
      throw new Error('Event name is required for search');
    }
    await this.eventPage.searchEventMasterByName(eventName);
  }

  /**
   * Creates a new event with provided data and verifies creation
   */
  @LogStep('Create a New Event Master using "Save & New" action')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async saveNew(eventData: EventData): Promise<void> {
    if (!eventData) {
      throw new Error('Event data is required');
    }
    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventMasterForm(eventData);
    await this.eventPage.clickSave_NewButton();
    await this.eventPage.verifyPopupTitle('New Event Master');
    await this.eventPage.verifySuccessMessage();
  }

  /**
   * Verify cancel button
   * Click New -> fill data -> click cancel button -> expected result: modal close
   */

  @LogStep('verifyCancelButton')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async verifyCancelButton(eventData:EventData): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.verifyPopupTitle('New Event Master');
    await this.eventPage.fillEventMasterForm(eventData);
    await this.eventPage.clickCancelButton();
    await this.eventPage.verifyModalClose(EventLocators.MODAL_TITLE);
  } 

  /**
   * Validates mandatory field error messages
   */
  @LogStep('Validate mandatory field errors')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async validateMandatoryFieldErrors(): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.clickSaveButton();
    await this.eventPage.validateMandatoryFieldErrors();
  }

  /**
   * Verify description field accepts formatted text
   */
  @LogStep('Verify description field accepts formatted text')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async verifyDescriptionFieldAcceptsFormattedText(eventData: EventData): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventMasterForm(eventData);
    await this.eventPage.clickSaveButton();
    await this.eventPage.verifySuccessMessage();
  }
  
  /**
   * Validates maximum length constraint for Event Master Name field
   */
  @LogStep('Create an Event Master with 80-character name and description')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async validateFieldMaxLength(
    fieldName: string = EventFieldLabels.EVENT_MASTER_NAME,
    maxLength: number = 80
  ): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.validateFieldMaxLength(fieldName, maxLength);
  }

  /**
   * Searches for event data and validates it appears in the grid
   */
  @LogStep('Search and validate event data')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async searchAndValidateEventData(eventName: string): Promise<void> {
    if (!eventName?.trim()) {
      throw new Error('Event name is required for search and validation');
    }

    await this.eventPage.searchEventMasterByName(eventName);
    await this.eventPage.validateDataInGrid(EventGridColumns.EVENT_MASTER_NAME, {
      'Event Master Name': eventName,
    });
  }
 
}
