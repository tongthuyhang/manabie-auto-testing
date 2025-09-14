import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventFacade } from '@src/Facade/eventFacade';
import { CommonHelpers } from '@src/utils/CommonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { JsonHelper } from '@src/utils/JsonHelper';

const selectedEventNames = ['demo'];
const selectedEvents: EventData[] = JsonHelper.getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName'
);

test.describe('Event Tests', () => {
  let eventFacade: EventFacade;

  test.beforeEach(async ({ page }) => {
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
      await test.step(`Create & verify Event Master "${event.eventMasterName}"`, async () => {
        await eventFacade.createAndVerify(event);
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
});
