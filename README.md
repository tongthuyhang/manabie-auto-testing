# Manabie Auto Testing Framework

## Overview
A comprehensive Playwright TypeScript automation testing framework for Salesforce applications with Page Object Model pattern, storage management, and QASE integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version)
- Git
- VS Code (recommended)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd manabie-auto-testing

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Setup
1. Configure environment files in `src/config/`:
   - `dev-staging.env` - Development environment
   - `pre-prod.env` - Pre-production environment
   - `qase.env` - QASE integration settings

2. Set up user credentials in `src/data/users.json`

## 🧪 Running Tests

### Local Development
```bash
# Run all tests (dev-staging)
npm run test

# Run with browser visible
npm run test:headed

# Run with debug mode
npm run test:debug

# Run with UI mode
npm run test:ui

# Run specific environment
npm run test:dev-staging
npm run test:preprod
```

### Test Categories
```bash
# Tests with authentication storage
npm run test:dev-staging:with-storage

# Tests without storage (fresh login)
npm run test:dev-staging:no-storage

# Regression tests only
npm run test:regression
```

### QASE Integration
```bash
# Run with QASE reporting
npm run test:dev-staging:qase

# Local QASE reporting
npm run test:dev-staging:local
```

## 🏗️ Architecture

### Page Object Model
```typescript
// Base page with common functionality
export class BasePage {
  async click(locator: string | Locator): Promise<void>
  async type(locator: string | Locator, text: string): Promise<void>
  async verifyData(locator: string | Locator, expectedText: string): Promise<void>
}

// Specific page implementation
export class EventPage extends BasePage {
  async fillEventMasterForm(data: EventData): Promise<void>
  async searchEventMaster(name: string): Promise<void>
}
```

### Facade Pattern
```typescript
// High-level business operations
export class EventMasterFacade {
  async createAndVerify(data: EventData): Promise<void>
  async searchData(name: string): Promise<void>
}
```

### Storage Management
```typescript
// Automatic storage refresh
await StorageRefreshHelper.checkAndRefreshStorage(page);

// Manual storage operations
StorageHelper.isExpired(env)
StorageHelper.shouldRefresh(env)
await StorageHelper.save(page, env)
```

## 📁 Project Structure
See detailed [Project Structure & Icons](./STRUCTURE.md)

```
setup/              # Global setup/teardown
├── global-setup.ts
└── global-teardown.ts

src/
├── base/           # Base classes
├── config/         # Environment configs
├── constants/      # Application constants
├── data/           # Test data
├── facade/         # Business logic facades
├── locators/       # Element selectors
├── pages/          # Page Object Model
├── type/           # TypeScript types
└── utils/          # Helper utilities

tests/
├── no-storage/     # Tests without auth
└── with-storage/   # Tests with auth

storage/            # Authentication states
scripts/            # Utility scripts (ignored in git)
```

## 🔧 Configuration

### Playwright Config
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./setup/global-setup'),
  projects: [
    { name: 'with-storage', testDir: './tests/with-storage' },
    { name: 'no-storage', testDir: './tests/no-storage' }
  ]
});

+---------------------+
| playwright.config.ts|
|  (your settings)    |
+---------------------+
          │
          ▼
+---------------------+
|  Playwright Runner  |
|  (npx playwright ...)|
+---------------------+
          │
          ▼
+-------------------------------+
| FullConfig object             |
| (compiled config from file)   |
|                               |
|  • projects[]                 |
|  • rootDir                    |
|  • timeout                    |
|  • metadata                   |
|  • workers, retries...        |
+-------------------------------+
          │   (auto injects)
          ▼
+-------------------------------+
| globalSetup(config: FullConfig)|
|                               |
|  ✅ You can access all         |
|     config info here           |
|                               |
|  Example:                     |
|  console.log(config.projects)  |
+-------------------------------+
          │
          ▼
          
+---------------------+
| Test Execution      |
| (uses prepared      |
|  environment)       |
+---------------------+


