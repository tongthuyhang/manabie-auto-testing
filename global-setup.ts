// // // globalSetup.ts
// /// <reference types="node" />
// import { chromium, FullConfig } from '@playwright/test';
// import { loadConfig } from './src/utils/ConfigHelpers';
// import { LoginAction } from './src/utils/LoginHelper';
// import { StorageHelper } from './src/utils/storageHelper';

// async function globalSetup(config: FullConfig) {
//     console.log("🚀 Global setup is running via Test Explorer!");
//   try {
//     const env = process.env.ENV?.trim() || 'dev-staging';

//     console.log(`🌍 Environment: ${env}`);
//     await loadConfig(env);


//     const browser = await chromium.launch();
//     const page = await browser.newPage();
//     // Lấy user info từ file JSON theo ENV + USER_TYPE
//     await LoginAction(page, process.env.USER_TYPE as string);
//     // 👉 Chờ redirect về domain chính sau khi login
//     // Đợi redirect sang domain chính (lightning.force.com)
//   //await page.waitForURL(/.*lightning\.force\.com\/lightning\/.*/, { timeout: 60000 });
//   await page.waitForTimeout(6000);
//   console.log("✅ Salesforce login successful. Current URL:", page.url());
//   await page.waitForURL(/.*lightning\.force\.com\/lightning\/.*/, { timeout: 60000 })
//     // Save storage mới
//     await StorageHelper.save(page, env)
//     await browser.close();

//     console.log(`✅ Saved login session to storageState.json`);
//   }

//   catch (error) {
//     console.error('❌ Global setup failed:', error);
//     throw error;
//   }

// }

// export default globalSetup;



/// <reference types="node" />
import { chromium, FullConfig, Browser, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginAction } from './src/utils/LoginHelper';
import { StorageHelper } from './src/utils/storageHelper';
import { loadConfig } from './src/utils/ConfigHelpers';

async function globalSetup(config: FullConfig) {
  console.log("🚀 Global setup starting...");

  try {
    const env = process.env.ENV?.trim() || 'dev-staging';
    const userType = process.env.USER_TYPE || 'admin';
    console.log(`🌍 Environment: ${env}, User: ${userType}`);

    await loadConfig(env);

    // Đường dẫn lưu storageState
    const storageDir = path.resolve(__dirname, 'storage');
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir);

    const storagePath = path.join(storageDir, `storageState.${env}.json`);

    // Nếu đã có storageState → không login nữa
    if (fs.existsSync(storagePath)) {
      console.log(`✅ Found existing storageState: ${storagePath}, skipping login.`);
      return;
    }

    // Browser config: headless trên CI, headed trên local
    const browser: Browser = await chromium.launch({
      headless: process.env.CI ? true : false,
      args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [],
    });

    const page: Page = await browser.newPage();

    // Login và lưu storage
    await LoginAction(page, userType);

    // Chờ redirect thành công sang Lightning page
    await page.waitForURL(/.*lightning\.force\.com\/lightning\/.*/, { timeout: 60000 });
    await page.waitForSelector('header[id="oneHeader"]', { timeout: 60000 });

    console.log(`✅ Salesforce login successful. Current URL: ${page.url()}`);

    // Lưu storageState
    await StorageHelper.save(page, storagePath);
    console.log(`✅ Storage saved at: ${storagePath}`);

    await browser.close();
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;

