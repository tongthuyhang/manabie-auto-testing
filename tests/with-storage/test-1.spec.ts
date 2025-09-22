import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Recording...
  await page.goto('https://dev-staging.lightning.force.com/lightning/o/MANAERP__Event_Master__c/new?count=1&nooverride=1&useRecordTypeCheck=1&navigationLocation=LIST_VIEW&uid=175852119192413072&backgroundContext=%2Flightning%2Fo%2FMANAERP__Event_Master__c%2Fhome');
  await page.locator('.slds-rich-text-area__content').click();
  await page.getByRole('textbox', { name: 'Description' }).fill('tesst  uuuuu');
  await page.getByRole('textbox', { name: 'Description' }).press('Tab');
  await page.getByText('tesst uuuuu').click();
  await page.getByRole('button', { name: 'Bold' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('tesst  uuuuu\n\nyyyyyyyyyy');
  await page.getByRole('textbox', { name: 'Description' }).press('Tab');
});
