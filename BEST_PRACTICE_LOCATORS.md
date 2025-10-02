# Best Practice: Locator Strategy in Playwright

Locators define how Playwright finds elements on a page.  
Choosing the right locator is critical for **stability**, **maintainability**, and **readability**.

---

## 🥇 Highest Priority (Recommended)

### 1. `getByRole` + Accessible Name
- Most reliable: based on the Accessibility tree.
- Simulates how real users interact with UI.
- Examples:
  ```ts
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('john_doe');
  ```

### 2. `getByLabel` / `getByPlaceholder`
- Best for form fields and inputs with clear labels or placeholders.
- Examples:
  ```ts
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByPlaceholder('Search').fill('Playwright');
  ```

### 3. `getByText` / `getByAltText`
- Works well when visible text or image alt text is stable.
- Examples:
  ```ts
  await page.getByText('Welcome back').isVisible();
  await page.getByAltText('Company logo').click();
  ```

---

## 🥈 Medium Priority (Acceptable)

### 4. `getByTestId` (`data-testid`, `data-test`, etc.)
- Very stable if your app provides dedicated test IDs.
- Example:
  ```ts
  await page.getByTestId('login-button').click();
  ```

### 5. Stable CSS Selectors (`id`, meaningful class names)
- Use only when no semantic locator is available.
- Avoid dynamic or auto-generated classes.
- Examples:
  ```ts
  await page.locator('#submitBtn').click();
  await page.locator('.nav-bar .menu-item.active').click();
  ```

---

## 🥉 Lowest Priority (Use Sparingly)

### 6. XPath
- Harder to read, less maintainable.
- Example (avoid if possible):
  ```ts
  await page.locator('//button[text()="Submit"]').click();
  ```

### 7. Position-based selectors (`nth-child`, indexes)
- Very fragile: breaks easily when UI changes.
- Example (avoid):
  ```ts
  await page.locator('div > button:nth-child(2)').click();
  ```

---

## 📌 Final Priority Order
1. `getByRole`
2. `getByLabel` / `getByPlaceholder`
3. `getByText` / `getByAltText`
4. `getByTestId`
5. Stable CSS selector
6. XPath (last resort)
7. Position-based selector (avoid)

---

## 🔎 Mapping Roles to HTML (Playwright Locators)
### 🔘 Buttons & Inputs

| **Role**    | **Typical HTML**                                                                     | **Playwright**                                               |
| ----------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `button`    | `<button>`, `<input type="button">`, `<input type="submit">`, `<input type="reset">` | `page.getByRole('button', { name: 'Save' })`                 |
| `textbox`   | `<input type="text">`, `<textarea>`                                                  | `page.getByRole('textbox', { name: 'Username' })`            |
| `searchbox` | `<input type="search">`                                                              | `page.getByRole('searchbox', { name: 'Search' })`            |
| `checkbox`  | `<input type="checkbox">`                                                            | `page.getByRole('checkbox', { name: 'I agree' })`            |
| `radio`     | `<input type="radio">`                                                               | `page.getByRole('radio', { name: 'Male' })`                  |
| `combobox`  | `<select>`, `<input type="text" list="...">`                                         | `page.getByRole('combobox', { name: 'Country' })`            |
| `switch`    | `<input type="checkbox" role="switch">`                                              | `page.getByRole('switch', { name: 'Enable notifications' })` |


### 📄 Content & Structure

| **Role**    | **Typical HTML**               | **Playwright**                                                               |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `heading`   | `<h1>`, `<h2>` … `<h6>`        | `page.getByRole('heading', { name: 'Dashboard' })`                           |
| `link`      | `<a href="...">`               | `page.getByRole('link', { name: 'Home' })`                                   |
| `list`      | `<ul>`, `<ol>`                 | `page.getByRole('list')`                                                     |
| `listitem`  | `<li>` inside `<ul>` or `<ol>` | `page.getByRole('listitem', { name: 'Item 1' })`                             |
| `paragraph` | `<p>`                          | ❌ Không có role mặc định, nên dùng `locator('p')`                           |
| `table`     | `<table>`                      | `page.getByRole('table')`                                                    |
| `row`       | `<tr>`                         | `page.getByRole('row')`                                                      |
| `cell`      | `<td>`, `<th>`                 | `page.getByRole('cell', { name: 'Value' })` hoặc `getByRole('columnheader')` |


### 📑 Navigation & Grouping