```

### Environment Variables
```bash
ENV=dev-staging          # Environment
USER_TYPE=admin          # User type for login
QASE_MODE=testops        # QASE mode
```

## 🔐 Authentication & Storage

### How It Works
1. **Global Setup**: Checks storage expiration
2. **Auto-Refresh**: Re-authenticates if expired
3. **Storage Reuse**: Uses cached auth for subsequent tests
4. **Expiration Check**: File age (24h) + cookie validation

### Storage Files
```
storage/
├── storageState.dev-staging.json
├── storageState.pre-prod.json
└── storageState.staging.json
```

### Manual Storage Refresh
```bash
npm run refresh:storage
```

## 📊 Test Reporting

### HTML Reports
```bash
# Generate and open report
npm run report
```

### QASE Integration
- Automatic test case mapping
- Result synchronization
- Attachment uploads
- Custom metadata

### CI/CD Reports
- GitHub Actions artifacts
- Test result summaries
- Failure screenshots

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/playwright.yml
- name: Run Tests
  run: npm run test:dev-staging:qase
  env:
    ENV: dev-staging
    USER_TYPE: admin
    QASE_TESTOPS_API_TOKEN: ${{ secrets.QASE_TOKEN }}
```

### Pipeline Features
- Automatic dependency installation
- Browser setup
- Parallel test execution
- Artifact collection
- QASE reporting

## 📝 Writing Tests

### Basic Test Structure
```typescript
import { test } from '@playwright/test';
import { EventMasterFacade } from '@src/facade/EventMasterFacade';
import { StorageRefreshHelper } from '@src/utils/StorageRefreshHelper';

test.describe('Event Tests', () => {
  let EventMasterFacade: EventMasterFacade;

  test.beforeEach(async ({ page }) => {
    // Auto-refresh storage if expired
    await StorageRefreshHelper.checkAndRefreshStorage(page);
    
    // Navigate to page
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    EventMasterFacade = new EventMasterFacade(page);
  });

  test('Create Event Master', async ({ page }) => {
    const eventData = { name: 'Test Event', type: 'Meeting' };
    await EventMasterFacade.createAndVerify(eventData);
  });
});
```

### QASE Integration
```typescript
test('Create Event Master', async ({ page }) => {
  // QASE metadata
  qase.id(661);
  qase.title('Create Event Master');
  qase.parameters({ inputData: JSON.stringify(eventData) });
  
  // Test steps
  await test.step('Create event', async () => {
    await EventMasterFacade.createAndVerify(eventData);
  });
});
```

## 🛠️ Development Guidelines

### Code Standards
- Use TypeScript strict mode
- Follow Page Object Model pattern
- Implement proper error handling
- Add meaningful test descriptions
- Use async/await consistently

### Best Practices
- Keep tests independent
- Use data-driven testing
- Implement proper waits
- Handle dynamic content
- Use meaningful assertions

### Debugging
```bash
# Debug specific test
npx playwright test event.spec.ts --debug

# Run in headed mode
npx playwright test --headed

# Use UI mode
npx playwright test --ui
```

## 🔍 Troubleshooting

### Common Issues

#### Storage Expired
```bash
# Check storage status
node -e "const {StorageHelper} = require('./src/utils/storageHelper'); console.log(StorageHelper.isExpired('dev-staging'))"

# Refresh storage
npm run refresh:storage

# Update the storage file about the expiration to test the function to refresh storage when it expires.
In cmd, type: powershell -Command "(Get-Item 'storage\storageState.dev-staging.json').LastWriteTime = (Get-Date).AddHours(-25)"
# Check expired file have yet
powershell -Command "(Get-Item 'storage\storageState.dev-staging.json').LastWriteTime"


```

#### Login Failures
- Check credentials in `users.json`
- Verify environment URLs
- Check network connectivity

#### Test Timeouts
- Increase timeout in config
- Check element selectors
- Verify page load times

### Debug Commands
```bash
# Check configuration
npx playwright show-config

# List installed browsers
npx playwright list-browsers

# Generate test files
npx playwright codegen
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [QASE Documentation](https://help.qase.io/)
- [Project Workflow](./WORKFLOW.md)
- [Project Structure](./STRUCTURE.md)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-tests`
2. Make changes and test locally
3. Commit with meaningful messages
4. Push and create pull request
5. Ensure CI/CD passes

## 📞 Support

For issues and questions:
- Check existing documentation
- Review troubleshooting section
- Create GitHub issue with details
- Include logs and screenshots