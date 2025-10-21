import { chromium, FullConfig, Browser, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
import { LoginAction } from '../src/utils/loginHelper';
import { loadConfig, getOrgAlias } from '../src/utils/configHelpers';
import { UserConstants } from "../src/constants/userConstants";
import { StorageHelper } from '../src/utils/storageHelper';
dotenv.config();
// Constants
const TIMEOUTS = {
  LIGHTNING_LOAD: 30000, // Reduced from 60s
  UI_LOGIN: 120000, // Reduced from 180s
} as const;

const BROWSER_ARGS = {
  CI: ['--no-sandbox', '--disable-dev-shm-usage'],
  PERFORMANCE: [
    '--disable-web-security',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-background-timer-throttling',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--metrics-recording-only',
    '--no-first-run',
  ],
};


/**
 * Load environment configuration
 */
async function loadEnvironmentConfig(ENV: string): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, `../src/config/${ENV}.env`) });
  await loadConfig(ENV);
}


/**
 * Attempt SFDX CLI login
 */
async function attemptSfdxLogin(page: Page, alias: string, env: string): Promise<boolean> {
  try {
    console.log(`🔑 Fetching org info for alias: ${alias}`);
    const sfCmd = process.platform === 'win32' ? 'sf.cmd' : 'sf';
    const rawOutput = execSync(`${sfCmd} org display --target-org ${alias} --json`, { 
      encoding: 'utf-8',
      timeout: 15000,
    });
    
    const orgInfo = parseSfdxOutput(rawOutput);
   
    console.log(`Org Info:`, orgInfo);

    if (!orgInfo || !orgInfo.instanceUrl || !orgInfo.accessToken) {
      throw new Error('Missing org info from sf CLI output.');
    }
    console.log(`👤 Username: ${orgInfo.username}`);
    console.log(`🌐 Instance: ${orgInfo.instanceUrl}`);

    await page.goto(`${orgInfo.instanceUrl}/secur/frontdoor.jsp?sid=${orgInfo.accessToken}`);
    await page.waitForURL('**/lightning**', { timeout: TIMEOUTS.LIGHTNING_LOAD });

    await StorageHelper.saveStorageState(page, env);
    console.log(`✅ StorageState saved: ${StorageHelper.getStorageFilePath(env)}`);

    return true;
  } catch (error: any) {
    console.error(`⚠️ SFDX login failed for alias ${alias}: ${error.message}`);
    console.warn("💡 Hint: Run 'sf org display --target-org <alias> --json' manually to verify.");
    return false;
  }
}

/**
 * Attempt UI login as fallback
 */
async function attemptUiLogin(page: Page, role: string, env: string): Promise<void> {
  console.log('🔁 Attempting UI login...');
  await LoginAction(page, role);
  await page.waitForURL(/.*lightning\.force\.com\/lightning\/.*/, { 
    timeout: TIMEOUTS.UI_LOGIN 
  });
  await StorageHelper.saveStorageState(page, env);
  console.log('✅ UI login successful, storage saved.');
}

/**
 * Create and configure browser instance
 */
async function createBrowser(): Promise<Browser> {
  const args = process.env.CI 
    ? [...BROWSER_ARGS.CI] 
    : [...BROWSER_ARGS.PERFORMANCE];
  
  return chromium.launch({
    headless: !!process.env.CI,
    args,
    timeout: 30000, // 30s browser launch timeout
  });
}

/** 
 * Sanitize and parse SFDX JSON output 
 */
function parseSfdxOutput(rawOutput: string) {
  // 1️⃣ Làm sạch output khỏi BOM, màu ANSI, control chars
  let cleaned = rawOutput
    .replace(/^\uFEFF/, '') // remove BOM
    .replace(/\x1B\[[0-9;]*[A-Za-z]/g, '') // remove ANSI color codes
    .replace(/\r/g, '') // remove carriage returns
    .replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, '') // remove weird control chars
    .replace(/^[^{]*/, '') // remove everything before first '{'
    .trim();

  // 2️⃣ Ghép lại các dòng bị wrap giữa key-value
  // (VD: "accessToken": "abc\n123" → "accessToken": "abc123")
  cleaned = cleaned.replace(
    /"([^"]+)":\s*"([^"]*?)\n\s*([^"]*?)"/g,
    (_m, k, v1, v2) => `"${k}": "${v1}${v2}"`
  );

  // 3️⃣ Loại bỏ dấu phẩy thừa cuối dòng nếu có
  cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

  // 4️⃣ Parse JSON
  let sfdxJson: any;
  try {
    sfdxJson = JSON.parse(cleaned);
  } catch (err) {
    console.error(
      '❌ JSON parse failed. Cleaned output preview:\n',
      cleaned.slice(0, 400)
    );
    throw new Error(`Invalid SFDX JSON output: ${(err as Error).message}`);
  }

  // 5️⃣ Extract thông tin cần thiết
  const result = sfdxJson.result || {};
  const { username, accessToken, instanceUrl, id } = result;
  if (!accessToken || !instanceUrl) {
    throw new Error('Missing required Salesforce org info (accessToken or instanceUrl)');
  }
  return { username, accessToken, instanceUrl, id };
}


/**
 * Main global setup function
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🚀 Global setup starting...');
  const ENV = process.env.ENV?.trim() || 'dev-staging';
 const SFDX_ALIAS = getOrgAlias(process.env.SFDX_ALIAS || 'myOrgAlias', ENV);
  await loadEnvironmentConfig(ENV);
  const userType = process.env.USER_TYPE || UserConstants.USR_DEFAULT;

  console.log(`🌍 ENV: ${ENV}`);
  console.log(`🔑 Alias: ${SFDX_ALIAS}`);

  // Check if storage refresh is needed
  const shouldRefresh = StorageHelper.shouldRefreshStorageState(ENV, true);
  if (!shouldRefresh) {
    console.log('✅ Storage state valid — skip login.');
    return;
  }

  // Setup browser with optimizations
  const browser = await createBrowser();
  const page = await browser.newPage();

  // Optimize page for faster loading
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });

  // Block unnecessary resources to speed up loading
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'font', 'media'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    // Try SFDX login first
    const sfdxSuccess = await attemptSfdxLogin(page, SFDX_ALIAS, ENV);

    // Fallback to UI login if SFDX fails
    if (!sfdxSuccess) {
      await attemptUiLogin(page, userType , ENV);
    }
  } finally {
    await browser.close();
  }

  console.log('🏁 Global setup completed.');
}

export default globalSetup;