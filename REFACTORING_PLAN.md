# Refactoring Plan - Apply Coding Rules

## 🎯 Overview
This document outlines the step-by-step plan to refactor the existing codebase to comply with the coding rules and standards.

## 📋 Priority Levels

### 🔴 High Priority (Critical Issues)
1. **Security Issues**
   - Remove hardcoded credentials
   - Fix sensitive data exposure
   - Update .gitignore for security

2. **Type Safety**
   - Replace `any` types with proper interfaces
   - Add missing type definitions
   - Fix TypeScript strict mode violations

3. **Architecture Violations**
   - Move direct page interactions to Page Objects
   - Implement missing Facade patterns
   - Fix circular dependencies

### 🟡 Medium Priority (Code Quality)
1. **Naming Conventions**
   - Standardize file naming
   - Update method and variable names
   - Organize import statements

2. **Error Handling**
   - Add proper try-catch blocks
   - Implement meaningful error messages
   - Add input validation

3. **Documentation**
   - Add JSDoc comments
   - Update method documentation
   - Fix inline comments

### 🟢 Low Priority (Style & Consistency)
1. **Code Formatting**
   - Standardize indentation
   - Organize imports
   - Remove unused code

2. **Test Structure**
   - Improve test descriptions
   - Add proper test organization
   - Enhance assertions

## 🔧 Refactoring Steps

### Phase 1: Security & Type Safety (Week 1)

#### Files to Update:
```
src/utils/LoginHelper.ts
src/utils/ConfigHelpers.ts
src/data/users.json
.gitignore
```

#### Actions:
1. **Remove hardcoded credentials**
   ```typescript
   // Before
   const username = 'admin@company.com';
   
   // After
   const username = process.env.SF_USERNAME || '';
   ```

2. **Add proper type definitions**
   ```typescript
   // Before
   function processData(data: any): any
   
   // After
   function processEventData(data: EventData): ProcessedEvent
   ```

3. **Update .gitignore**
   ```
   # Add sensitive files
   *.env
   src/data/users.json
   storage/*.json
   ```

### Phase 2: Architecture Improvements (Week 2)

#### Files to Update:
```
src/pages/eventPage.ts
src/facade/EventMasterFacade.ts
src/base/BasePage.ts
tests/with-storage/event/event.spec.ts
```

#### Actions:
1. **Standardize Page Object structure**
   ```typescript
   export class EventPage extends BasePage {
     // 1. Readonly locators
     readonly inputEventName: Locator;
     readonly buttonSave: Locator;
     
     // 2. Constructor
     constructor(page: Page) {
       super(page);
       this.inputEventName = page.locator(EventLocators.INPUT_EVENT_NAME);
       this.buttonSave = page.locator(EventLocators.BUTTON_SAVE);
     }
     
     // 3. Public methods
     async fillEventMasterForm(data: EventData): Promise<void> {
       await this.validateInputData(data);
       await this.type(this.inputEventName, data.eventMasterName);
       await this.click(this.buttonSave);
     }
     
     // 4. Private methods
     private async validateInputData(data: EventData): Promise<void> {
       if (!data.eventMasterName?.trim()) {
         throw new Error('Event name is required');
       }
     }
   }
   ```

2. **Improve Facade pattern**
   ```typescript
   export class EventMasterFacade {
     private eventPage: EventPage;
     
     constructor(page: Page) {
       this.eventPage = new EventPage(page);
     }
     
     /**
      * Creates and verifies a new event master
      * @param data Event data containing required fields
      * @throws Error when validation fails
      */
     async createAndVerifyEvent(data: EventData): Promise<void> {
       try {
         await this.eventPage.clickNewButton();
         await this.eventPage.fillEventMasterForm(data);
         await this.eventPage.clickSaveButton();
         await this.eventPage.verifyEventCreated(data.eventMasterName);
       } catch (error) {
         console.error(`Failed to create event: ${error.message}`);
         throw error;
       }
     }
   }
   ```

### Phase 3: Code Quality & Standards (Week 3)

#### Files to Update:
```
src/locators/eventLocators.ts
src/utils/CommonHelpers.ts
src/utils/storageHelper.ts
```

#### Actions:
1. **Standardize locator organization**
   ```typescript
   export const EventLocators = {
     // Form inputs
     INPUT_EVENT_NAME: '[data-testid="event-master-name"]',
     INPUT_DESCRIPTION: '[data-testid="event-description"]',
     SELECT_EVENT_TYPE: '[data-testid="event-type-select"]',
     
     // Action buttons
     BUTTON_NEW: 'button[name="New"]',
     BUTTON_SAVE: 'button[name="Save"]',
     BUTTON_CANCEL: 'button[name="Cancel"]',
     
     // Validation messages
     ERROR_REQUIRED_FIELD: '.slds-form-element__help',
     SUCCESS_TOAST: '.slds-notify--toast.slds-theme--success'
   } as const;
   ```

