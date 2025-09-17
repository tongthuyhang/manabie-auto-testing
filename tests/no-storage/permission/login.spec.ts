import { test, expect} from '@playwright/test';
import { LoginLocators } from '../../../src/locators/loginLocators';
import { CommonHelpers } from '../../../src/utils/commonHelpers';
import { LoginAction } from '../../../src/utils/loginHelper';
import { loadConfig } from '../../../src/utils/configHelpers';
import { UserConstants } from '../../../src/constants/userConstants';
import { CommonConstants } from "../../../src/constants/commonConstants";


test.describe('Login Tests',() => {
  const env = process.env.ENV?.trim();
  test.beforeAll(async () => {
    await loadConfig(env);
  });

  test.beforeEach(async ({ page }) => {
  });

  test.afterEach(async ({ page }) => {    
    await CommonHelpers.teardownBrowser(page);
  });

  test(' Should login successfully with valid credentials', async ({ page }) => {
    await LoginAction(page, UserConstants.USR_DEFAULT);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    await expect(page).toHaveURL(/lightning/);
  });

  test('Should fail login with invalid credentials', async ({ page }) => {
    await LoginAction(page, UserConstants.USR_INVALID);
    await expect(page.locator(LoginLocators.ERROR_MESSAGE)).toBeVisible();
  });
});

