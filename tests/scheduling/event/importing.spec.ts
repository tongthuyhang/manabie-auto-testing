import { expect, test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { EventMasterPage } from '@src/pages/EventMasterPage';
import { CommonHelpers } from '@src/utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import { StorageHelper } from '@src/utils/storageHelper';
import { SiteLocators } from '@src/locators/siteLocators';
import path from "path";


test.describe('Importing Event Maste', () => {
  let eventMasterFacade: EventMasterFacade;
  let eventMasterPage: EventMasterPage;

  test.beforeEach(async ({ page }) => {
    // Check and refresh storage if expired
    await StorageHelper.checkAndRefreshStorage(page);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventMasterFacade = new EventMasterFacade(page);
    eventMasterPage = new EventMasterPage(page);
  });

  test(qase(3494, 'Import Event Master with invalid data'), async ({ page }) => {
    //=== QASE Metadata ===
    qase.title(`Import Event Master with invalid data`);
     qase.fields({
       description: 'Cannot import Event Master csv', // description field on QASE
       preconditions: 'User is logged in and on Event Master page', // preconditions field on QASE
    })
    qase.comment('Show content Unmapped');
    await test.step(`Click Import`, async () => {
      await eventMasterPage.clickImportButton();
      // Navigate to import page
      await page.waitForURL(SiteLocators.URL_IMPORT, { timeout: 30000 });
    });

    await test.step(`Import csv`, async () => {
      const frame = page.frameLocator(SiteLocators.IFRAME);
      const filePath = path.resolve(__dirname, "../../../src/data/masterEventImportInvalid.csv");
      await eventMasterPage.importEventMaster(SiteLocators.BUTTON_ADD_NEW_RECORDS, filePath);
      await eventMasterPage.selectOptionSmart(SiteLocators.LABEL_CHARACTER_CODE, 'Unicode (UTF8)');
      await eventMasterPage.clickNextButton();
      const errorLocator = frame.locator('td[title="Unmapped"]');
      await expect(errorLocator).toHaveCount(1, { timeout: 5000 });
      await expect(errorLocator).toContainText('Unmapped', { timeout: 5000 })
    });

  });

  test(qase(3493, 'Import Event Master with valid data'), async ({ page }) => {
    //=== QASE Metadata ===
    qase.title(`Import Event Master with valid data`);
    qase.fields({
       description: 'Import data success', // description field on QASE
       preconditions: 'User is logged in and on Event Master page', // preconditions field on QASE
    })
    qase.comment(`Don'tShow content Unmapped`);
    await test.step(`Click Import`, async () => {
      await eventMasterPage.clickImportButton();
      // Navigate to import page
      await page.waitForURL(SiteLocators.URL_IMPORT, { timeout: 30000 });
    });
    await test.step(`Import csv`, async () => {
      const frame = page.frameLocator(SiteLocators.IFRAME);
      const filePath = path.resolve(__dirname, "../../../src/data/masterEventImportValid.csv");
      await eventMasterPage.importEventMaster(SiteLocators.BUTTON_ADD_NEW_RECORDS, filePath);
      await eventMasterPage.selectOptionSmart(SiteLocators.LABEL_CHARACTER_CODE, 'Unicode (UTF8)');
      await eventMasterPage.clickNextButton();
      const errorLocator = frame.locator('td[title="Unmapped"]');
      await expect(errorLocator).toHaveCount(0, { timeout: 5000 });
    });
  });

});