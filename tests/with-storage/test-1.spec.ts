import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://dev-staging.lightning.force.com/lightning/r/MANAERP__Event_Master__c/a14IU00000ELiGsYAL/view');
  await page.locator('records-highlights2 div').filter({ hasText: 'Open to Booking SystemCreate' }).first().click();
  await page.locator('records-highlights2 lightning-formatted-text').click();
});