// ===== IMPORTS =====
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import { register } from 'tsconfig-paths';

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
const storageStatePath = path.resolve(__dirname, 'storage', `storageState.${ENV}.json`);

// Load environment-specific configuration (URLs, credentials, etc.)
dotenv.config({ path: path.resolve(__dirname, `src/config/${ENV}.env`) });  // 📋 Load main environment config

// Load QASE configuration only when QASE integration is enabled
if (process.env.QASE_MODE) {
  dotenv.config({ path: path.resolve(__dirname, 'src/config/qase.env') });   // 📊 Load QASE TestOps config
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
console.log('📅 Generated timestamp:', now); // Debug: verify timestamp generation

// ===== PLAYWRIGHT CONFIGURATION EXPORT =====
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
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
            id: process.env.QASE_TESTOPS_RUN_ID || undefined,   // 🔗 Attach vào run có sẵn
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
  globalSetup: require.resolve('./setup/global-setup'),
  timeout: 10 * 10000,
   use: {
     baseURL: process.env.PAGE_URL,
     trace: 'on-first-retry',
     screenshot: 'only-on-failure',
     video: 'retain-on-failure',
     headless: process.env.CI ? true : false,
     storageState: storageStatePath,
   },
  
  // ===== PROJECT CONFIGURATIONS =====
  // Multiple projects allow different test configurations (with/without authentication, different browsers, etc.)
   projects: [
     {
       name: 'scheduling',
       testDir: path.resolve(__dirname, 'tests/scheduling'),
       testMatch: '**/*.spec.ts',
       timeout: 10 * 10000,
       use: {
         ...devices['Desktop Chrome'],
         storageState: storageStatePath,
       },
     },
     {
       name: 'order',
       testDir: path.resolve(__dirname, 'tests/order'),
       testMatch: '**/*.spec.ts',
       timeout: 10 * 10000,
       use: {
         ...devices['Desktop Chrome'],
         storageState: storageStatePath,
       },
     },
     // Project no-storage vẫn có thể dùng storageState: undefined nếu muốn test login UI
     {
       name: 'no-storage',
       testDir: path.resolve(__dirname, 'tests/no-storage'),
       testMatch: '**/*.spec.ts',
       use: {
         ...devices['Desktop Chrome'],
         storageState: undefined,
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
