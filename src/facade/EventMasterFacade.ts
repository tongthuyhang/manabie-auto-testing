import { Page, expect, test } from '@playwright/test';
import { EventMasterPage } from '../pages/EventMasterPage';
import { EventData } from '../type/EventData';
import { LogStep, Retry, TrackTime } from '../decorators/index';
import { EventFieldLabels, EventLocators } from '../locators/eventLocators';

/**
 * Facade for Event operations
 * Provides high-level business actions by combining EventPage methods
 * Keeps test cases clean and focused on business logic instead of UI details
 */
export class EventMasterFacade {
  private readonly eventPage: EventMasterPage;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.eventPage = new EventMasterPage(page);
  }

  // /** Create data */

  // async createData(): Promise<void>{
  //    await test.step(`Enter all data, while type = paid, sento = parent only`, async () => {
  //         await eventMasterPage.clickNewButton();
  //         await eventMasterPage.fillEventMasterForm(selectedEvents[1]);
  //         const valueWhoCanReserve = page.locator(EventLocators.SELECT_WHO_CAN_RESERVE);
  //         await expect(valueWhoCanReserve).toContainText('Parent Only');
  //       });
  //       await test.step(`Click Save`, async () => {
  //         await eventMasterPage.clickSaveButton();
  //         await eventMasterPage.verifySuccessMessage('was created');
  //       });
  // }

  /**
   * Searches for an event by name
   */
  @LogStep({name:'Search event by name', level:'debug'})
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
  async saveNew(eventData: EventData, message: string): Promise<void> {
    if (!eventData) {
      throw new Error('Event data is required');
    }
    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventMasterForm(eventData);
    await this.eventPage.clickSave_NewButton();
    await this.eventPage.verifyPopupTitle('New Event Master');
    await this.eventPage.verifySuccessMessage(message);
  }

  /**
   * Verify cancel button
   * Click New -> fill data -> click cancel button -> expected result: modal close
   */

  @LogStep('verifyCancelButton')
  @Retry(1) // ✅ more retries because UI validation can be flaky
  @TrackTime()// ✅ will log how long it takes
  async cancelData(eventData: EventData): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.verifyPopupTitle('New Event Master');
    await this.eventPage.fillEventMasterForm(eventData);
    await this.eventPage.clickCancelButton();
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
  async verifyDescriptionFieldAcceptsFormattedText(eventData: EventData, message: string): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventMasterForm(eventData);
    await this.eventPage.clickSaveButton();
    await this.eventPage.verifySuccessMessage(message);
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

  async verifyEventData(eventName: string) {
    await this.eventPage.searchEventMasterByName(eventName);
    const rowData = await this.eventPage.getEventRowByName(eventName);
    expect(rowData['Event Master Name']).toBe(eventName);
  }

  @LogStep('Search with there is no data')
  async searchNoData(eventName: string): Promise<void> {
    if (!eventName?.trim()) {
      throw new Error('Event name is required for search and validation');
    }

    await test.step(' Seach event master by name', async ()=> {
        await this.eventPage.searchEventMasterByName(eventName);

    }) 

    await test.step(' Check data affter search', async ()=> {
          await this.eventPage.handelNoData();

    }) 


  }

  async createPreconditionData(eventData: EventData): Promise<void> {
    if (!eventData) {
      throw new Error('Event data is required');
    }
    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventMasterForm(eventData);
    await this.eventPage.clickSaveButton();
  }

  async restoreDeletedEventMaster(eventName: string): Promise<void> {
    if (!eventName) {
      throw new Error('Event data is required');
    }
    await test.step(`Deleted event master ${eventName}`, async () => {
      this.deletedEventMaster(eventName);
    })
    await test.step(`Restore deleted event master ${eventName}`, async () => {
      await this.eventPage.clickUnDoButton();
      await this.eventPage.searchEventMasterByName(eventName);
    })
  }

  public async deletedEventMaster(eventName: string): Promise<void> {
    if (!eventName) {
      throw new Error('Event data is required');
    }
    await test.step(`Deleted event master ${eventName}`, async () => {
      await this.eventPage.searchEventMasterByName(eventName);
      await this.eventPage.clickMoreActionsButton();
      await this.eventPage.clickDeleteOnGridButton();
      await this.eventPage.verifyConfirmDeleteDialog();
      await this.eventPage.clickDialogDeleteButton();
    })
  }

  async cancelDeletionofEventMaster(eventName: string): Promise<void> {
    if (!eventName) {
      throw new Error('Event data is required');
    }
    await test.step(`search for an Event Master ${eventName}`, async () => {
      await this.eventPage.searchEventMasterByName(eventName);
    })
    await test.step(`click "Show 4 more actions" on an Event Master`, async () => {
      await this.eventPage.clickMoreActionsButton();
    })
    await test.step(`click "Delete"`, async () => {
      await this.eventPage.clickDeleteOnGridButton();
    })
    await test.step(`click "Cancel"`, async () => {
      await this.eventPage.clickDialogCancelButton();
    })
  }

  async changeOwnerofEventMaster(eventName: string): Promise<void> {
    if (!eventName) {
      throw new Error('Event data is required');
    }
    await test.step(`search for an Event Master ${eventName}`, async () => {
      await this.eventPage.searchEventMasterByName(eventName);
    })
    await test.step(`change owner`, async () => {
      await this.eventPage.checkOnGrid(['Select Item 1']);
      await this.eventPage.clickChangeOwnerButton();
      await this.eventPage.searchAndSelectComboboxOption(EventFieldLabels.SELECT_NEW_OWNER, 'linh nguyen');
    })

  }

  async asignLabelofEventMaster(eventName: string): Promise<void> {
    if (!eventName) {
      throw new Error('Event data is required');
    }
    await test.step(`search for an Event Master ${eventName}`, async () => {
      await this.eventPage.searchEventMasterByName(eventName);
    })
    await test.step(`change owner`, async () => {
      await this.eventPage.checkOnGrid(['Select Item 1']);
      await this.eventPage.clickAssignLabelButton();
    })

  }

  async editDataofEventMaster(eventName: string, dataEdit: string): Promise<void> {
    if (!eventName) {
      throw new Error('Event data is required');
    }
    await test.step(`search for an Event Master ${eventName}`, async () => {
      await this.eventPage.searchEventMasterByName(eventName);
    })
    await test.step(`Edit data`, async () => {
      await this.eventPage.clickMoreActionsButton();
      await this.eventPage.clickEditOnGridButton();
      await this.eventPage.type(EventLocators.INPUT_EVENT_MASTER_NAME, dataEdit);
      await this.eventPage.clickSaveButton();

    })

  }

}
