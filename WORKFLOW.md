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