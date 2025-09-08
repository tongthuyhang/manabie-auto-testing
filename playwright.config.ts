import { defineConfig, devices } from '@playwright/test';

const ENV = process.env.ENV?.trim() || 'staging'; // default là staging
const storagePath = `storage/storageState.${ENV}.json`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: require.resolve("./global-setup"),
  timeout: 10 * 1000,

  use: {
    baseURL: process.env.PAGE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: !!process.env.CI,
    //storageState: `src/storage/storageState.${process.env.ENV || 'staging'}.json`,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
        //  Normal tests with storage
      name: 'with-storage',
      testDir: './tests/with-storage',   // test folder with session
      use: {
        storageState: storagePath, // ✅ auto use login session
      },
    },
    {
      name: 'no-storage',
      testDir: './tests/no-storage',     // test folder without session
      use: {
        storageState: undefined, // without session (guest flow)
      },
    },
  ],
});