// ===== IMPORTS =====
import { defineConfig, devices } from '@playwright/test';  // 🎭 Core Playwright configuration
import * as dotenv from 'dotenv';                          // 🌍 Environment variable loading
import path from 'path';                                   // 📁 File path utilities
import { register } from 'tsconfig-paths';                 // 🔗 TypeScript path mapping
import { StorageHelper } from './src/utils/storageHelper'; // 🔐 Authentication storage management

// ===== TYPESCRIPT PATH MAPPING =====
// Register @src/* alias for cleaner imports in test files
register({
  baseUrl: __dirname,     // 📂 Project root directory
  paths: {
    '@src/*': ['src/*']   // 🔗 Maps @src/utils/helper to src/utils/helper
  }
});

// ===== ENVIRONMENT SETUP =====
// Determine which environment to use (dev-staging, pre-prod, etc.)
const ENV = process.env.ENV?.trim() || 'dev-staging';  // 🌍 Default to dev-staging if not specified

// Load environment-specific configuration (URLs, credentials, etc.)
dotenv.config({ path: path.resolve(__dirname, `src/config/${ENV}.env`) });  // 📋 Load main environment config

// Load QASE configuration only when QASE integration is enabled
if (process.env.QASE_MODE) {
  dotenv.config({ path: path.resolve(__dirname, 'src/config/qase.env') });   // 📊 Load QASE TestOps config
}

// ===== AUTHENTICATION STORAGE =====
// Check if we have valid authentication storage to skip login
const storagePath = StorageHelper.shouldRefreshStorageState(ENV, false)     // 🔍 Check if storage is expired
  ? null                                                                     // ❌ Storage expired, will need fresh login
  : StorageHelper.loadStorageState(ENV);                                    // ✅ Storage valid, use existing auth

// Log storage status for debugging
if (storagePath) {
  console.log(`✅ Using existing storage: ${storagePath}`);                 // 🔐 Using cached authentication
} else {
  console.log(`🔄 Storage will be refreshed by global setup`);             // 🔄 Will perform fresh login
}

// ===== DEBUG LOGGING =====
// Show environment variables in CI or debug mode (security: only show first 6 chars of token)
if (process.env.CI || process.env.DEBUG) {
  console.log(' QASE_TESTOPS_API_TOKEN:', process.env.QASE_TESTOPS_API_TOKEN?.slice(0, 6) + '...');  // 🔑 API token (masked)
  console.log(' QASE_TESTOPS_PROJECT:', process.env.QASE_TESTOPS_PROJECT);   // 📊 QASE project ID
  console.log(' QASE_TESTOPS_API_HOST:', process.env.QASE_TESTOPS_API_HOST); // 🌐 QASE API endpoint
  console.log(' QASE_MODE:', process.env.QASE_MODE);                        // 📋 QASE integration mode
  console.log(' QASE_CAPTURE_LOGS:', process.env.QASE_CAPTURE_LOGS);        // 📝 QASE logging level
}

// ===== TIMESTAMP GENERATION =====
// Create timestamp for test run titles (removes milliseconds for readability)
const now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // 📅 Format: "2024-01-15 10:30:00"

