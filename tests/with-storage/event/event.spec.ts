import test from '@playwright/test';
import { CommonHelpers } from '../../../src/utils/CommonHelpers';
import { CommonConstants } from '../../../src/constants/commonConstants';
import { EventFacade } from '../../../src/Facade/EventFacade';
import { EventData } from '../../../src/type/EventData';
import testData from '../../../src/data/eventMasterData.json';
import { JsonHelper } from '../../../src/utils/JsonHelper';
import { QaseReporter } from '../../../src/utils/QaseReporter';
import { getTestCaseInfo, TestCaseInfo } from '../../../src/utils/TestInfoHelper';

// ✅ Load test data from JSON into strongly typed array
const events: EventData[] = testData;

let eventFacade: EventFacade;

// ✅ Run tests only for selected events (filter by eventMasterName)
const selectedEventNames = ['demo'];
const selectedEvents = JsonHelper.getItemsByKey(
  testData,
  selectedEventNames,
  'eventMasterName'
);
let qaseReporter: QaseReporter;
let caseInfo: TestCaseInfo;

test.describe('Event Tests', () => {
  test.beforeAll(async () => {
    qaseReporter = new QaseReporter();
  });
  test.beforeEach(async ({ page }, testInfo) => {
    caseInfo = getTestCaseInfo(testInfo.title);
    await qaseReporter.createTestRun(caseInfo.caseName);
    // Navigate to Event Master page
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventFacade = new EventFacade(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await qaseReporter.reportTestResult(
      caseInfo.caseId,
      testInfo as any,
      caseInfo.caseName);
    await qaseReporter.completeTestRun(); await qaseReporter.reportTestResult(
      caseInfo.caseId,
      testInfo as any,
      caseInfo.caseName);
    await qaseReporter.completeTestRun();
    // Navigate to Event Master page
    // await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);

    // // Initialize facade layer
    // eventFacade = new EventFacade(page);
  });

  /**
   * Strategy 1: Use `for...of` loop
   * → Each event in JSON becomes one test
   */
  for (const event of events) {
    test(`661 - Create event (for-of): ${event.eventMasterName}`, async () => {
      await eventFacade.createEvent(event);
    });
  }

  /**
   * Strategy 2: Use `forEach` loop
   * → Same effect, different style
   */
  events.forEach((event) => {
    test(`Create event (forEach): ${event.eventMasterName}`, async () => {
      await eventFacade.createEvent(event);
    });
  });

  /**
   * Strategy 3: Run only for selected events
   * → Useful for targeted runs
   */
  for (const event of selectedEvents) {
    test(`661 - Create event (selected only): ${event.eventMasterName}`, async () => {
      await eventFacade.createEvent(event);
    });
  }

   test(`check validate`, async () => {
      
    });
});