| **Role**     | **Typical HTML**                                   | **Playwright**                                          |
| ------------ | -------------------------------------------------- | ------------------------------------------------------- |
| `navigation` | `<nav>`                                            | `page.getByRole('navigation')`                          |
| `menu`       | `<ul role="menu">`, `<div role="menu">`            | `page.getByRole('menu')`                                |
| `menuitem`   | `<li role="menuitem">`, `<button role="menuitem">` | `page.getByRole('menuitem', { name: 'Settings' })`      |
| `tablist`    | `<div role="tablist">`                             | `page.getByRole('tablist')`                             |
| `tab`        | `<button role="tab">`                              | `page.getByRole('tab', { name: 'Details' })`            |
| `tabpanel`   | `<div role="tabpanel">`                            | `page.getByRole('tabpanel', { name: 'Details Panel' })` |


### 🎛️ Interactive & Mis

| **Role**      | **Typical HTML**                         | **Playwright**                                        |
| ------------- | ---------------------------------------- | ----------------------------------------------------- |
| `dialog`      | `<dialog>`, `<div role="dialog">`        | `page.getByRole('dialog', { name: 'Import Wizard' })` |
| `alert`       | `<div role="alert">`                     | `page.getByRole('alert', { name: /deleted/ })`        |
| `tooltip`     | `<div role="tooltip">`                   | `page.getByRole('tooltip', { name: 'Info' })`         |
| `progressbar` | `<progress>`, `<div role="progressbar">` | `page.getByRole('progressbar')`                       |
| `slider`      | `<input type="range">`                   | `page.getByRole('slider', { name: 'Volume' })`        |
| `status`      | `<div role="status">`, `<output>`        | `page.getByRole('status')`                            |


### ✅ Quick takeaway:

- Many roles come implicitly from native HTML tags.
- Some (like switch, menu, tab) require role="..." explicitly.
- Always confirm in DevTools → Accessibility Tree to see the actual Role and Name that Playwright will use.

### Example: 
- <button aria-label="Save Form"></button>
=> await page.getByRole('button', { name: 'Save Form' });

# Best Practices for Multi-Language Salesforce Applications:
- In Salesforce, the UI changes according to the user’s language.
- If a test case relies only on text (innerText, button labels), tests can become flaky or fail when the language changes.

## Common Issues
- Example: the same button in different languages
| Language | Displayed Label |
| -------- | --------------- |
| English  | Save            |
| Spanish  | Guardar         |
| Japanese | 保存             |

```typescript
await page.getByRole('button', { name: 'Save' }).click();

```
- ✅ Passes in English
- ❌ Fails in Spanish/Japanese.

## Best Practices
### 1. Prefer stable attributes (language-independent)
- If data-testid, id, or automation-id exists → always use them first.
```typescript
await page.getByTestId('save-btn').click();

```
### 2. Fallback with Role if no stable attributes
- Use getByRole with regex when labels vary by language.
- await page.getByRole('button', { name: /Save|Guardar|保存/ }).click();

### 3. Use language-based mapping
- Create a dictionary of labels per language.
```typescript
const buttonLabels = {
  en: 'Save',
  es: 'Guardar',
  ja: '保存',
};
await page.getByRole('button', { name: buttonLabels['ja'] }).click();

```

### 4. Use XPath only as a last resort
- Example: when Salesforce doesn’t expose role or testid.
```typescript
await page.locator('//button[span[text()="保存"]]').click();
```
## Special Notes for Salesforce
- Many Lightning components don’t provide data-testid → often you’ll need to fall back on role or XPath.
- If the FE team allows, recommend adding data-testid for more stable, language-independent tests.
- For multilingual apps, the test framework should support locale configuration → makes it easier to adjust locators when needed.

## Quick Checklist – Multi-Language Salesforce Testing
- Always prefer stable attributes (data-testid, id, automation-id).
- Fallback with getByRole + regex when labels differ across languages.
- Use language dictionaries for text-based locators if needed.
- XPath only as a last resort (when Salesforce doesn’t expose attributes).
- Configure locale in test framework to easily switch language context.

## Multi-Language Salesforce Testing – Do & Don’t

| ✅ Do                                                                  | ❌ Don’t                                          |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| Use **stable attributes** (`data-testid`, `id`, `automation-id`)      | Rely only on **button labels / innerText**       |
| Use **`getByRole` with regex** for multilingual labels                | Hardcode a single language text in locator       |
| Create a **dictionary mapping** for labels per language               | Duplicate the same test case for each language   |
| Configure **locale setting** in test framework                        | Manually edit locators whenever language changes |
| Use **XPath only as last resort** when no stable attributes available | Make XPath your primary locator strategy         |
