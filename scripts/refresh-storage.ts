import { chromium } from '@playwright/test';
import { LoginAction } from '../src/utils/LoginHelper';
import { StorageHelper } from '../src/utils/storageHelper';
import { loadConfig } from '../src/utils/ConfigHelpers';

(async () => {
    const env = process.env.ENV?.trim() || 'staging';
  
      console.log(`🌍 Environment: ${env}`);
      await loadConfig(env)
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await LoginAction(page, process.env.USER_TYPE || 'admin');
  await page.waitForURL('**/lightning/**');
  await StorageHelper.save(page,env);
  await browser.close();
})();