// ===== PLAYWRIGHT CONFIGURATION EXPORT =====
export default defineConfig({
  // ===== CORE TEST SETTINGS =====
  testDir: './tests',                    // 📂 Root directory where Playwright looks for *.spec.ts files
  outputDir: './test-results',           // 📁 Directory for test artifacts (screenshots, videos, traces)
  
  // ===== EXECUTION CONTROL =====
  fullyParallel: true,                   // 🔄 Run tests in parallel across different files (faster execution)
  forbidOnly: !!process.env.CI,          // 🚫 Prevent test.only() in CI (avoids accidentally running single test)
  retries: process.env.CI ? 2 : 0,       // 🔄 Retry failed tests: 0 locally (fast feedback), 2 in CI (handle flakiness)
  workers: process.env.CI ? 1 : undefined, // 👥 Worker processes: 1 in CI (stability), auto-detect locally (performance)
  // ===== REPORTER CONFIGURATION =====
  // Conditional reporter loading: QASE integration only when QASE_MODE environment variable is set
  reporter: process.env.QASE_MODE ? [
    // ===== WITH QASE INTEGRATION =====
    ['list'],                            // 📝 Real-time console output during test execution
    ['html', { open: 'never' }],         // 📊 Interactive HTML report (don't auto-open browser)
    ['json', { outputFile: 'test-results.json'}], // 📋 Machine-readable JSON results for CI/CD
    [
      'playwright-qase-reporter',        // 📊 QASE TestOps integration reporter
      {
        mode: process.env.QASE_MODE || 'testops',           // 📋 Integration mode: 'testops' or 'report'
        fallback: process.env.QASE_FALLBACK || 'report',    // 🔄 Fallback mode if TestOps fails
        environment: process.env.QASE_ENVIRONMENT || ENV,   // 🌍 Test environment identifier
        debug: true,                                        // 🔍 Enable debug logging for troubleshooting
        captureLogs: process.env.QASE_CAPTURE_LOGS === 'true', // 📝 Capture console logs in QASE
        
        testops: {                       // 📊 QASE TestOps API configuration
          api: {
            token: process.env.QASE_TESTOPS_API_TOKEN!,      // 🔑 API authentication token (required)
            host: process.env.QASE_TESTOPS_API_HOST || 'api.qase.io', // 🌐 QASE API endpoint
          },
          project: process.env.QASE_TESTOPS_PROJECT!,       // 📊 QASE project identifier (e.g., 'PX')
          run: {
            complete: process.env.QASE_TESTOPS_RUN_COMPLETE !== 'false', // ✅ Auto-complete test run
            title: process.env.QASE_TESTOPS_RUN_TITLE || `Automated Playwright Run - ${ENV} - ${now}`, // 📝 Test run title with timestamp
            description: process.env.QASE_TESTOPS_RUN_DESCRIPTION || 'Playwright automated run', // 📝 Run description
          },
          framework: {                   // 🎭 Framework-specific settings
            browser: {
              addAsParameter: true,      // 🌐 Add browser info as test parameter
              parameterName: 'Chrome 138.0.7204.50', // 📝 Browser version identifier
            },
          },
          uploadAttachments: true,       // 📎 Upload screenshots/videos to QASE
        },
        
        report: {                        // 📋 Local report configuration (fallback mode)
          driver: process.env.QASE_REPORT_DRIVER || 'local',           // 💾 Report storage driver
          connection: {
            path: process.env.QASE_REPORT_CONNECTION_PATH || './build/qase-report', // 📁 Local report path
            format: process.env.QASE_REPORT_CONNECTION_FORMAT || 'json',            // 📋 Report format
          },
        },
      },
    ]
  ] : [
    // ===== WITHOUT QASE INTEGRATION =====
    ['list'],                            // 📝 Console output only
    ['html', { open: 'never' }],         // 📊 HTML report only
    ['json', { outputFile: 'test-results.json'}], // 📋 JSON results only
  ],
  
  // ===== GLOBAL SETUP =====
  globalSetup: require.resolve('./setup/global-setup'), // 🌍 Runs once before all tests (handles authentication)
  
  // ===== TIMEOUT CONFIGURATION =====
  timeout: 10 * 10000,                  // ⏱️ Global test timeout: 100 seconds (10 * 10000ms)
  // ===== GLOBAL USE CONFIGURATION =====
  // These settings apply to all tests unless overridden in project-specific configuration
  use: {
    baseURL: process.env.PAGE_URL,       // 🌐 Base URL from environment (allows relative URLs in tests)
    trace: 'on-first-retry',            // 🔍 Record full trace on first retry (for debugging failures)
    screenshot: 'only-on-failure',      // 📸 Capture screenshots only when tests fail
    video: 'retain-on-failure',         // 🎬 Keep videos only for failed tests (saves disk space)
    headless: process.env.CI ? true : false, // 👁️ Headless in CI (no GUI), visible locally (for debugging)
  },
  
  // ===== PROJECT CONFIGURATIONS =====
  // Multiple projects allow different test configurations (with/without authentication, different browsers, etc.)
  projects: [
    {
      // ===== AUTHENTICATED TESTS PROJECT =====
      name: 'with-storage',             // 📛 Project identifier for tests that use pre-authentication
      testDir: path.resolve(__dirname, 'tests/with-storage'), // 📂 Directory containing authenticated test files
      testMatch: '**/*.spec.ts',         // 🔍 File pattern: all .spec.ts files in subdirectories
      timeout: 10 * 10000,              // ⏱️ Project-specific timeout: 100 seconds
      use: {
        ...devices['Desktop Chrome'],   // 🖥️ Use Chrome browser with desktop viewport
         viewport: { width: 1920, height: 1080 }, 
        storageState: storagePath || undefined, // 🔐 Load authentication cookies/localStorage (if available)
      },
    },
    {
      // ===== NON-AUTHENTICATED TESTS PROJECT =====
      name: 'no-storage',               // 📛 Project for tests that handle their own login
      testDir: path.resolve(__dirname, 'tests/no-storage'), // 📂 Directory for login/permission tests
      testMatch: '**/*.spec.ts',         // 🔍 File pattern: all .spec.ts files in subdirectories
      use: {
        ...devices['Desktop Chrome'],   // 🖥️ Use Chrome browser with desktop viewport
        storageState: undefined,         // 🚫 No pre-authentication (tests start from login page)
      },
    },
    {
      // ===== GENERAL CHROMIUM PROJECT =====
      name: 'chromium',                 // 📛 General project for basic browser tests
      testDir: path.resolve(__dirname, 'tests'), // 📂 Root tests directory
      use: {
        ...devices['Desktop Chrome'],   // 🖥️ Use Chrome browser with desktop viewport
        // Note: No storageState specified, inherits from global use config
      },
    },
  ],
});

// ===== CONFIGURATION SUMMARY =====
// 🌍 Environment: Loads config based on ENV variable (dev-staging, pre-prod, etc.)
// 🔐 Authentication: Uses StorageHelper to manage login state across test runs
// 📊 QASE Integration: Conditionally loads based on QASE_MODE environment variable
// 🖥️ Projects: 3 different configurations for various test scenarios
// 🔍 Debugging: Screenshots, videos, and traces captured on failures
// 🚀 Performance: Optimized settings for both local development and CI/CD
