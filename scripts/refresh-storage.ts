import { chromium } from '@playwright/test';
import { LoginAction } from '../src/utils/LoginHelper';
import { StorageHelper } from '../src/utils/storageHelper';
import { loadConfig } from '../src/utils/ConfigHelpers';
import * as dotenv from 'dotenv';
import path from 'path'

(async () => {
  const ENV = process.env.ENV?.trim() || 'dev-staging';
  dotenv.config({ path: path.resolve(__dirname, `src/config/${ENV}.env`) });
      console.log(`🌍 Environment: ${ENV}`);
      await loadConfig(ENV)
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await LoginAction(page, process.env.USER_TYPE || 'admin');
  await page.waitForURL('**/lightning/**');
  await StorageHelper.save(page,ENV);
  await browser.close();
})();
