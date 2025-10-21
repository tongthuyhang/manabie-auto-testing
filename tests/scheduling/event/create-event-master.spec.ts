import { expect, test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { EventMasterPage } from '@src/pages/EventMasterPage';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { getItemsByKey, updateObjectFields } from '@src/utils/jsonHelper';
import { EventFieldLabels, EventLocators, EventValidation } from '@src/locators/eventLocators';
import { SiteLocators } from '@src/locators/siteLocators';

/* Data */
const selectedEventNames = ['Sample Event', 'Paid-Parent only', 'Student only'];
// --- Filter event master name ---
const selectedEvents: EventData[] = getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName',
);
// --- Add dynamic data after filter ---
const timestamp = Date.now();
const eventMaster: EventData[] = updateObjectFields(selectedEvents, (event, index) => ({
  eventMasterName: `${event.eventMasterName} ${timestamp + index}`
}));

test.describe('Creating Event Master', () => {
  let eventMasterFacade: EventMasterFacade;
  let eventMasterPage: EventMasterPage;


  test.beforeEach(async ({ page }) => {
    eventMasterFacade = new EventMasterFacade(page);
    eventMasterPage = new EventMasterPage(page);
    await eventMasterPage.goToEventMasterPage();
  });


  test(qase(661, `Create a New Event Master using "Save & New" action`), { tag: "@Regression" }, async () => {
    // data input
    const datateEvent = eventMaster.find(
      e => e.eventMasterName.startsWith('Student only')
    );
    if (!datateEvent) throw new Error('Event not found');

    //=== QASE Metadata ===
    qase.fields({
      description: 'Verify that a new Event Master can be created successfully', // description field on QASE
      preconditions: 'User is logged in and on Event Master page', // preconditions field on QASE
    });
    qase.comment('The Event Master should be created successfully'); // Actual result field on QASE

    // === Test Steps ===

    await test.step(`Create new Event Master with name "${datateEvent?.eventMasterName}"`, async () => {
      await eventMasterFacade.saveNew(datateEvent, 'was created');
    });
  });

  test(qase(664, `Verify cancel functionality in Event Master creation`), { tag: "@Regression" }, async () => {
       // data input
    const datateEvent = eventMaster.find(
      e => e.eventMasterName.startsWith('Student only')
    );
    if (!datateEvent) throw new Error('Event not found');
    //=== QASE Metadata ===
    qase.fields({
      description: `Ensure that clicking 'Cancel' does not save any data.`, // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
    });
    qase.comment(' The "New Event Master" popup should close without saving any data'); // Actual result field on QASE

    // === Test Steps ===
    await test.step(`The user clicks on the "Cancel" button`, async () => {
      await eventMasterFacade.cancelData(datateEvent);
    });
    await test.step(`The user clicks on the "Cancel" button`, async () => {
      await eventMasterPage.verifyModalClose(EventLocators.MODAL_TITLE);
    });

  });

  test(qase(666, `Validate required field "Event Master Name"`), { tag: "@Regression" }, async () => {
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

  test(qase(667, 'Verify description field accepts formatted text'), { tag: '@Validation' }, async () => {
     // data input
    const datateEvent = eventMaster.find(
      e => e.eventMasterName.startsWith('Student only')
    );
    if (!datateEvent) throw new Error('Event not found');
    //=== QASE Metadata ===
    qase.fields({
      description: 'Ensures a formatted Description does not block record creation and is stored/rendered properly.', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, and the 'New' button is visible.`, // preconditions field on QASE
      postconditions: 'A new Event Master is created successfully, and the Description field displays in bold format.',
    });
    qase.comment('A confirmation message "Event Master \"Sample Event\" was created." should be displayed'); // Actual result field on QASE
    // === Test Steps ===
    await test.step(`Verify description field accepts formatted text`, async () => {
      await eventMasterFacade.verifyDescriptionFieldAcceptsFormattedText(datateEvent, 'was created');
    });
  });

  test(qase(785, 'Should validate fields maximum length'), { tag: '@Validation' }, async ({page}) => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'validate fields maximum length', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page`, // preconditions field on QASE
    });
    //=== Test Steps ===
    await test.step(`Validate maximum length for "${EventFieldLabels.EVENT_MASTER_NAME}" field`, async () => {
      await eventMasterFacade.validateEventMasterNameMaxLength(EventLocators.INPUT_EVENT_MASTER_NAME,EventValidation.EVENT_NAME_MAX_LENGTH);
      await eventMasterPage.clickCancelButton();
    });

    await test.step(`Validate maximum length for "${EventFieldLabels.REMINDERS}" `, async () => {
      await eventMasterFacade.validateRemindersMaxLength(SiteLocators.ERROR_LIST,EventValidation.REMINDERS_MAX_VALUE);
      await eventMasterPage.clickCancelButton();
    });

      await test.step(`Validate maximum length for "${EventFieldLabels.MAX_EVENT_PER_STUDENT}" field`, async () => {
      await eventMasterFacade.validateMaxEventPerStudentMaxLength(SiteLocators.ERROR_LIST,EventValidation.MAX_EVENT_PER_STUDENT_MAX);
    });
  });

  test(qase(10072, 'Successfully create a new Event Master with type: paid, send to: parent only'), { tag: '@Valiation' }, async ({ page }) => {
     // data input
    const datateEvent = eventMaster.find(
      e => e.eventMasterName.startsWith('Paid-Parent only')
    );
    if (!datateEvent) throw new Error('Event not found');
    //=== QASE Metadata ===
    //=== QASE Metadata ===
    qase.fields({
      description: 'Create a new Event Master with type: paid, send to: parent only', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page`, // preconditions field on QASE
    });
    qase.comment('Successfully create a new Event Master with type: paid, send to: parent only'); // Actual result field on QASE
    // === Test Steps ===
    await test.step(`Enter all data, while type = paid, sento = parent only`, async () => {
      await eventMasterPage.clickNewButton();
      await eventMasterPage.fillEventMasterForm(datateEvent);
      const valueWhoCanReserve = page.locator(EventLocators.SELECT_WHO_CAN_RESERVE);
      await expect(valueWhoCanReserve).toContainText('Parent Only');
    });
    await test.step(`Click Save`, async () => {
      await eventMasterPage.clickSaveButton();
      await eventMasterPage.verifySuccessMessage('was created');
    });

  });
  test.skip(qase(1, 'Successfully create a new Event Master send to: Student only'), { tag: '@Valiation' }, async ({ page }) => {
    qase.fields({
      description: 'Create a new Event Master with type: paid, send to: Student only', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page`, // preconditions field on QASE
    });
    qase.comment('Successfully create a new Event Master with type: paid, send to: parent only'); // Actual result field on QASE
    // === Test Steps ===
    await test.step(`Enter all data, while type = paid, send to: Student only`, async () => {
      await eventMasterPage.clickNewButton();
      await eventMasterPage.fillEventMasterForm(eventMaster[2]);
      const valueWhoCanReserve = page.locator(EventLocators.SELECT_WHO_CAN_RESERVE);
      await expect(valueWhoCanReserve).toContainText('Student Only');
    });
    await test.step(`Click Save`, async () => {
      await eventMasterPage.clickSaveButton();
      await eventMasterPage.verifySuccessMessage('was created');
    });

  });
});
