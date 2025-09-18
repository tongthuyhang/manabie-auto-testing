import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { CommonHelpers } from '@src/utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { getItemsByKey } from '@src/utils/jsonHelper';
import { StorageHelper } from '@src/utils/storageHelper';
import { EventFieldLabels } from '@src/locators/eventLocators'

const selectedEventNames = ['demo'];
const selectedEvents: EventData[] = getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName'
);

test.describe('Event Master Tests', () => {
  let eventMasterFacade: EventMasterFacade;

  test.beforeEach(async ({ page }) => {
    // Check and refresh storage if expired
    await StorageHelper.checkAndRefreshStorage(page);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventMasterFacade = new EventMasterFacade(page);
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
      await test.step(`Create new Event Master with name "${event.eventMasterName}"`, async () => {
        await eventMasterFacade.createAndVerifyEvent(event);
      });
      await test.step('Navigate to Event Master page', async () => {
        await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
      });
      await test.step(`Verify Event Master "${event.eventMasterName}" appears in list`, async () => {
        await eventMasterFacade.searchAndValidateEventData(event.eventMasterName);
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
    await test.step('Validate mandatory field error messages are displayed', async () => {
      await eventMasterFacade.validateMandatoryFieldErrors();
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
    await test.step(`Validate maximum length for "${EventFieldLabels.EVENT_MASTER_NAME}" field`, async () => {
      await eventMasterFacade.validateFieldMaxLength(EventFieldLabels.EVENT_MASTER_NAME);
    });
  });

});
