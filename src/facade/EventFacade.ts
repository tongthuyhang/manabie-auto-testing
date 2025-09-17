import { Page, expect } from '@playwright/test';
import { EventPage } from '../pages/EventPage';
import { EventData } from '../type/EventData';
import { LogStep } from '../decorators/logStep';

/**
 * Facade for Event operations
 * Provides high-level business actions by combining EventPage methods
 * Keeps test cases clean and focused on business logic instead of UI details
 */
export class EventFacade {
  private readonly eventPage: EventPage;

  constructor(page: Page) {
    this.eventPage = new EventPage(page);
  }

  /**
   * Searches for an event by name
   * @param eventName - Event name to search for
   * @throws Error when event name is empty or search fails
   */
  @LogStep('Search event by name')
  async searchEventByName(eventName: string): Promise<void> {
    if (!eventName?.trim()) {
      throw new Error('Event name is required for search');
    }
    
    try {
      await this.eventPage.searchEventMasterByName(eventName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to search event: ${errorMessage}`);
      throw new Error(`Event search failed: ${errorMessage}`);
    }
  }

  /**
   * Creates a new event with provided data and verifies creation
   * @param eventData - Event data object containing all required fields
   * @throws Error when event data is invalid or creation fails
   */
  @LogStep('Create and verify event')
  async createAndVerifyEvent(eventData: EventData): Promise<void> {
    if (!eventData) {
      throw new Error('Event data is required');
    }

    try {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to create event: ${errorMessage}`);
      throw new Error(`Event creation failed: ${errorMessage}`);
    }
  }

  /**
   * Validates mandatory field error messages
   * Attempts to save without filling required fields and checks validation
   * @throws Error when validation check fails
   */
  @LogStep('Validate mandatory field errors')
  async validateMandatoryFieldErrors(): Promise<void> {
    try {
      await this.eventPage.clickNewButton();
      await this.eventPage.clickSaveButton();
      await this.eventPage.validateMandatoryFieldErrors();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to validate mandatory fields: ${errorMessage}`);
      throw new Error(`Mandatory field validation failed: ${errorMessage}`);
    }
  }

  /**
   * Searches for event data and validates it appears in the grid
   * @param eventName - Name of the event to search and validate
   * @throws Error when search or validation fails
   */
  @LogStep('Search and validate event data')
  async searchAndValidateEventData(eventName: string): Promise<void> {
    if (!eventName?.trim()) {
      throw new Error('Event name is required for search and validation');
    }

    try {
      await this.eventPage.searchEventMasterByName(eventName);
      await this.eventPage.validateDataInGrid('Event Master Name', { 'Event Master Name': eventName });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to search and validate event data: ${errorMessage}`);
      throw new Error(`Event data validation failed: ${errorMessage}`);
    }
  }

  /**
   * Validates maximum length constraint for Event Master Name field
   * @param fieldName - Name of the field to validate (default: 'Event Master Name')
   * @param maxLength - Maximum allowed length (default: 80)
   * @throws Error when max length validation fails
   */
  @LogStep('Validate field maximum length')
  async validateFieldMaxLength(fieldName: string = 'Event Master Name', maxLength: number = 80): Promise<void> {
    try {
      await this.eventPage.clickNewButton();
      await this.eventPage.validateFieldMaxLength(fieldName, maxLength);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to validate max length: ${errorMessage}`);
      throw new Error(`Max length validation failed: ${errorMessage}`);
    }
  }

}
