import { Page, expect } from '@playwright/test';
import { EventMasterPage } from '../pages/EventMasterPage';
import { EventData } from '../type/EventData';
import { LogStep, Retry, TrackTime } from '../decorators/index';
import { EventFieldLabels, EventGridColumns } from '@src/locators/eventLocators';

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
  @LogStep('Create and verify event')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  //@TrackTime('time:') // ✅ will log how long it takes
  async createAndVerifyEvent(eventData: EventData): Promise<void> {
    if (!eventData) {
      throw new Error('Event data is required');
    }

    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventMasterForm(
      eventData.eventMasterName,
      eventData.eventType,
      eventData.sendTo,
      eventData.reminder,
      eventData.maxEventPerStudent
    );
    await this.eventPage.clickSaveButton();
    await this.eventPage.verifyEventMasterCreated();
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

  /**
   * Validates maximum length constraint for Event Master Name field
   */
  @LogStep('Validate field maximum length')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async validateFieldMaxLength(
    fieldName: string = EventFieldLabels.EVENT_MASTER_NAME,
    maxLength: number = 80
  ): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.validateFieldMaxLength(fieldName, maxLength);
  }
}
