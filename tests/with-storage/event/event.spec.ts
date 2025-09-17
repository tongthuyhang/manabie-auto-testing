import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventFacade } from '@src/facade/eventFacade';
import { CommonHelpers } from '@src/utils/CommonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { JsonHelper } from '@src/utils/JsonHelper';
import {StorageHelper} from '@src/utils/storageHelper';

const selectedEventNames = ['demo'];
const selectedEvents: EventData[] = JsonHelper.getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName'
);

test.describe('Event Tests', () => {
  let eventFacade: EventFacade;

  test.beforeEach(async ({ page }) => {
    // Check and refresh storage if expired
    await StorageHelper.checkAndRefreshStorage(page);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventFacade = new EventFacade(page);
  });

  selectedEvents.forEach((event) => {

    test(`Create Event Master for"${event.eventMasterName}"`, { tag: "@Regression" }, async ({ page }) => {
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
      await test.step(` I create a new Event Master with the name "Sample Event" ${event.eventMasterName}"`, async () => {
        await eventFacade.createAndVerify(event);
      });
      await test.step('Navigate to Event Master page', async () => {
        await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
      });
      await test.step(`Then the Event Master should be created successfully including name "Sample Event"`, async () => {

        await eventFacade.searchData('demo');
      });
    });
  });
  test(`Validate required field "Event Master Name"`, { tag: "@Regression" }, async ({ page }) => {
    //=== QASE Metadata ===
    qase.id(666);
    qase.title(`Ensure that the system prompts the user when the required Event Master Name is not filled.`);
    qase.comment('Message "Complete this field." should be displayed under fields'); // Actual result field on QASE
    qase.fields({
      description: 'Ensure that the system prompts the user when the required Event Master Name is not filled.', // description field on QASE
      preconditions: 'User is logged in and on Event Master page', // preconditions field on QASE
    });

    // === Test Steps ===
    await test.step(`error message "Complete this field." should be displayed under fields`, async () => {
      await eventFacade.checkMandatoryMasterEvent();
    });
  });

  test(`Search data and check data`, { tag: "@Regression" }, async ({ page }) => {

    await eventFacade.searchData('demo');

  });

  test(`Check max lenght event master name`, { tag: "@Regression" }, async ({ page }) => {

    await eventFacade.checkMaxLenght('Event Master Name');

  });

});
