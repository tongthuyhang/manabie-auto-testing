/// <reference types="node" />
import { chromium, FullConfig, Browser, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { LoginAction } from './src/utils/loginHelper';
import { loadConfig } from './src/utils/configHelpers';
import { StorageHelper } from './src/utils/storageHelper';

// Load ENV (url, login, etc.)
const ENV = process.env.ENV?.trim() || 'dev-staging';
dotenv.config({ path: path.resolve(__dirname, `src/config/${ENV}.env`) });

async function globalSetup(config: FullConfig) {
  console.log("🚀 Global setup starting...");
  console.log(`🔧 Running from: ${process.env.ENV|| 'unknown'}`);
  console.log(" 📁 Config root dir:", config.rootDir);
  console.log("Default timeout:", config.projects[0].timeout);

  const env = process.env.ENV?.trim() || 'dev-staging';
  const userType = process.env.USER_TYPE || 'admin';
  console.log(`🌍 Environment: ${env}, User: ${userType}`);

  await loadConfig(env);

  // Force check storage status
  const shouldRefresh = StorageHelper.shouldRefreshStorageState(env, true);
  console.log(`🔍 Storage refresh needed: ${shouldRefresh}`);
  
  if (shouldRefresh) {
    console.log(`🔄 Storage needs refresh - proceeding with login...`);
  } else {
    const storagePath = StorageHelper.getStorageFilePath(env);
    console.log(`✅ Found valid storageState: ${storagePath}, skipping login.`);
    return;
  }

  let browser: Browser | null = null;
  try {
    // Launch browser
    browser = await chromium.launch({
      headless: !!process.env.CI,
      args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [],
    });

    const page: Page = await browser.newPage();

    // Login
    await LoginAction(page, userType);

    // Wait for Salesforce Lightning page
    await page.waitForURL(/.*lightning\.force\.com\/lightning\/.*/, { timeout: 60000 });
    //await page.waitForURL('**/lightning/**', { timeout: 30000 });
    await page.waitForSelector('header[id="oneHeader"]', { timeout: 3000 });

    console.log(`✅ Salesforce login successful. Current URL: ${page.url()}`);

    // Save storageState using helper
    await StorageHelper.saveStorageState(page, env);
    console.log(`✅ Storage saved at: ${StorageHelper.getStorageFilePath(env)} (${new Date().toISOString()})`);
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default globalSetup;
