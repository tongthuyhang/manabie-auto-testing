// // globalSetup.ts
import { chromium, FullConfig } from '@playwright/test';
import { loadConfig } from './src/utils/ConfigHelpers';
import { LoginAction } from './src/utils/LoginHelper';
import { StorageHelper } from './src/utils/storageHelper';

async function globalSetup(config: FullConfig) {
    console.log("🚀 Global setup is running via Test Explorer!");
  try {
    const env = process.env.ENV?.trim() || 'dev-staging';

    console.log(`🌍 Environment: ${env}`);
    await loadConfig(env);


    const browser = await chromium.launch();
    const page = await browser.newPage();
    // Lấy user info từ file JSON theo ENV + USER_TYPE
    await LoginAction(page, process.env.USER_TYPE as string);
    // 👉 Chờ redirect về domain chính sau khi login
    //await page.waitForLoadState('networkidle');
    //await page.waitForURL('**/lightning/**', { timeout: 15000 });
    await page.locator('header[id="oneHeader"]').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.getByTitle('App Launcher').waitFor({ state: 'visible', timeout: 15000 });
    // Save storage mới
    await StorageHelper.save(page, env)
    await browser.close();

    console.log(`✅ Saved login session to storageState.json`);
  }

  catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }

}

export default globalSetup;


