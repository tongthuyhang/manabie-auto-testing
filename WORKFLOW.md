# Test Execution Workflow

## Overview
This document describes the step-by-step workflow when executing Playwright tests with storage management and authentication.

## Execution Flow

### 1. Test Initialization
```
📋 Test Runner starts
├── Load playwright.config.ts
├── Set environment (ENV = dev-staging)
├── Load environment config files
└── Check storage state availability
```

### 2. Global Setup Phase
```
🚀 Global Setup (setup/global-setup.ts)
├── 🔍 Check storage expiration
│   ├── File age check (default: 24 hours)
│   ├── Cookie expiration validation
│   └── Storage validity verification
├── Decision Point:
│   ├── ✅ Valid Storage → Skip login, proceed to tests
│   └── 🔄 Expired/Invalid → Continue with login
├── 🌐 Launch browser (headless in CI)
├── 🔐 Execute LoginAction
│   ├── Navigate to login page
│   ├── Fill credentials from config
│   ├── Submit login form
│   └── Wait for Lightning page
├── 💾 Save fresh storage state
└── 🔒 Close browser
```

### 3. Test Execution Phase
```
🧪 Test Suite Execution
├── For each test file:
│   ├── 📂 Load test context with storage
│   ├── 🔄 beforeEach Hook:
│   │   ├── StorageHelper.checkAndRefreshStorage()
│   │   │   ├── Check if storage expired
│   │   │   ├── If expired: Re-authenticate inline
│   │   │   └── Save new storage
│   │   ├── CommonHelpers.navigateToPage()
│   │   └── Initialize page objects (EventMasterFacade)
│   ├── 🎯 Execute test steps:
│   │   ├── Business actions via Facade
│   │   ├── Page interactions via Page Objects
│   │   ├── Assertions and validations
│   │   └── QASE reporting integration
│   └── 🧹 afterEach cleanup
└── 📊 Generate test reports
```

## Test Architecture Workflow

### Layer-by-Layer Execution Flow
```
🏗️ Test Architecture (Bottom-Up)

1️⃣ Test Case Layer (tests/with-storage/scheduling/event/create-event-master.spec.ts)
├── 📝 Test definitions and scenarios
├── 🏷️ QASE metadata and reporting
├── 🔄 Test lifecycle hooks (beforeEach, afterEach)
├── 📊 Test data management
└── 🎯 High-level test assertions
    ↓
2️⃣ Facade Layer (src/facade/EventMasterFacade.ts)
├── 🎭 Business logic orchestration
├── 🔄 Retry mechanisms (@Retry decorator)
├── ⏱️ Performance tracking (@TrackTime decorator)
├── 📝 Step logging (@LogStep decorator)
├── 🔗 Combines multiple page actions
└── 🛡️ Input validation and error handling
    ↓
3️⃣ Page Object Layer (src/pages/EventMasterPage.ts)
├── 🎪 UI interaction methods
├── 🔍 Element finding and waiting
├── 📝 Form filling and data entry
├── ✅ Page-level validations
├── 🧭 Navigation actions
└── 🎨 UI state management
    ↓
4️⃣ Locator Layer (src/locators/eventLocators.ts)
├── 🎯 Element selectors (CSS, XPath, Role-based)
├── 📋 Field labels and identifiers
├── 🗂️ Grid column definitions
├── 🏷️ Centralized selector management
└── 🔧 Maintainable element references
    ↓
5️⃣ Browser Interaction (Playwright Engine)
├── 🌐 Browser automation
├── 🖱️ User actions (click, type, select)
├── ⏳ Smart waiting strategies
├── 📸 Screenshot and video capture
└── 🔍 Element inspection and validation
    ↓
6️⃣ Report & Artifacts
├── 📊 HTML Report (playwright-report/)
├── 📋 JSON Results (test-results.json)
├── 📸 Screenshots (test-results/)
├── 🎬 Videos (test-results/)
└── 🔍 Traces (test-results/)
```

### Detailed Execution Example
```
🎬 Event Master Test Execution Flow

📝 Test: "Create Event Master for 'demo'"
├── 🎭 eventMasterFacade.createAndVerifyEvent(eventData)
│   ├── 🎪 eventPage.clickNewButton()
│   │   ├── 🎯 locator: EventLocators.BUTTON_NEW
│   │   └── 🖱️ page.click(selector)
│   ├── 🎪 eventPage.fillEventMasterForm(...)
│   │   ├── 🎯 locator: EventLocators.INPUT_EVENT_NAME
│   │   ├── 🖱️ page.fill(selector, value)
│   │   ├── 🎯 locator: EventLocators.SELECT_EVENT_TYPE
│   │   └── 🖱️ page.selectOption(selector, value)
│   ├── 🎪 eventPage.clickSaveButton()
│   │   ├── 🎯 locator: EventLocators.BUTTON_SAVE
│   │   └── 🖱️ page.click(selector)
│   └── 🎪 eventPage.verifyEventMasterCreated()
│       ├── 🎯 locator: EventLocators.SUCCESS_MESSAGE
│       └── ✅ expect(element).toBeVisible()
├── 📊 Generate test artifacts
│   ├── 📸 Screenshot on failure
│   ├── 🎬 Video recording
│   └── 🔍 Trace file
└── 📋 Update test results
    ├── ✅ Test status (passed/failed)
    ├── ⏱️ Execution time
    └── 📝 Error details (if any)
```

