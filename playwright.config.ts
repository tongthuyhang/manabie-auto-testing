import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { register } from 'tsconfig-paths';
import { StorageHelper } from './src/utils/storageHelper';

// Register tsconfig paths for @src alias
register({
  baseUrl: __dirname,
  paths: {
    '@src/*': ['src/*']
  }
});

// ==== ENV setup ====
const ENV = process.env.ENV?.trim() || 'dev-staging';

// Load main ENV (url, login, etc.)
dotenv.config({ path: path.resolve(__dirname, `src/config/${ENV}.env`) });

// Load Qase env only if QASE_MODE is set
if (process.env.QASE_MODE) {
  dotenv.config({ path: path.resolve(__dirname, 'src/config/qase.env') });
}

// Get storage path (only use if valid and not expired)
const storagePath = StorageHelper.shouldRefreshStorageState(ENV, false) ? null : StorageHelper.loadStorageState(ENV);

// Only log once in config
if (storagePath) {
  console.log(`✅ Using existing storage: ${storagePath}`);
} else {
  console.log(`🔄 Storage will be refreshed by global setup`);
}

// Debug log env (only in CI or when DEBUG=true)
if (process.env.CI || process.env.DEBUG) {
  console.log(' QASE_TESTOPS_API_TOKEN:', process.env.QASE_TESTOPS_API_TOKEN?.slice(0, 6) + '...');
  console.log(' QASE_TESTOPS_PROJECT:', process.env.QASE_TESTOPS_PROJECT);
  console.log(' QASE_TESTOPS_API_HOST:', process.env.QASE_TESTOPS_API_HOST);
  console.log(' QASE_MODE:', process.env.QASE_MODE);
  console.log(' QASE_CAPTURE_LOGS:', process.env.QASE_CAPTURE_LOGS);
}

// create date test
const now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

// ==== Export config ====
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.QASE_MODE ? [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json'}],
    [
      'playwright-qase-reporter',
      {
        mode: process.env.QASE_MODE || 'testops',
        fallback: process.env.QASE_FALLBACK || 'report',
        environment: process.env.QASE_ENVIRONMENT || ENV,
        debug: true,
        captureLogs: process.env.QASE_CAPTURE_LOGS === 'true',
        testops: {
          api: {
            token: process.env.QASE_TESTOPS_API_TOKEN!,
            host: process.env.QASE_TESTOPS_API_HOST || 'api.qase.io',
          },
          project: process.env.QASE_TESTOPS_PROJECT!,
          run: {
            complete: process.env.QASE_TESTOPS_RUN_COMPLETE !== 'false',
            title: process.env.QASE_TESTOPS_RUN_TITLE || `Automated Playwright Run - ${ENV} - ${now}`,
            description: process.env.QASE_TESTOPS_RUN_DESCRIPTION || 'Playwright automated run',
          },
          framework: {
            browser: {
              addAsParameter: true,
              parameterName: 'Chrome 138.0.7204.50',
            },
          },
          uploadAttachments: true,
        },
        report: {
          driver: process.env.QASE_REPORT_DRIVER || 'local',
          connection: {
            path: process.env.QASE_REPORT_CONNECTION_PATH || './build/qase-report',
            format: process.env.QASE_REPORT_CONNECTION_FORMAT || 'json',
          },
        },
      },
    ]
  ] : [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json'}],
  ],
  globalSetup: require.resolve('./setup/global-setup'),
  timeout: 10 * 10000,
  use: {
    baseURL: process.env.PAGE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'with-storage',
      testDir: path.resolve(__dirname, 'tests/with-storage'),
      testMatch: '**/*.spec.ts',
      timeout: 10 * 10000,
      use: {
        ...devices['Desktop Chrome'],
        storageState: storagePath || undefined,
      },
    },
    {
      name: 'no-storage', 
      testDir: path.resolve(__dirname, 'tests/no-storage'),
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },
    {
      name: 'chromium',
      testDir: path.resolve(__dirname, 'tests'),
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
