import { Page, expect } from '@playwright/test';
import { EventPage } from '../pages/eventPage';
import { EventData } from '../type/EventData';
import { LogStep } from '../decorators/logStep';

/**
 * Facade for Event operations
 * - Provides high-level business actions by combining EventPage methods
 * - Keeps test cases clean and focused on business logic instead of UI details
 */
export class EventFacade {
  private eventPage: EventPage;

  constructor(page: Page) {
    this.eventPage = new EventPage(page);
  }

  /**
   * Searches for an event by name
   * @param name - Event name to search
   */
  @LogStep('Search event by name')
  async searchEvent(name: string): Promise<void> {
    await this.eventPage.searchEventMaster(name);
  }

  /**
   * Creates a new event with provided data
   * @param data - Event data object
   */
  @LogStep('Create event')
  async createAndVerify(data: EventData): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventMasterForm(
      data.eventMasterName,
      //data.reminder, // ❌ TypeScript error at compile time
      data.eventType,
      data.sendTo,
      data.reminder,
      data.maxEventPerStudent
    );
    await this.eventPage.clickSaveButton();
    await this.eventPage.verifyEventMasterName();
   
  }

  @LogStep('Check Mandatory files at Master Event')
  async checkMandatoryMasterEvent() {
    await this.eventPage.clickNewButton();
    await this.eventPage.clickSaveButton();
    await this.eventPage.checkMandatoryFieldValidation();
  }

  @LogStep('Search data')
  async searchData(name: string) {
    await this.eventPage.searchEventMaster(name);
    await this.eventPage.checkDataInGrid('Event Master Name', { 'Event Master Name': name })
  }

   @LogStep('Check maxlenght Event Master Name field')
  async checkMaxLenght(name: string) {
    await this.eventPage.clickNewButton();
    await this.eventPage.checkMaxLengthValidation(name);
  }

}
