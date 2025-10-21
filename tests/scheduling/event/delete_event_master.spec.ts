import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { EventMasterPage } from '@src/pages/EventMasterPage';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { getItemsByKey, updateObjectFields } from '@src/utils/jsonHelper';
import { updateNamesWithTimestamp, getItemsByOriginalNames } from '@src/utils/dataHelpers';



test.describe('Delete Event Master', () => {
  let eventMasterFacade: EventMasterFacade;
  let eventMasterPage: EventMasterPage;


  test.beforeEach(async ({ page }) => {
    eventMasterFacade = new EventMasterFacade(page);
    eventMasterPage = new EventMasterPage(page);
    await eventMasterPage.goToEventMasterPage();

  });

  test(qase(712, `Click "Undo" to restore deleted Event Master`), { tag: '@Regression' }, async () => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'Ensure that deleted Event Master can be restored immediately after deletion', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, data is created (10072 is passed)`, // preconditions field on QASE
    });
    qase.comment('The deleted Event Master should reappear in the Event Master list');
    await eventMasterFacade.restoreDeletedEventMaster('edit_updated');
    await test.step(`search for an Event Master`, async () => {
      await eventMasterPage.verifySuccessMessage('was restored');
    })
  });

  test(qase(675, `Successfully delete an Event Master`), { tag: '@Regression' }, async ({page}) => {
    // Create fresh data for this test
    const selectedEvents = getItemsByKey(testData, ['test delete'], 'eventMasterName');
    const eventMaster = updateNamesWithTimestamp(selectedEvents, 'eventMasterName');
    const eventsToUse = getItemsByOriginalNames(eventMaster, 'eventMasterName', ['test delete']);
    console.log("data delete", eventsToUse);
    //=== QASE Metadata ===
    qase.fields({
      description: 'Verify successful deletion of Event Master that has no linked Activity Events', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, data is created (10072 is passed)`, // preconditions field on QASE
    });
    qase.comment('The Event Master should no longer appear in the Event Master list');
    await test.step(`search for an Event Master`, async () => {
      await eventMasterFacade.createPreconditionData(eventsToUse);
      // Wait for data to be available in the system
      await page.waitForTimeout(2000);
      await eventMasterPage.goToEventMasterPage();
      await eventMasterPage.searchEventMasterByName(eventsToUse);
    });
    await test.step(`Delete an Event Master`, async () => {
      await eventMasterFacade.deletedEventMaster(eventsToUse);
    });
    await test.step(`verify delete an Event Master`, async () => {
      await eventMasterPage.verifySuccessMessage('was deleted');
      await eventMasterFacade.searchNoData(eventsToUse);
    });
  });

  test(qase(711, `Cancel deletion of Event Master`), { tag: '@Regression' }, async () => {
    //=== QASE Metadata ===
    qase.fields({
      description: 'Ensure no changes are made when user clicks "Cancel" in delete popup', // description field on QASE
      preconditions: `The user has creation permissions, is on the 'Event Master' page, Delete popup is open`, // preconditions field on QASE
    });
    qase.comment('The popup closes and no data is deleted');
    await eventMasterFacade.cancelDeletionofEventMaster('demo')
    await test.step(`verify delete dialog is closed`, async () => {
      await eventMasterPage.expectConfirmDialogInvisible();
    })
  });

  test(qase(4, `Change Owner`), { tag: '@Regression' }, async () => {
    await eventMasterFacade.changeOwnerofEventMaster('demo');
  });

  test(qase(4, `Assig lable`), { tag: '@Regression' }, async () => {
    await eventMasterFacade.asignLabelofEventMaster('demo');
  });

  test(qase(4, `Edit data`), { tag: '@Regression' }, async () => {
    const timestamp = Date.now();
    const originalName = 'original_update'; // existing data
    const dataEdit = `original_update_${timestamp}`; // dynamic updated name
    await eventMasterFacade.editDataofEventMaster(originalName, dataEdit);
    await test.step(`verify edit data`, async () => {
      await eventMasterPage.verifySuccessMessage(`Event Master "${dataEdit}" was saved.`);
    })
  });
})