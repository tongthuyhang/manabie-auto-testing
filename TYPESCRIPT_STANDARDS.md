# TypeScript Coding Standards

## Naming Conventions

### Files and Directories
```typescript
// PascalCase for classes
LoginPage.ts
EventMasterFacade.ts

// camelCase for utilities and helpers
commonHelpers.ts
storageHelper.ts

// kebab-case for test files
login.spec.ts
event-creation.spec.ts
```

### Variables and Functions
```typescript
// camelCase
const userName = 'testuser';
const isLoggedIn = true;

async function loginUser(credentials: LoginData): Promise<void> {
  // implementation
}
```

### Classes and Interfaces
```typescript
// PascalCase
class LoginPage extends BasePage {
  // implementation
}

interface EventData {
  id: string;
  title: string;
}

// Type aliases
type UserRole = 'admin' | 'teacher' | 'student';
```

### Constants
```typescript
// SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
```

## Code Structure

### Imports Organization
```typescript
// 1. Node modules
import { test, expect, Page } from '@playwright/test';

// 2. Internal modules (absolute paths)
import { LoginPage } from '../pages/LoginPage';
import { EVENT_LOCATORS } from '../locators/eventLocators';

// 3. Types
import type { EventData } from '../type/EventData';
```

### Class Structure
```typescript
export class EventPage extends BasePage {
  // 1. Properties
  private readonly locators = EVENT_LOCATORS;
  
  // 2. Constructor
  constructor(page: Page) {
    super(page);
  }
  
  // 3. Public methods
  async createEvent(eventData: EventData): Promise<void> {
    // implementation
  }
  
  // 4. Private methods
  private async validateEventForm(): Promise<boolean> {
    // implementation
  }
}
```

## Type Safety

### Strict Typing
```typescript
// Use explicit types
const userId: string = '123';
const isActive: boolean = true;

// Avoid 'any' - use specific types
interface ApiResponse {
  data: EventData[];
  status: number;
}

// Use union types for limited options
type Environment = 'dev-staging' | 'pre-prod' | 'production';
```

### Function Signatures
```typescript
// Always specify return types
async function fetchUserData(id: string): Promise<UserData | null> {
  // implementation
}

// Use optional parameters appropriately
function createUser(name: string, email?: string): User {
  // implementation
}
```

## Error Handling

### Try-Catch Blocks
```typescript
async function performAction(): Promise<void> {
  try {
    await this.page.click(this.locators.submitButton);
    await this.page.waitForLoadState('networkidle');
  } catch (error) {
    throw new Error(`Action failed: ${error.message}`);
  }
}
```

### Custom Error Types
```typescript
class ValidationError extends Error {
  constructor(field: string) {
    super(`Validation failed for field: ${field}`);
    this.name = 'ValidationError';
  }
}
```

## Test Standards

### Test Structure
```typescript
test.describe('Event Management', () => {
  test('should create event successfully', async ({ page }) => {
    // Arrange
    const eventPage = new EventPage(page);
    const eventData: EventData = {
      title: 'Test Event',
      date: '2024-01-01'
    };
    
    // Act
    await eventPage.createEvent(eventData);
    
    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Async/Await
```typescript
// Always use async/await for Playwright actions
async function fillForm(data: FormData): Promise<void> {
  await this.page.fill('#title', data.title);
  await this.page.click('#submit');
  await this.page.waitForSelector('.confirmation');
}
```

## Documentation

### JSDoc Comments
```typescript
/**
 * Creates a new event with the provided data
 * @param eventData - The event information
 * @returns Promise that resolves when event is created
 * @throws ValidationError when required fields are missing
 */
async createEvent(eventData: EventData): Promise<void> {
  // implementation
}
```

### Inline Comments
```typescript
// Wait for dynamic content to load
await this.page.waitForLoadState('networkidle');

// Validate form before submission
if (!await this.validateForm()) {
  throw new ValidationError('Form validation failed');
}
```

## Best Practices

### Page Object Methods
```typescript
// Return meaningful values
async isElementVisible(selector: string): Promise<boolean> {
  return await this.page.locator(selector).isVisible();
}

// Chain operations logically
async loginAndNavigate(credentials: LoginData, targetPage: string): Promise<void> {
  await this.login(credentials);
  await this.navigateTo(targetPage);
}
```

### Constants Usage
```typescript
// Group related constants
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000
} as const;

// Use enums for related values
enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}
```

### Utility Functions
```typescript
// Pure functions when possible
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Generic utility functions
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```