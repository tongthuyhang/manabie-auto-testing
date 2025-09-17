/// <reference types="node" />
import { chromium, FullConfig, Browser, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { LoginAction } from './src/utils/LoginHelper';
import { loadConfig } from './src/utils/ConfigHelpers';
import { StorageHelper } from './src/utils/storageHelper';

// Load ENV (url, login, etc.)
const ENV = process.env.ENV?.trim() || 'dev-staging';
dotenv.config({ path: path.resolve(__dirname, `src/config/${ENV}.env`) });

async function globalSetup(config: FullConfig) {
  console.log("🚀 Global setup starting...");

  const env = process.env.ENV?.trim() || 'dev-staging';
  const userType = process.env.USER_TYPE || 'admin';
  console.log(`🌍 Environment: ${env}, User: ${userType}`);

  await loadConfig(env);

  // Check if valid storageState already exists
  if (StorageHelper.isValid(env)) {
    const storagePath = StorageHelper.getPath(env);
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
    await page.waitForSelector('header[id="oneHeader"]', { timeout: 60000 });

    console.log(`✅ Salesforce login successful. Current URL: ${page.url()}`);

    // Save storageState using helper
    await StorageHelper.save(page, env);
    console.log(`✅ Storage saved at: ${StorageHelper.getPath(env)} (${new Date().toISOString()})`);
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
