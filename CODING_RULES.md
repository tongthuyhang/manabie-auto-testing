# Coding Rules & Standards

## 📋 Overview
This document defines the coding standards, rules, and best practices for the Manabie Auto Testing Framework.

## 🎯 General Principles

### Code Quality
- **Readability First**: Code should be self-documenting
- **Consistency**: Follow established patterns throughout the project
- **Maintainability**: Write code that's easy to modify and extend
- **Testability**: Ensure code can be easily tested and debugged

### SOLID Principles
- **Single Responsibility**: Each class/method has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for base classes
- **Interface Segregation**: Many specific interfaces are better than one general-purpose interface
- **Dependency Inversion**: Depend on abstractions, not concretions

## 📝 TypeScript Standards

### File Naming
```typescript
// ✅ Correct - PascalCase for classes
EventPage.ts
LoginPage.ts
BasePage.ts
EventFacade.ts

// ✅ Correct - camelCase for utilities
commonHelpers.ts
configHelpers.ts
storageHelper.ts
loginHelper.ts

// ✅ Correct - kebab-case for test files
event-master.spec.ts
login-validation.spec.ts

// ❌ Incorrect
eventPage.ts (for classes)
CommonHelpers.ts (for utilities)
Event_Page.ts
```

### Class Structure
```typescript
// ✅ Correct structure
export class EventPage extends BasePage {
  // 1. Properties (readonly first)
  readonly inputEventName: Locator;
  private eventData: EventData;

  // 2. Constructor
  constructor(page: Page) {
    super(page);
    this.inputEventName = page.locator('#eventName');
  }

  // 3. Public methods
  async fillEventForm(data: EventData): Promise<void> {
    // Implementation
  }

  // 4. Private methods
  private async validateForm(): Promise<boolean> {
    // Implementation
  }
}
```

### Method Naming
```typescript
// ✅ Correct - Descriptive action verbs
async fillEventMasterForm(data: EventData): Promise<void>
async searchEventByName(name: string): Promise<void>
async verifyEventCreated(eventName: string): Promise<void>
async checkMandatoryFieldValidation(): Promise<void>

// ❌ Incorrect - Vague or unclear
async doStuff(): Promise<void>
async handle(): Promise<void>
async process(data: any): Promise<void>
```

### Variable Naming
```typescript
// ✅ Correct - Descriptive names
const eventMasterName = 'Sample Event';
const isFormValid = await this.validateForm();
const maxRetryAttempts = 3;

// ❌ Incorrect - Unclear abbreviations
const emn = 'Sample Event';
const isValid = true;
const max = 3;
```

## 🏗️ Architecture Rules

### Page Object Model
```typescript
// ✅ Correct - Extend BasePage
export class EventPage extends BasePage {
  // Locators as readonly properties
  readonly btnSave: Locator;
  readonly inputEventName: Locator;

  constructor(page: Page) {
    super(page);
    this.btnSave = page.locator('[data-testid="save-button"]');
    this.inputEventName = page.locator('#event-name');
  }

  // Business actions, not technical actions
  async createEvent(eventData: EventData): Promise<void> {
    await this.type(this.inputEventName, eventData.name);
    await this.click(this.btnSave);
  }
}

// ❌ Incorrect - Direct page interactions in tests
test('Create event', async ({ page }) => {
  await page.locator('#event-name').fill('Test Event');
  await page.locator('[data-testid="save-button"]').click();
});
```

### Facade Pattern
```typescript
// ✅ Correct - High-level business operations
export class EventFacade {
  private eventPage: EventPage;

  constructor(page: Page) {
    this.eventPage = new EventPage(page);
  }

  async createAndVerifyEvent(eventData: EventData): Promise<void> {
    await this.eventPage.clickNewButton();
    await this.eventPage.fillEventForm(eventData);
    await this.eventPage.clickSaveButton();
    await this.eventPage.verifyEventCreated(eventData.name);
  }
}
```

### Locator Organization
```typescript
// ✅ Correct - Organized by page/component
export const EventLocators = {
  // Form elements
  INPUT_EVENT_NAME: '[data-testid="event-name"]',
  INPUT_DESCRIPTION: '[data-testid="event-description"]',
  SELECT_EVENT_TYPE: '[data-testid="event-type"]',
  
  // Buttons
  BUTTON_SAVE: '[data-testid="save-button"]',
  BUTTON_CANCEL: '[data-testid="cancel-button"]',
  
  // Validation messages
  ERROR_REQUIRED_FIELD: '.field-error',
  SUCCESS_MESSAGE: '.success-toast'
} as const;

// ❌ Incorrect - Mixed locators
export const Locators = {
  EVENT_NAME: '#name',
  LOGIN_BUTTON: '.login-btn',
  MENU_ITEM: 'li.menu'
};
```

