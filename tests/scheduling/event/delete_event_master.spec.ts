import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { EventMasterPage } from '@src/pages/EventMasterPage'
import { CommonHelpers } from '@src/utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { getItemsByKey } from '@src/utils/jsonHelper';
import { StorageHelper } from '@src/utils/storageHelper';


/* Data to test */
const selectedEventNames = ['demo', 'Paid-Parent only'];
const selectedEvents: EventData[] = getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName'
);


test.describe('Delete Event Master', () => {
  let eventMasterFacade: EventMasterFacade;
  let eventMasterPage: EventMasterPage;

  test.beforeEach(async ({ page }) => {
    // Check and refresh storage if expired
    //await StorageHelper.checkAndRefreshStorage(page);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventMasterFacade = new EventMasterFacade(page);
    eventMasterPage = new EventMasterPage(page);
  });

  test.only(qase(712, `Click "Undo" to restore deleted Event Master`), { tag: '@Regression' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'Ensure that deleted Event Master can be restored immediately after deletion', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, data is created (10072 is passed)`, // preconditions field on QASE
    });
    qase.comment('The deleted Event Master should reappear in the Event Master list');
    await test.step(`search for an Event Master`, async () => {
      await eventMasterFacade.searchAndValidateEventData('data test undo');
    });
    await test.step(`click the "Undo" link in the success message`, async () => {
      await eventMasterPage.clickMoreActionsButton();
      await eventMasterPage.clickDeleteButton();
      await eventMasterPage.verifyConfirmDeleteDialog();
      await eventMasterPage.clickDialogDeleteButton();
      await eventMasterPage.verifySuccessMessage('was deleted');
      await eventMasterPage.clickUnDoButton();
      await eventMasterFacade.searchAndValidateEventData('data test undo');
      await eventMasterPage.verifySuccessMessage('was restored');

    });
  });

  test.only(qase(675, `Successfully delete an Event Master`), { tag: '@Regression' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'Verify successful deletion of Event Master that has no linked Activity Events', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, data is created (10072 is passed)`, // preconditions field on QASE
    });
    qase.comment('The Event Master should no longer appear in the Event Master list');
    await test.step(`search for an Event Master`, async () => {
      await eventMasterFacade.searchAndValidateEventData(selectedEvents[1].eventMasterName);
    });
    await test.step(`Delete an Event Master`, async () => {
      await eventMasterPage.clickMoreActionsButton();
      await eventMasterPage.clickDeleteButton();
      await eventMasterPage.verifyConfirmDeleteDialog();
      await eventMasterPage.clickDialogDeleteButton();
      await eventMasterPage.verifySuccessMessage('was deleted');
      await eventMasterFacade.searchNoData(selectedEvents[1].eventMasterName);
    });
  });

  test.only(qase(711, `Cancel deletion of Event Master`), { tag: '@Regression' }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'Ensure no changes are made when user clicks "Cancel" in delete popup', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, Delete popup is open`, // preconditions field on QASE
    });
    qase.comment('The popup closes and no data is deleted');
    await test.step(`search for an Event Master`, async () => {
      await eventMasterFacade.searchAndValidateEventData(selectedEvents[0].eventMasterName);
    });
    await test.step(`click "Show 4 more actions" on an Event Master`, async () => {
      await eventMasterPage.clickMoreActionsButton();
    });

    await test.step(`click "Delete"`, async () => {
      await eventMasterPage.clickDeleteButton();
    });
    await test.step(`click "Cancel"`, async () => {
      await eventMasterPage.verifyConfirmDeleteDialog();
    });

    await test.step(`click "Cancel"`, async () => {
      await eventMasterPage.clickDialogCancelButton();
      await eventMasterPage.expectConfirmDialogDisible();
    });
  });


});
