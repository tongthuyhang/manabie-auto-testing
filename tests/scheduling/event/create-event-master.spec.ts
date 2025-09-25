import { expect, test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { EventMasterPage } from '@src/pages/EventMasterPage';
import { CommonHelpers } from '@src/utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { getItemsByKey } from '@src/utils/jsonHelper';
import { StorageHelper } from '@src/utils/storageHelper';
import { EventFieldLabels, EventLocators } from '@src/locators/eventLocators';

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
  test(qase(661,`Create a New Event Master using "Save & New" action for"${event.eventMasterName}"`), { tag: "@Regression" }, async ({ page }) => {
      //=== QASE Metadata ===
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

  test(qase(664,`Verify cancel functionality in Event Master creation`), { tag: "@Regression" }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: `Ensure that clicking 'Cancel' does not save any data.`, // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
    });
    qase.comment(' The "New Event Master" popup should close without saving any data'); // Actual result field on QASE

    // === Test Steps ===
    await test.step(`The user clicks on the "Cancel" button`, async () => {
       const selectedEvent = selectedEvents[0]; 
      await eventMasterFacade.verifyCancelButton(selectedEvent);
    });
  });

  test(qase(666,`Validate required field "Event Master Name"`), { tag: "@Regression" }, async ({ page }) => {
    //=== QASE Metadata ===
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

  test(qase(667,'Verify description field accepts formatted text'), { tag: '@Validation' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.title(`Verify description field accepts formatted text`);
    qase.fields({
      description: 'Ensures a formatted Description does not block record creation and is stored/rendered properly.', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
      postconditions: 'A new Event Master is created successfully, and the Description field displays in bold format.',
    });
    qase.comment('A confirmation message "Event Master \"Sample Event\" was created." should be displayed'); // Actual result field on QASE
    await test.step(`Verify description field accepts formatted text`, async () => {
      const selectedEvent = selectedEvents[0];
      await eventMasterFacade.verifyDescriptionFieldAcceptsFormattedText(selectedEvent);
    });
  });

  test(qase(785,'Should validate Event Master Name field maximum length'), { tag: '@Validation' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.title(`Create an Event Master with 80-character name and description`);
    qase.comment('The Event Master Name should be exactly 80 characters long'); // Actual result field on QASE
    await test.step(`Validate maximum length for "${EventFieldLabels.EVENT_MASTER_NAME}" field`, async () => {
      await eventMasterFacade.validateFieldMaxLength(EventFieldLabels.EVENT_MASTER_NAME);
    });
  });

  test(qase(10072,'Successfully create a new Event Master with type: paid, send to: parent only'), { tag:'@Valiation'}, async ({page}) => {
    let eventMasterPage = new EventMasterPage(page);
    const event = testData[2];
    //=== QASE Metadata ===
    qase.title(`Successfully create a new Event Master with type: paid, send to: parent only`);
    await test.step(`Enter all data, while type = paid, sento = parent only`, async () => {
      qase.comment('Who Can Reserve = parent only')
      await eventMasterPage.clickNewButton();
      await eventMasterPage.fillEventMasterForm(event);
      const valueWhoCanReserve = page.locator(EventLocators.SELECT_WHO_CAN_RESERVE);
      await expect(valueWhoCanReserve).toContainText('Parent Only');
    });
    await test.step(`Click Save`, async () => {
      qase.comment('Successfully create a new Event Master with type: paid, send to: parent only'); // Actual result field on QASE
      await eventMasterPage.clickSaveButton();
      await eventMasterPage.verifySuccessMessage();
     
    });

  });

  selectedEventNames.forEach((eventName) => {
  test(`Should search and validate event data for "${eventName}"`, { tag: '@Regression' }, async ({ page }) => {
      await test.step(`Search and validate event data for "${eventName}"`, async () => {
        await eventMasterFacade.searchAndValidateEventData(eventName);
      });
    });
  });

});
