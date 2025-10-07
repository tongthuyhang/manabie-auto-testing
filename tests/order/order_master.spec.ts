import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { CommonHelpers } from '@src/utils/commonHelpers';
import { CommonConstants } from '@src/constants/commonConstants';
import * as dotenv from 'dotenv';

// Load environment-specific config
const env = process.env.NODE_ENV || 'dev-staging';
dotenv.config({ path: `src/config/${env}.env` });



/* Data to test */

test.describe('Order', () => {


  test.beforeEach(async ({ page }) => {
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_ORDER);
   
  });

  test(qase(786, `check url`), { tag: '@Regression' }, async ({ page }) => {
      //=== QASE Metadata ===
      qase.fields({
        description: 'check url', // description field on QASE
        preconditions: `Login success`, // preconditions field on QASE
      });
      qase.comment('Navigate to order page');
      expect(page.url()).toBe(process.env.ORDER_URL);
      
    });


});
