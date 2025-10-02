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

/* Data to test */
const selectedEventNames = ['demo', 'Paid-Parent only'];
const selectedEvents: EventData[] = getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName'
);


test.describe('Creating Event Master', () => {
  let eventMasterFacade: EventMasterFacade;

  test.beforeEach(async ({ page }) => {
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventMasterFacade = new EventMasterFacade(page);
  });


  test(qase(661, `Create a New Event Master using "Save & New" action`), { tag: "@Regression" }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'Verify that a new Event Master can be created successfully', // description field on QASE
      preconditions: 'User is logged in and on Event Master page', // preconditions field on QASE
    });
    qase.comment('The Event Master should be created successfully'); // Actual result field on QASE

    // === Test Steps ===

    await test.step(`Create new Event Master with name "${selectedEvents[0]}`, async () => {
      await eventMasterFacade.saveNew(selectedEvents[0],'was created');
    });
  });

  test(qase(664, `Verify cancel functionality in Event Master creation`), { tag: "@Regression" }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: `Ensure that clicking 'Cancel' does not save any data.`, // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
    });
    qase.comment(' The "New Event Master" popup should close without saving any data'); // Actual result field on QASE

    // === Test Steps ===
    await test.step(`The user clicks on the "Cancel" button`, async () => {
      await eventMasterFacade.verifyCancelButton(selectedEvents[0]);
    });
  });

  test(qase(666, `Validate required field "Event Master Name"`), { tag: "@Regression" }, async ({ page }) => {
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

  test(qase(667, 'Verify description field accepts formatted text'), { tag: '@Validation' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'Ensures a formatted Description does not block record creation and is stored/rendered properly.', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
      postconditions: 'A new Event Master is created successfully, and the Description field displays in bold format.',
    });
    qase.comment('A confirmation message "Event Master \"Sample Event\" was created." should be displayed'); // Actual result field on QASE
    // === Test Steps ===
    await test.step(`Verify description field accepts formatted text`, async () => {
      await eventMasterFacade.verifyDescriptionFieldAcceptsFormattedText(selectedEvents[0],'was created');
    });
  });

  test(qase(785, 'Should validate Event Master Name field maximum length'), { tag: '@Validation' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'validate Event Master Name field maximum length', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page`, // preconditions field on QASE
    });
    // === Test Steps ===
    await test.step(`Validate maximum length for "${EventFieldLabels.EVENT_MASTER_NAME}" field`, async () => {
      await eventMasterFacade.validateFieldMaxLength(EventFieldLabels.EVENT_MASTER_NAME);
    });
  });

  test(qase(10072, 'Successfully create a new Event Master with type: paid, send to: parent only'), { tag: '@Valiation' }, async ({ page }) => {
    let eventMasterPage = new EventMasterPage(page);
    //=== QASE Metadata ===
    qase.fields({
      description: 'Create a new Event Master with type: paid, send to: parent only', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page`, // preconditions field on QASE
    });
    // === Test Steps ===
    await test.step(`Enter all data, while type = paid, sento = parent only`, async () => {
      qase.comment('Who Can Reserve = parent only');
      await eventMasterPage.clickNewButton();
      await eventMasterPage.fillEventMasterForm(selectedEvents[1]);
      const valueWhoCanReserve = page.locator(EventLocators.SELECT_WHO_CAN_RESERVE);
      await expect(valueWhoCanReserve).toContainText('Parent Only');
    });
    await test.step(`Click Save`, async () => {
      qase.comment('Successfully create a new Event Master with type: paid, send to: parent only'); // Actual result field on QASE
      await eventMasterPage.clickSaveButton();
      await eventMasterPage.verifySuccessMessage('was created');
    });

  });
});
