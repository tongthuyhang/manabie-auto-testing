import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { CommonHelpers } from '@src/utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { getItemsByKey } from '@src/utils/jsonHelper';
import { StorageHelper } from '@src/utils/storageHelper';
import { EventFieldLabels } from '@src/locators/eventLocators';

const selectedEventNames = ['demo'];
const selectedEvents: EventData[] = getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName'
);

test.describe('Creating Event Master', () => {
  let eventMasterFacade: EventMasterFacade;

  test.beforeEach(async ({ page }) => {
    // Check and refresh storage if expired
    await StorageHelper.checkAndRefreshStorage(page);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventMasterFacade = new EventMasterFacade(page);
  });

  selectedEvents.forEach((event) => {

    test(`Create a New Event Master using "Save & New" action for"${event.eventMasterName}"`, { tag: "@Regression" }, async ({ page }) => {
      //=== QASE Metadata ===
      qase.id(661);
      qase.title(`Create Event Master for ${event.eventMasterName}`);
      qase.parameters({ inputData: JSON.stringify(event) }); // parameters field on QASE
      qase.fields({
        description: 'Verify that a new Event Master can be created successfully', // description field on QASE
        preconditions: 'User is logged in and on Event Master page', // preconditions field on QASE
      });
      qase.comment('The Event Master should be created successfully'); // Actual result field on QASE

      // === Test Steps ===
      await test.step(`Create new Event Master with name "${event.eventMasterName}"`, async () => {
        await eventMasterFacade.saveNew(event);
      });
    });
  });

  test(`Verify cancel functionality in Event Master creation`, { tag: "@Regression" }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.id(664);
    qase.fields({
      description: `Ensure that clicking 'Cancel' does not save any data.`, // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
    });
    qase.comment(' The "New Event Master" popup should close without saving any data'); // Actual result field on QASE

    // === Test Steps ===
    await test.step(`The user clicks on the "Cancel" button`, async () => {
      await eventMasterFacade.verifyCancelButton();
    });
  });

  test(`Validate required field "Event Master Name"`, { tag: "@Regression" }, async ({ page }) => {
    //=== Data input ===
    const selectedEventNames = ['Sample Event'];
    const selectedEvents: EventData[] = getItemsByKey(
      testData,
      selectedEventNames,
      'eventMasterName'
    );
    //=== QASE Metadata ===
    qase.id(666);
    qase.title(`Ensure that the system prompts the user when the required Event Master Name is not filled.`);
    qase.comment('Message "Complete this field." should be displayed under fields'); // Actual result field on QASE
    qase.fields({
      description: 'Ensure that the system prompts the user when the required Event Master Name is not filled.', // description field on QASE
      preconditions: 'User is logged in and on Event Master page', // preconditions field on QASE
    });

    // === Test Steps ===
    await test.step('Validate mandatory field error messages are displayed', async () => {
      await eventMasterFacade.validateMandatoryFieldErrors();
    });
  });

  test('Verify description field accepts formatted text', { tag: '@Validation' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.id(667);
    qase.title(`Verify description field accepts formatted text`);
    qase.fields({
      description: 'Ensures a formatted Description does not block record creation and is stored/rendered properly.', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
      postconditions: 'A new Event Master is created successfully, and the Description field displays in bold format.',
    });
    qase.comment('A confirmation message "Event Master \"Sample Event\" was created." should be displayed'); // Actual result field on QASE
    await test.step(`Verify description field accepts formatted text`, async () => {
      const testEventNames = ['Sample Event'];
      const testEvents: EventData[] = getItemsByKey(
        testData,
        testEventNames,
        'eventMasterName'
      );
      const selectedEvent = testEvents[0]; // Get first event from the array
      
      await eventMasterFacade.verifyDescriptionFieldAcceptsFormattedText(selectedEvent);
    });
  });

  selectedEventNames.forEach((eventName) => {
    test(`Should search and validate event data for "${eventName}"`, { tag: '@Regression' }, async ({ page }) => {
      await test.step(`Search and validate event data for "${eventName}"`, async () => {
        await eventMasterFacade.searchAndValidateEventData(eventName);
      });
    });
  });

  test('Should validate Event Master Name field maximum length', { tag: '@Validation' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.id(785);
    qase.title(`Create an Event Master with 80-character name and description`);
    qase.comment('The Event Master Name should be exactly 80 characters long'); // Actual result field on QASE
    await test.step(`Validate maximum length for "${EventFieldLabels.EVENT_MASTER_NAME}" field`, async () => {
      await eventMasterFacade.validateFieldMaxLength(EventFieldLabels.EVENT_MASTER_NAME);
    });
  });

});
