# QASE Integration Workflow

## Overview
This document describes the QASE TestOps integration workflow, configuration, and usage within the Playwright test automation framework.

## 🏗️ QASE Configuration Architecture

### Configuration Files Structure
```
📁 QASE Configuration
├── src/config/qase.env           # QASE environment variables
├── playwright.config.ts          # Conditional QASE reporter setup
└── package.json                  # QASE-enabled test scripts
```

### Environment Variables Setup
```bash
# src/config/qase.env
QASE_TESTOPS_API_TOKEN=your_api_token_here
QASE_TESTOPS_PROJECT=PX
QASE_TESTOPS_API_HOST=api.qase.io
QASE_MODE=testops
QASE_ENVIRONMENT=dev-staging
QASE_CAPTURE_LOGS=true
QASE_DEBUG=true
```

## 🔧 Playwright Configuration Integration

### Conditional QASE Reporter Loading
```typescript
// playwright.config.ts
reporter: process.env.QASE_MODE ? [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results.json'}],
  [
    'playwright-qase-reporter',
    {
      mode: process.env.QASE_MODE || 'testops',
      fallback: process.env.QASE_FALLBACK || 'report',
      environment: process.env.QASE_ENVIRONMENT || ENV,
      debug: true,
      captureLogs: process.env.QASE_CAPTURE_LOGS === 'true',
      testops: {
        api: {
          token: process.env.QASE_TESTOPS_API_TOKEN!,
          host: process.env.QASE_TESTOPS_API_HOST || 'api.qase.io',
        },
        project: process.env.QASE_TESTOPS_PROJECT!,
        run: {
          complete: process.env.QASE_TESTOPS_RUN_COMPLETE !== 'false',
          title: `Automated Playwright Run - ${ENV} - ${now}`,
          description: 'Playwright automated run',
        },
        framework: {
          browser: {
            addAsParameter: true,
            parameterName: 'Chrome 138.0.7204.50',
          },
        },
        uploadAttachments: true,
      },
    },
  ]
] : [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results.json'}],
];
```

## 📋 Test Scripts Configuration

### Package.json Scripts
```json
{
  "scripts": {
    // Without QASE Integration
    "test:dev-staging:report": "cross-env ENV=dev-staging npx playwright test --project=with-storage",
    "test:dev-staging:with-storage": "cross-env ENV=dev-staging npx playwright test --project=with-storage",
    
    // With QASE Integration
    "test:dev-staging:qase": "cross-env ENV=dev-staging QASE_MODE=testops QASE_TESTOPS_API_HOST=qase.io QASE_CAPTURE_LOGS=false npx playwright test --project=with-storage",
    "test:dev-staging:local": "cross-env ENV=dev-staging QASE_MODE=testops QASE_TESTOPS_API_HOST=qase.io QASE_CAPTURE_LOGS=true npx playwright test --project=with-storage"
  }
}
```

## 🎯 QASE Test Case Integration

### Test Case Metadata Structure
```typescript
// tests/with-storage/scheduling/event/create-event-master.spec.ts
test(`Create Event Master for "${event.eventMasterName}"`, { tag: "@Regression" }, async ({ page }) => {
  //=== QASE Metadata ===
  qase.id(661);                                    // 🆔 QASE Test Case ID
  qase.title(`Create Event Master for ${event.eventMasterName}`);  // 📝 Test Title
  qase.parameters({ inputData: JSON.stringify(event) });           // 🔧 Test Parameters
  qase.fields({
    description: 'Verify that a new Event Master can be created successfully',     // 📄 Description
    preconditions: 'User is logged in and on Event Master page',                  // ✅ Preconditions
  });
  qase.comment('The Event Master should be created successfully');  // 💬 Expected Result

  // === Test Steps ===
  await test.step(`Create new Event Master with name "${event.eventMasterName}"`, async () => {
    await eventMasterFacade.createAndVerifyEvent(event);
  });
});
```

## 🔄 QASE Workflow Execution