### Data Flow Architecture
```
📊 Data Flow Through Layers

🗂️ Test Data (eventMasterData.json)
    ↓ (JsonHelper.getItemsByKey)
📝 Test Case (event-master.spec.ts)
    ↓ (EventData interface)
🎭 Facade Layer (EventMasterFacade.ts)
    ↓ (Method parameters)
🎪 Page Object (EventMasterPage.ts)
    ↓ (UI interactions)
🎯 Locators (eventLocators.ts)
    ↓ (Element selectors)
🌐 Browser (Playwright)
    ↓ (DOM manipulation)
📊 Results (Reports & Artifacts)
```

### Error Handling Across Layers
```
🛡️ Error Handling Strategy

📝 Test Layer
├── ❌ Test failure reporting
├── 🔄 Test retry configuration
└── 📊 QASE error reporting

🎭 Facade Layer
├── 🔄 @Retry decorator (automatic retries)
├── 🛡️ Input validation
├── 📝 @LogStep decorator (error context)
└── ⏱️ @TrackTime decorator (performance monitoring)

🎪 Page Object Layer
├── ⏳ Smart waiting strategies
├── 🔍 Element existence checks
├── 🛡️ Graceful error handling
└── 📝 Detailed error messages

🎯 Locator Layer
├── 🎯 Fallback selectors
├── 🔧 Maintainable element references
└── 📋 Centralized selector updates

🌐 Browser Layer
├── 📸 Screenshot on failure
├── 🎬 Video recording
├── 🔍 Trace collection
└── ⏳ Timeout handling
```

## Storage Management Workflow

### Storage Validation Process
```
🔍 Storage Check Flow
├── 1. File Existence Check
│   └── storage/storageState.{env}.json exists?
├── 2. File Age Validation
│   └── Modified within 24 hours?
├── 3. Cookie Expiration Check
│   └── Any cookies expired?
├── 4. Content Validation
│   └── Valid JSON with cookies array?
└── Decision: shouldRefresh() = true/false
```

### Storage Refresh Process
```
🔄 Storage Refresh Flow
├── 1. Detect expiration trigger
├── 2. Launch browser session
├── 3. Execute LoginAction
│   ├── Load user credentials from JSON
│   ├── Navigate to login URL
│   ├── Fill username/password
│   ├── Submit form
│   └── Wait for successful redirect
├── 4. Validate login success
│   ├── Check URL pattern (*/lightning/*)
│   └── Verify header elements
├── 5. Save storage state
│   ├── Extract cookies and localStorage
│   ├── Write to storage file
│   └── Log success message
└── 6. Continue with test execution
```

## Environment Configuration

### Config Loading Order
```
📁 Configuration Loading
├── 1. playwright.config.ts
├── 2. src/config/{ENV}.env (dev-staging.env)
├── 3. src/config/qase.env
├── 4. Process environment variables
└── 5. Default values fallback
```

### Storage Paths
```
📂 Storage Structure
├── storage/
│   ├── storageState.dev-staging.json
│   ├── storageState.pre-prod.json
│   └── storageState.staging.json
└── Path resolution: path.resolve(__dirname, '../../storage')
```

## Test Execution Scenarios

### Scenario 1: Fresh Storage Available
```
✅ Happy Path
├── Global setup checks storage → Valid
├── Skip authentication
├── Tests run with existing storage
└── No additional login required
```

### Scenario 2: Expired Storage
```
🔄 Refresh Path
├── Global setup detects expiration
├── Execute LoginAction
├── Save fresh storage
├── Tests run with new storage
└── Subsequent tests use cached storage
```

### Scenario 3: VS Code Extension
```
🔧 VS Code Compatibility
├── Global setup may be bypassed
├── beforeEach hook handles storage check
├── Inline authentication if needed
├── StorageHelper ensures consistency
└── Tests proceed normally
```

### Scenario 4: CI/CD Pipeline
```
🤖 Automated Execution
├── Headless browser mode
├── No existing storage (fresh environment)
├── Global setup always runs authentication
├── Storage created for test session
└── Artifacts uploaded after completion
```

## Error Handling

### Common Failure Points
```
❌ Potential Issues
├── 1. Network connectivity
├── 2. Invalid credentials
├── 3. Login page changes
├── 4. Storage file corruption
├── 5. Permission issues
└── 6. Timeout during authentication
```

### Recovery Mechanisms
```
🔧 Error Recovery
├── Retry logic in global setup
├── Fallback authentication in beforeEach
├── Storage validation before use
├── Detailed error logging
└── Graceful degradation
```

## Performance Considerations

### Optimization Strategies
```
⚡ Performance Tips
├── Storage reuse across tests
├── Minimal authentication calls
├── Parallel test execution
├── Efficient storage validation
└── Smart expiration timing
```

## Monitoring and Debugging

### Debug Information
```
🔍 Debug Output
├── Storage age and validity
├── Authentication success/failure
├── Navigation timing
├── Cookie expiration details
└── Environment configuration
```

### Log Levels
```
📝 Logging
├── 🚀 Startup messages
├── ✅ Success confirmations
├── ⚠️ Warning notifications
├── ❌ Error details
└── 🔍 Debug information
```