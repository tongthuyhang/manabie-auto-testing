import { test, expect} from '@playwright/test';
import { LoginLocators } from '../../../src/locators/loginLocators';
import { CommonHelpers } from '../../../src/utils/CommonHelpers';
import { QaseReporter } from '../../../src/utils/QaseReporter';
import { getTestCaseInfo, TestCaseInfo } from '../../../src/utils/TestInfoHelper';
import { LoginAction } from '../../../src/utils/LoginHelper';
import { loadConfig } from '../../../src/utils/ConfigHelpers';
import { UserConstants } from '../../../src/constants/userConstants';
import { CommonConstants } from "../../../src/constants/commonConstants";


test.describe('Login Tests',() => {
  let qaseReporter: QaseReporter;
  let caseInfo: TestCaseInfo;
  const env = process.env.ENV?.trim();
  test.beforeAll(async () => {
    qaseReporter = new QaseReporter();
    await loadConfig(env);
  });

  test.beforeEach(async ({ page }, testInfo) => {
    caseInfo = getTestCaseInfo(testInfo.title);
    await qaseReporter.createTestRun(caseInfo.caseName);
  });

  test.afterEach(async ({ page }, testInfo) => {    
    await qaseReporter.reportTestResult(
      caseInfo.caseId, 
      testInfo as any, 
      caseInfo.caseName);
    await qaseReporter.completeTestRun();await qaseReporter.reportTestResult(
      caseInfo.caseId, 
      testInfo as any, 
      caseInfo.caseName);
    await qaseReporter.completeTestRun();
    await CommonHelpers.teardownBrowser(page);
  });

  test('9851 - Should login successfully with valid credentials', async ({ page }) => {
    await LoginAction(page, UserConstants.USR_DEFAULT);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    await expect(page).toHaveURL(/lightning/);
  });

  test('9851 - Should fail login with invalid credentials', async ({ page }) => {
    await LoginAction(page, UserConstants.USR_INVALID);
    await expect(page.locator(LoginLocators.ERROR_MESSAGE)).toBeVisible();
  });
});

