# Project Structure

## Overview
Playwright TypeScript automation testing framework with Page Object Model pattern and QASE integration.

## 🗂️ Icon Legend

| Icon | Meaning               |
|------|-----------------------|
| 📁   | Folder / Directory    |
| ⚙️    | Configuration / Setup |
| 🌍    | Global / Environment  |
| 🔑    | Parameter / Key       |
| ✅    | Check / Validation    |
| 🧪    | Test / QA             |
| 📊    | Quality / Report      |
| 📝    | Documentation         |
| 🛠️    | Utility / Helper      |
| 🚀    | Pipeline / CI/CD      |
| 🗄️    | Storage / Data        |
| 🪵    | Logs / Debugging      |


## Directory Structure

```
manabie-auto-testing/
├── .github/                      # GitHub Actions workflows
│   └── workflows/
│       └── playwright.yml        # CI/CD pipeline
├── setup/                        # ⚙️ Global setup configuration
│   ├── global-setup.ts           # 🌍 Global test setup
│   └── global-teardown.ts        # 🌍 Global test teardown
├── src/                          # Source code
│   ├── base/                     # Base classes
│   │   └── BasePage.ts           # Base page class
│   ├── config/                   # Environment configurations
│   │   ├── dev-staging.env       # Dev-staging environment
│   │   ├── pre-prod.env          # Pre-production settings
│   │   └── qase.env              # QASE integration config
│   ├── constants/                # Application constants
│   │   ├── commonConstants.ts    # Common constants
│   │   └── userConstants.ts      # User-related constants
│   ├── data/                     # Test data files
│   │   ├── eventMasterData.json  # Event test data
│   │   └── users.json            # User test data
│   ├── decorators/               # Custom decorators
│   │   └── logStep.ts            # Step logging decorator
│   ├── Facade/                   # Facade pattern classes
│   │   └── EventMasterFacade.ts        # Event operations facade
│   ├── locators/                 # Element locators
│   │   ├── eventLocators.ts      # Event page locators
│   │   ├── lessonLocators.ts     # Lesson page locators
│   │   ├── loginLocators.ts      # Login page locators
│   │   └── siteLocators.ts       # Site-wide locators
│   ├── pages/                    # Page Object Model
│   │   ├── eventPage.ts          # Event page class
│   │   └── LoginPage.ts          # Login page class
│   ├── type/                     # TypeScript type definitions
│   │   └── EventData.ts          # Event data types
│   └── utils/                    # Utility classes
│       ├── CommonHelpers.ts      # Common helper functions
│       ├── ConfigHelpers.ts      # Configuration helpers
│       ├── JsonHelper.ts         # JSON manipulation
│       ├── LoginHelper.ts        # Login utilities
│       ├── storageHelper.ts      # Storage management
│       └── TestInfoHelper.ts     # Test information utilities
├── tests/                        # Test files
│   ├── no-storage/               # Tests without authentication
│   │   └── permission/
│   │       └── login.spec.ts     # Login tests
│   └── with-storage/             # Tests with authentication
│       └── event/
│           └── event.spec.ts     # Event tests
├── storage/                      # Authentication storage
│   ├── storageState.dev-staging.json # Dev-staging auth state
│   ├── storageState.pre-prod.json    # Pre-prod auth state
│   └── storageState.staging.json     # Staging auth state
├── scripts/                      # Utility scripts
│   └── refresh-storage.ts        # Storage refresh script
├── logs/                         # Application logs
│   └── log.txt                   # Log file
├── playwright-report/            # Test reports
├── test-results/                 # Test execution results
├── .gitignore                    # Git ignore rules
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies and scripts
├── README.md                     # Project documentation
├── STRUCTURE.md                  # This file
├── TYPESCRIPT_STANDARDS.md       # TypeScript coding standards
├── test-logs.json                # Test execution logs
├── test-results.json             # Test results summary
└── tsconfig.json                 # TypeScript configuration
```

## Key Components

### Page Object Model
- **BasePage.ts**: Common page functionality
- **pages/**: Specific page implementations
- **locators/**: Element selectors organized by page

### Test Organization
- **no-storage/**: Tests requiring fresh authentication
- **with-storage/**: Tests using pre-authenticated state

### Configuration
- Environment-specific configs in `src/config/`
- Playwright settings in `playwright.config.ts`

### Utilities
- **storageHelper.ts**: Authentication state management
- **CommonHelpers.ts**: Shared test utilities
- **ConfigHelpers.ts**: Configuration management
- **JsonHelper.ts**: JSON data manipulation
- **LoginHelper.ts**: Login-specific utilities

## Git Commands

### Basic Operations
```bash
# Check status
git status

# Pull latest changes
git pull origin main

# Add changes
git add .
git add <specific-file>

# Commit changes
git commit -m "feat: add new test cases"
git commit -m "fix: resolve login issue"
git commit -m "refactor: update page objects"

# Push changes
git push origin main
git push origin <branch-name>
```

### Branch Management
```bash
# Create and switch to new branch
git checkout -b feature/new-tests

# Switch branches
git checkout main
git checkout <branch-name>

# Merge branch
git checkout main
git merge feature/new-tests

# Delete branch
git branch -d feature/new-tests
```

### Common Workflows
```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/event-tests

# Save work
git add .
git commit -m "feat: implement event test cases"
git push origin feature/event-tests

# Update from main
git checkout main
git pull origin main
git checkout feature/event-tests
git merge main
```