### Test Execution Flow with QASE
```
🎭 QASE Integration Workflow

1️⃣ Test Initialization
├── 🔍 Check QASE_MODE environment variable
├── 📋 Load QASE configuration (qase.env)
├── 🔧 Initialize QASE reporter (if enabled)
└── 🌐 Connect to QASE TestOps API

2️⃣ Test Run Creation
├── 📊 Create new test run in QASE
├── 🏷️ Set run title with timestamp
├── 📝 Add run description
├── 🌍 Set environment (dev-staging/pre-prod)
└── 🔗 Link to test plan (if specified)

3️⃣ Test Case Execution
├── 🆔 Map test to QASE case ID (qase.id())
├── 📝 Set test title (qase.title())
├── 🔧 Add parameters (qase.parameters())
├── 📄 Set description & preconditions (qase.fields())
├── 💬 Add expected result (qase.comment())
├── ▶️ Execute test steps
├── 📸 Capture screenshots on failure
├── 🎬 Record video (if enabled)
└── 📊 Report result to QASE

4️⃣ Result Reporting
├── ✅ Pass/Fail status
├── ⏱️ Execution time
├── 📎 Attachments (screenshots, videos, traces)
├── 📝 Error messages (if failed)
├── 🔍 Stack traces (if failed)
└── 📊 Test metrics

5️⃣ Run Completion
├── 📋 Finalize test run
├── 📊 Generate run summary
├── 📧 Send notifications (if configured)
└── 🔗 Provide run URL
```

## 🎯 QASE Metadata Usage Patterns

### Basic Test Case Mapping
```typescript
test('Simple test case', async ({ page }) => {
  qase.id(123);
  qase.title('Verify login functionality');
  
  // Test implementation
});
```

### Advanced Metadata with Parameters
```typescript
test('Parameterized test case', async ({ page }) => {
  qase.id(456);
  qase.title('Create event with dynamic data');
  qase.parameters({ 
    eventName: event.eventMasterName,
    eventType: event.eventType,
    environment: 'dev-staging'
  });
  qase.fields({
    description: 'Comprehensive event creation test',
    preconditions: 'User authenticated and on event page',
    severity: 'high',
    priority: 'critical'
  });
  qase.comment('Event should be created and visible in list');
  
  // Test implementation with steps
  await test.step('Navigate to event page', async () => {
    // Step implementation
  });
});
```

### Test Steps Integration
```typescript
test('Multi-step test case', async ({ page }) => {
  qase.id(789);
  
  await test.step('Step 1: Login', async () => {
    // Login implementation
  });
  
  await test.step('Step 2: Create Event', async () => {
    // Event creation implementation
  });
  
  await test.step('Step 3: Verify Event', async () => {
    // Verification implementation
  });
});
```

## 🚀 Execution Modes

### Local Development Mode
```bash
# Run with QASE integration and detailed logging
set QASE_TESTOPS_API_TOKEN=your_actual_token_here && npm run test:dev-staging:local

# Environment variables set:
# QASE_MODE=testops
# QASE_MODE=testops
# QASE_CAPTURE_LOGS=true
# QASE_DEBUG=true
# QASE_TESTOPS_API_TOKEN=your_actual_token_here
```

### CI/CD Pipeline Mode
```bash
# Run with QASE integration for automated reporting
npm run test:dev-staging:qase

# Environment variables set:
# QASE_MODE=testops
# QASE_CAPTURE_LOGS=false
# QASE_TESTOPS_API_TOKEN=${{ secrets.QASE_TOKEN }}
```

### Report-Only Mode (No QASE)
```bash
# Run without QASE integration
npm run test:dev-staging:report

# No QASE environment variables set
# Only generates local HTML/JSON reports
```

## 📊 QASE Dashboard Integration

