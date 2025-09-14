# Playwright TypeScript Automation Project

## Setup
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`
3. Install playwright-qase-reporter: `npm install -D playwright-qase-reporter`
4. nstall dotenv: `npm install dotenv --save-dev`
5. Copy `.env.example` to `.env` and configure
6. Update test URLs and selectors as needed

## Structure
- `src/config/` - Configuration and environment handling
- `src/pages/` - Page Object Model classes
- `src/utils/` - Utility classes (QASE reporter, etc.)
- `tests-playwright/` - Test files
- `playwright-report/` - Test execution results

## Usage
```bash
# Basic test execution
npm test                              # Run tests with chromium
npm run test:headed                   # Run tests in headed mode
npm run test:debug                    # Debug tests
npm run test:ui                       # Run tests with UI mode

# Environment-specific tests
npm run test:dev-staging                  # Run tests on dev-staging
npm run test:preprod                  # Run tests on pre-prod

# Storage-specific tests
npm run test:dev-staging-with-storage     # Staging with authentication
npm run test:dev-staging-no-storage       # dev-staging without authentication
npm run test:preprod-with-storage     # Pre-prod with authentication
npm run test:preprod-no-storage       # Pre-prod without authentication

# Reports and utilities
npm run report                        # Show test report
npm run refresh:storage               # Refresh authentication storage

# Direct Playwright commands
npx playwright test login.spec.ts     # Run specific test file
npx playwright test --project=chromium
npx playwright test --project=with-storage
```

## QASE Integration
- Test results automatically reported to QASE when enabled
- Configure API token and project code in qase.env file
- Each test case should have corresponding case_id in QASE