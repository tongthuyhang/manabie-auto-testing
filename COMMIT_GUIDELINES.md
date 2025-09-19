# Git Commit Message Guidelines

## 📋 **Format Structure**

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Rules:**
- **Type**: lowercase, required
- **Scope**: lowercase, optional but recommended
- **Description**: lowercase, imperative mood, no period
- **Length**: Subject line ≤ 50 characters
- **Body**: Wrap at 72 characters, explain "what" and "why"

---

## 🏷️ **Commit Types**

<div align="center">

| 🏷️ **Type** | 📝 **Purpose** | 💡 **Example** |
|:------------:|:-----------------------------------------------|:-----------------------------------------------|
| `feat`       | ✨ New feature or functionality               | `feat(tests): add event validation suite`     |
| `fix`        | 🐛 Bug fix or error correction                | `fix(storage): resolve cookie expiration`     |
| `docs`       | 📚 Documentation changes                      | `docs(readme): update installation steps`     |
| `style`      | 🎨 Code formatting, no logic change           | `style(pages): format locator constants`      |
| `refactor`   | ♻️ Code restructuring, no new features        | `refactor(facade): extract common methods`    |
| `test`       | 🧪 Add or modify tests                        | `test(event): add edge case scenarios`        |
| `chore`      | 🔧 Maintenance, dependencies, tools           | `chore(deps): update playwright to v1.40`     |
| `ci`         | 🚀 CI/CD pipeline changes                     | `ci(github): add automated deployment`        |
| `perf`       | ⚡ Performance improvements                   | `perf(storage): optimize validation logic`    |
| `build`      | 📦 Build system or external dependencies      | `build(npm): add new test dependencies`       |
| `revert`     | ⏪ Revert previous commit                     | `revert: feat(tests): add event validation`   |

</div>

---

## 🎯 **Scope Examples**

### **Test Automation Project Scopes:**
- `tests` - Test files and test cases
- `pages` - Page Object Model classes
- `facade` - Facade pattern classes
- `locators` - Element selectors and locators
- `utils` - Utility functions and helpers
- `config` - Configuration files
- `storage` - Authentication storage management
- `setup` - Global setup and teardown
- `data` - Test data and fixtures
- `types` - TypeScript type definitions
- `docs` - Documentation files
- `ci` - CI/CD workflows
- `deps` - Dependencies and packages

---

## ✅ **Good Examples**

### **Features:**
```bash
feat(tests): add event master CRUD test suite
feat(pages): implement auto-refresh storage helper
feat(facade): add event validation with retry logic
feat(locators): add dynamic element selectors
```

### **Bug Fixes:**
```bash
fix(storage): resolve cookie expiration detection
fix(setup): correct import paths after restructure
fix(config): resolve playwright timeout issues
fix(pages): handle dynamic loading elements
```

### **Documentation:**
```bash
docs(readme): add GitHub Pages setup instructions
docs(structure): update project folder organization
docs(workflow): document test execution flow
docs(guidelines): add commit message standards
```

### **Refactoring:**
```bash
refactor(facade): extract common validation logic
refactor(pages): consolidate duplicate methods
refactor(utils): improve error handling consistency
refactor(locators): organize by page components
```

### **CI/CD:**
```bash
ci(github): add artifact upload for test reports
ci(pages): configure automatic report deployment
ci(workflow): add parallel test execution
ci(secrets): update environment variables
```

### **Tests:**
```bash
test(event): add boundary value testing
test(login): add authentication failure scenarios
test(storage): add expiration edge cases
test(validation): add form field requirements
```

### **Maintenance:**
```bash
chore(deps): update playwright to latest version
chore(cleanup): remove unused test files
chore(format): apply consistent code formatting
chore(gitignore): add local environment files
```

---

## ❌ **Bad Examples**

```bash
# Too vague
fix stuff
update files
changes
work in progress

# Too long
feat(tests): add comprehensive event master test suite with validation, error handling, and edge cases for all CRUD operations

# Wrong format
Fix: Storage issue
FEAT: new tests
Update README.md

# No context
fix
update
refactor
test
```

---

## 🔧 **Commit Body Guidelines**

### **When to Include Body:**
- Complex changes requiring explanation
- Breaking changes
- Multiple related changes
- Context for future developers

### **Body Format:**
```
feat(storage): add automatic cookie refresh mechanism

- Implement background refresh for expired cookies
- Add retry logic for failed authentication
- Update storage validation to check cookie expiry
- Ensure seamless test execution without manual intervention

Resolves: #123
```

### **Footer Examples:**
```bash
# Issue references
Fixes: #123
Closes: #456
Resolves: #789

# Breaking changes
BREAKING CHANGE: storage helper API changed from v1 to v2

# Co-authors
Co-authored-by: John Doe <john@example.com>
```

---

## 🚀 **Quick Reference Commands**

### **Common Patterns:**
```bash
# New test feature
git commit -m "feat(tests): add event master validation tests"

# Fix bug
git commit -m "fix(storage): resolve authentication timeout issue"

# Update documentation
git commit -m "docs(readme): add troubleshooting section"

# Refactor code
git commit -m "refactor(pages): simplify event form interactions"

# CI/CD update
git commit -m "ci(github): add screenshot artifact upload"

# Dependency update
git commit -m "chore(deps): update test dependencies"
```

### **Multi-line Commit:**
```bash
git commit -m "feat(storage): add automatic refresh mechanism

Implement background refresh for expired cookies with retry logic.
This ensures tests run smoothly without manual intervention.

Fixes: #123"
```

---

## 📊 **Commit Message Checklist**

Before committing, ask yourself:

- [ ] **Type**: Is the commit type appropriate?
- [ ] **Scope**: Does the scope clearly indicate the area of change?
- [ ] **Description**: Is it clear what was changed?
- [ ] **Length**: Is the subject line under 50 characters?
- [ ] **Imperative**: Does it complete "This commit will..."?
- [ ] **Context**: Would a new team member understand this change?

---

## 🎯 **Project-Specific Examples**

### **Event Master Tests:**
```bash
feat(tests): add event master creation validation
fix(pages): resolve event form submission timeout
test(event): add duplicate name validation scenario
refactor(facade): extract event CRUD operations
```

### **Storage Management:**
```bash
feat(storage): implement auto-refresh for expired cookies
fix(storage): handle missing storage file gracefully
perf(storage): optimize cookie validation performance
docs(storage): document refresh mechanism workflow
```

### **CI/CD Pipeline:**
```bash
ci(github): add parallel test execution
ci(pages): deploy test reports automatically
ci(artifacts): upload screenshots and videos
ci(env): configure environment-specific variables
```

---

## 💡 **Tips for Better Commits**

1. **Commit Often**: Small, focused commits are easier to review
2. **Atomic Changes**: One logical change per commit
3. **Test Before Commit**: Ensure code works before committing
4. **Review Changes**: Use `git diff` to review what you're committing
5. **Meaningful Messages**: Write for your future self and teammates

---

## 🔗 **Related Resources**

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)