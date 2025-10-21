import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { CommonHelpers } from '@src/utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { EventData } from '@src/type/EventData';
import testData from '@src/data/eventMasterData.json';
import { getItemsByKey } from '@src/utils/jsonHelper';
import { StorageHelper } from '@src/utils/storageHelper';


/* Data to test */
const eventName = 'demo';
test.describe('Searching Event Master', () => {
  let eventMasterFacade: EventMasterFacade;

  test.beforeEach(async ({ page }) => {
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventMasterFacade = new EventMasterFacade(page);
  });

  test.only(qase(786, `Search for a non-existent Event Master`), { tag: '@Regression' }, async ({ page }) => {
      //=== QASE Metadata ===
      qase.fields({
        description: 'Search for a non-existent Event Master', // description field on QASE
        preconditions: `The user has creation permissions, is on the 'Event Master' page`, // preconditions field on QASE
      });
      qase.comment('The Event Master list should show no results');
      await test.step(`search for an Event Master with name "NonExistentEvent123"`, async () => {
        await eventMasterFacade.searchNoData('4343434');
      });
    });

  // selectedEventNames.forEach((eventName) => {
    test(qase(3495,`Search Event Master with valid keyword for "${eventName}"`), { tag: '@Regression' }, async ({ page }) => {
      //=== QASE Metadata ===
      qase.fields({
        description: 'Search Event Master with valid keyword', // description field on QASE
        preconditions: `The user has creation permissions, is on the 'Event Master' page`, // preconditions field on QASE
      });
      qase.comment(' Event Master which has event master name includes keyword is displayed');
      await test.step(`Search and validate event data for "${eventName}"`, async () => {
        await eventMasterFacade.verifyEventData(eventName);
      });
    });
  //});

});
