# Playwright TypeScript Automation Project

## Setup
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`
3. Copy `.env.example` to `.env` and configure
4. Update test URLs and selectors as needed

## Structure
- `src/config/` - Configuration and environment handling
- `src/pages/` - Page Object Model classes
- `src/utils/` - Utility classes (QASE reporter, etc.)
- `tests-playwright/` - Test files
- `playwright-report/` - Test execution results

## Usage
```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run specific test file
npx playwright test login.spec.ts

# Run with environment variables
ENV=staging QASE_ENABLED=true npm test

# Run with specific browser
npx playwright test --project=chromium
# Run with-storage
npx playwright test --project=with-storage

# Debug tests
npm run test:debug
```

## QASE Integration
- Test results automatically reported to QASE when enabled
- Configure API token and project code in .env file
- Each test case should have corresponding case_id in QASE

## Migration from Robot Framework
- Robot Framework keywords → TypeScript methods
- Resource files → Page Object classes
- Variables → Environment configuration
- Test cases → Playwright test functions