### Test Run Information
```
📋 QASE Test Run Details
├── 🏷️ Run Title: "Automated Playwright Run - dev-staging - 2024-01-15 10:30:00"
├── 📝 Description: "Playwright automated run"
├── 🌍 Environment: "dev-staging"
├── 🖥️ Browser: "Chrome 138.0.7204.50"
├── ⏱️ Duration: "5m 32s"
├── 📊 Results: "15 passed, 2 failed, 0 skipped"
└── 📎 Attachments: "Screenshots, Videos, Traces"
```

### Test Case Results
```
📋 Individual Test Case Results
├── 🆔 Case ID: 661
├── 📝 Title: "Create Event Master for demo"
├── ✅ Status: "Passed"
├── ⏱️ Duration: "12.5s"
├── 🔧 Parameters: {"inputData": "{eventMasterName: 'demo'}"}
├── 📄 Steps: "3 steps executed"
├── 📎 Attachments: "2 screenshots, 1 video"
└── 💬 Comment: "Event created successfully"
```

## 🔧 Configuration Management

### Environment-Specific Settings
```bash
# Development Environment
QASE_ENVIRONMENT=dev-staging
QASE_DEBUG=true
QASE_CAPTURE_LOGS=true

# Staging Environment  
QASE_ENVIRONMENT=staging
QASE_DEBUG=false
QASE_CAPTURE_LOGS=false

# Production Environment
QASE_ENVIRONMENT=production
QASE_DEBUG=false
QASE_CAPTURE_LOGS=false
```

### API Token Management
```bash
# Local Development (.env file)
QASE_TESTOPS_API_TOKEN=your_local_token

# CI/CD Pipeline (GitHub Secrets)
QASE_TESTOPS_API_TOKEN=${{ secrets.QASE_TESTOPS_API_TOKEN }}

# Environment Variables (Server)
export QASE_TESTOPS_API_TOKEN="your_server_token"
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### QASE Reporter Not Loading
```bash
# Check if QASE_MODE is set
echo $QASE_MODE

# Verify QASE configuration
npm run test:dev-staging:qase -- --reporter=list
```

#### API Token Issues
```bash
# Verify token format
echo $QASE_TESTOPS_API_TOKEN | head -c 10

# Test API connection
curl -H "Token: $QASE_TESTOPS_API_TOKEN" https://api.qase.io/v1/project
```

#### Test Case Mapping Issues
```typescript
// Ensure QASE ID exists in project
qase.id(661); // Verify this ID exists in QASE project

// Check test case status
// Ensure test case is not archived or deleted
```

## 📈 Best Practices

### QASE Integration Guidelines
1. **Always use unique QASE IDs** for each test case
2. **Provide meaningful titles** that match QASE test case names
3. **Include relevant parameters** for data-driven tests
4. **Use descriptive comments** for expected results
5. **Organize tests with proper tags** (@Regression, @Smoke, etc.)
6. **Keep QASE metadata up-to-date** with test changes

### Performance Optimization
1. **Use QASE_CAPTURE_LOGS=false** in CI/CD for faster execution
2. **Batch test runs** to reduce API calls
3. **Use appropriate timeouts** for QASE API calls
4. **Monitor QASE API rate limits**

### Security Considerations
1. **Store API tokens securely** (GitHub Secrets, environment variables)
2. **Use different tokens** for different environments
3. **Rotate tokens regularly**
4. **Limit token permissions** to minimum required scope

## 🔗 Integration Points

### GitHub Actions Integration
```yaml
# .github/workflows/playwright.yml
- name: Run Playwright Tests (Dev-Staging with Qase)
  run: npm run test:dev-staging:qase
  env:
    ENV: dev-staging
    USER_TYPE: admin
    QASE_TESTOPS_API_TOKEN: ${{ secrets.QASE_TESTOPS_API_TOKEN }}
```

### Local Development Integration
```bash
# Set up local QASE token
echo "QASE_TESTOPS_API_TOKEN=your_token" >> .env

# Run tests with QASE
npm run test:dev-staging:qase
```

This QASE workflow ensures comprehensive test management and reporting integration with your Playwright automation framework.