## 🧪 Test Writing Rules

### Test Structure
```typescript
// ✅ Correct - Clear test structure
test.describe('Event Management', () => {
  let eventFacade: EventFacade;

  test.beforeEach(async ({ page }) => {
    await StorageRefreshHelper.checkAndRefreshStorage(page);
    await CommonHelpers.navigateToPage(page, CommonConstants.PAGE_EVENT_MASTER);
    eventFacade = new EventFacade(page);
  });

  test('Should create event successfully', { tag: '@Smoke' }, async () => {
    // Arrange
    const eventData = TestDataHelper.getEventData('valid-event');
    
    // Act
    await eventFacade.createAndVerifyEvent(eventData);
    
    // Assert
    await eventFacade.verifyEventInList(eventData.name);
  });
});
```

### Test Naming
```typescript
// ✅ Correct - Descriptive test names
test('Should create event with valid data successfully')
test('Should display validation error when required fields are empty')
test('Should update event details when form is submitted')

// ❌ Incorrect - Vague test names
test('Create event')
test('Test validation')
test('Update test')
```

### Assertions
```typescript
// ✅ Correct - Specific assertions with meaningful messages
await expect(page.locator('.success-message'))
  .toBeVisible({ timeout: 5000 });

await expect(page.locator('.event-name'))
  .toHaveText(expectedEventName);

// ✅ Correct - Custom assertion messages
await expect(errorMessage).toContainText(
  'Event name is required',
  'Should display required field validation'
);

// ❌ Incorrect - Generic assertions
await expect(element).toBeVisible();
await expect(text).toBeTruthy();
```

## 📊 Data Management Rules

### Test Data
```typescript
// ✅ Correct - Structured test data
export interface EventData {
  eventMasterName: string;
  eventType: string;
  sendTo: string;
  reminder?: number;
  maxEventPerStudent?: number;
}

// ✅ Correct - Data files organization
src/data/
├── eventMasterData.json
├── userTestData.json
└── validationMessages.json

// ✅ Correct - File structure follows naming rules
src/pages/EventPage.ts        // PascalCase for classes
src/utils/commonHelpers.ts    // camelCase for utilities
src/facade/EventFacade.ts     // PascalCase for classes

// ✅ Correct - Data helper usage
const eventData = JsonHelper.getItemsByKey(
  testData,
  ['valid-event'],
  'eventMasterName'
);
```

### Environment Configuration
```typescript
// ✅ Correct - Environment-specific configs
src/config/
├── dev-staging.env
├── pre-prod.env
├── staging.env
└── qase.env

// ✅ Correct - Config loading
await loadConfig(process.env.ENV || 'dev-staging');
```

## 🔧 Error Handling Rules

### Exception Handling
```typescript
// ✅ Correct - Specific error handling
async fillEventForm(data: EventData): Promise<void> {
  try {
    await this.type(this.inputEventName, data.eventMasterName);
    await this.selectFromDropdown(this.selectEventType, data.eventType);
  } catch (error) {
    console.error(`Failed to fill event form: ${error.message}`);
    throw new Error(`Event form filling failed: ${error.message}`);
  }
}

// ❌ Incorrect - Silent failures
async fillEventForm(data: EventData): Promise<void> {
  try {
    // ... operations
  } catch (error) {
    // Silent failure - bad practice
  }
}
```

### Validation
```typescript
// ✅ Correct - Input validation
async fillEventForm(data: EventData): Promise<void> {
  if (!data.eventMasterName?.trim()) {
    throw new Error('Event name is required');
  }
  if (!data.eventType?.trim()) {
    throw new Error('Event type is required');
  }
  
  // Proceed with form filling
}
```

## 🎨 Code Formatting Rules

### Indentation & Spacing
```typescript
// ✅ Correct - 2 spaces indentation
export class EventPage extends BasePage {
  constructor(page: Page) {
    super(page);
    this.inputEventName = page.locator('#event-name');
  }

  async fillForm(data: EventData): Promise<void> {
    await this.type(this.inputEventName, data.name);
  }
}
```