2. **Improve method naming and documentation**
   ```typescript
   /**
    * Navigates to the specified page and waits for it to load
    * @param page Playwright page instance
    * @param pageUrl Target page URL or constant
    * @throws Error when navigation fails
    */
   async navigateToPage(page: Page, pageUrl: string): Promise<void> {
     try {
       await page.goto(pageUrl);
       await page.waitForLoadState('networkidle');
       console.log(`✅ Successfully navigated to: ${pageUrl}`);
     } catch (error) {
       console.error(`❌ Navigation failed: ${error.message}`);
       throw new Error(`Failed to navigate to ${pageUrl}: ${error.message}`);
     }
   }
   ```

### Phase 4: Test Improvements (Week 4)

#### Files to Update:
```
tests/with-storage/event/event.spec.ts
tests/no-storage/permission/login.spec.ts
```

#### Actions:
1. **Improve test structure and naming**
   ```typescript
   test.describe('Event Master Management', () => {
     let EventMasterFacade: EventMasterFacade;
     
     test.beforeEach(async ({ page }) => {
       await StorageRefreshHelper.checkAndRefreshStorage(page);
       await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
       EventMasterFacade = new EventMasterFacade(page);
     });
     
     test('Should create event master with valid data successfully', { 
       tag: '@Smoke' 
     }, async () => {
       // Arrange
       const eventData = JsonHelper.getTestData('valid-event-data');
       
       // Act
       await EventMasterFacade.createAndVerifyEvent(eventData);
       
       // Assert
       await EventMasterFacade.verifyEventInList(eventData.eventMasterName);
     });
     
     test('Should display validation errors when required fields are empty', { 
       tag: '@Validation' 
     }, async () => {
       // Arrange - No data provided
       
       // Act
       await EventMasterFacade.attemptToCreateEmptyEvent();
       
       // Assert
       await EventMasterFacade.verifyValidationErrors([
         'Event Master Name',
         'Event Type',
         'Send To'
       ]);
     });
   });
   ```

## 🛠️ Implementation Tools

### Automated Refactoring
```bash
# Install refactoring tools
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier

# Run automated fixes
npx eslint src/ --fix
npx prettier --write "src/**/*.ts"
```

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## 📊 Progress Tracking

### Checklist Template
```markdown
## Phase 1: Security & Type Safety
- [ ] Remove hardcoded credentials from LoginHelper.ts
- [ ] Add proper types to ConfigHelpers.ts
- [ ] Update .gitignore for security
- [ ] Replace `any` types with proper interfaces
- [ ] Add input validation to critical methods

## Phase 2: Architecture Improvements
- [ ] Refactor EventPage.ts structure
- [ ] Improve EventMasterFacade.ts error handling
- [ ] Update BasePage.ts with proper documentation
- [ ] Move direct page interactions from tests

## Phase 3: Code Quality & Standards
- [ ] Organize EventLocators.ts
- [ ] Improve CommonHelpers.ts method naming
- [ ] Add JSDoc comments to public methods
- [ ] Standardize import organization

## Phase 4: Test Improvements
- [ ] Update test descriptions and structure
- [ ] Add proper test data management
- [ ] Improve assertion messages
- [ ] Add test tags and organization
```

## 🔄 Continuous Integration

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### GitHub Actions Quality Check
```yaml
# .github/workflows/code-quality.yml
name: Code Quality Check
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
      - name: Install dependencies
        run: npm ci
      - name: Run ESLint
        run: npx eslint src/ --max-warnings 0
      - name: Run Prettier check
        run: npx prettier --check "src/**/*.ts"
      - name: Run TypeScript check
        run: npx tsc --noEmit
```

## 📈 Success Metrics

### Code Quality Metrics
- **Type Safety**: 0 `any` types in production code
- **Test Coverage**: >80% code coverage
- **ESLint Violations**: 0 errors, <10 warnings
- **Documentation**: 100% public methods documented

### Performance Metrics
- **Build Time**: <2 minutes
- **Test Execution**: <5 minutes for full suite
- **CI/CD Pipeline**: <10 minutes total

This refactoring plan provides a structured approach to gradually improve the codebase while maintaining functionality and avoiding breaking changes.