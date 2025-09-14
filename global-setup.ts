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
    // Đợi DOM load trước
await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

// Đợi network ổn định hơn (Salesforce nhiều request async)
await page.waitForLoadState('networkidle', { timeout: 30000 });

// Chờ tới bất kỳ URL nào có "/lightning/"
await page.waitForURL(/.*lightning.*/, { timeout: 30000 });

// Chờ header chính xuất hiện
await page.locator('header[id="oneHeader"]').waitFor({ state: 'visible', timeout: 30000 });

// Chờ App Launcher button xuất hiện
await page.getByTitle('App Launcher').waitFor({ state: 'visible', timeout: 30000 });
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