### Import Organization
```typescript
// ✅ Correct - Import order
// 1. Node modules
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

// 2. Internal modules (alphabetical)
import { CommonConstants } from '@src/constants/commonConstants';
import { CommonHelpers } from '@src/utils/commonHelpers';
import { EventFacade } from '@src/facade/EventFacade';
import { StorageRefreshHelper } from '@src/utils/storageRefreshHelper';

// 3. Test data
import testData from '@src/data/eventMasterData.json';
```

### Method Length
```typescript
// ✅ Correct - Focused methods
async createEvent(data: EventData): Promise<void> {
  await this.fillBasicInfo(data);
  await this.setEventOptions(data);
  await this.saveEvent();
}

private async fillBasicInfo(data: EventData): Promise<void> {
  await this.type(this.inputEventName, data.name);
  await this.type(this.inputDescription, data.description);
}

// ❌ Incorrect - Too long method
async createEventWithEverything(data: EventData): Promise<void> {
  // 50+ lines of code doing multiple things
}
```

## 🔒 Security Rules

### Sensitive Data
```typescript
// ✅ Correct - Use environment variables
const username = process.env.SF_USERNAME;
const password = process.env.SF_PASSWORD;

// ❌ Incorrect - Hardcoded credentials
const username = 'admin@company.com';
const password = 'password123';
```

### Storage Management
```typescript
// ✅ Correct - Secure storage handling
if (StorageHelper.shouldRefresh(env)) {
  await this.refreshAuthentication();
}

// ✅ Correct - Don't commit sensitive storage
// Add to .gitignore:
storage/*.json
*.env
```

## 📋 Documentation Rules

### Code Comments
```typescript
// ✅ Correct - Explain WHY, not WHAT
/**
 * Validates form data before submission to prevent server errors
 * and improve user experience by catching issues early
 */
private async validateForm(data: EventData): Promise<boolean> {
  // Check required fields first to fail fast
  if (!data.eventMasterName?.trim()) {
    return false;
  }
  
  return true;
}

// ❌ Incorrect - Obvious comments
// Fill the event name field
await this.type(this.inputEventName, data.name);
```

### Method Documentation
```typescript
/**
 * Creates a new event master with the provided data
 * @param data - Event data containing name, type, and other details
 * @throws Error when required fields are missing
 * @returns Promise that resolves when event is created successfully
 */
async createEventMaster(data: EventData): Promise<void> {
  // Implementation
}
```

## 🚫 Anti-Patterns to Avoid

### Don't Use
```typescript
// ❌ Magic numbers
await page.waitForTimeout(5000);

// ❌ Hardcoded selectors in tests
await page.locator('#submit-btn').click();

// ❌ Any type
function processData(data: any): any {
  return data;
}

// ❌ Nested callbacks
page.locator('.item').then(element => {
  element.click().then(() => {
    // More nesting
  });
});
```

### Use Instead
```typescript
// ✅ Named constants
const DEFAULT_TIMEOUT = 5000;
await page.waitForTimeout(DEFAULT_TIMEOUT);

// ✅ Locator constants
await page.locator(EventLocators.BUTTON_SUBMIT).click();

// ✅ Proper typing
function processEventData(data: EventData): ProcessedEvent {
  return transformData(data);
}

// ✅ Async/await
const element = await page.locator('.item');
await element.click();
```

## ✅ Code Review Checklist

### Before Submitting PR
- [ ] All tests pass locally
- [ ] Code follows naming conventions
- [ ] No hardcoded values or credentials
- [ ] Proper error handling implemented
- [ ] Documentation updated if needed
- [ ] No console.log statements left in code
- [ ] TypeScript strict mode compliance
- [ ] Meaningful commit messages

### Review Criteria
- [ ] Code readability and maintainability
- [ ] Proper use of design patterns
- [ ] Test coverage and quality
- [ ] Performance considerations
- [ ] Security best practices
- [ ] Documentation completeness

## 🔄 Continuous Improvement

### Regular Reviews
- Monthly code review sessions
- Architecture decision documentation
- Performance monitoring and optimization
- Security audit and updates
- Dependency updates and maintenance

### Learning Resources
- TypeScript best practices
- Playwright documentation updates
- Testing strategy improvements
- CI/CD optimization techniques