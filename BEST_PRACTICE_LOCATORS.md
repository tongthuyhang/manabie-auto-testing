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

| **Role**    | **Typical HTML**                                                                     |
| ----------- | ------------------------------------------------------------------------------------ |
| `button`    | `<button>`, `<input type="button">`, `<input type="submit">`, `<input type="reset">` |
| `textbox`   | `<input type="text">`, `<textarea>`                                                  |
| `searchbox` | `<input type="search">`                                                              |
| `checkbox`  | `<input type="checkbox">`                                                            |
| `radio`     | `<input type="radio">`                                                               |
| `combobox`  | `<select>`, `<input type="text" list="...">`                                         |
| `switch`    | `<input type="checkbox" role="switch">` (needs explicit role)                        |

### 📄 Content & Structure

| **Role**    | **Typical HTML**                |
| ----------- | ------------------------------- |
| `heading`   | `<h1>`, `<h2>`, `<h3>` … `<h6>` |
| `link`      | `<a href="...">`                |
| `list`      | `<ul>`, `<ol>`                  |
| `listitem`  | `<li>` inside `<ul>` or `<ol>`  |
| `paragraph` | `<p>`                           |
| `table`     | `<table>`                       |
| `row`       | `<tr>`                          |
| `cell`      | `<td>`, `<th>`                  |

### 📑 Navigation & Grouping

| **Role**     | **Typical HTML**                                   |
| ------------ | -------------------------------------------------- |
| `navigation` | `<nav>`                                            |
| `menu`       | `<ul role="menu">`, `<div role="menu">`            |
| `menuitem`   | `<li role="menuitem">`, `<button role="menuitem">` |
| `tablist`    | `<div role="tablist">`                             |
| `tab`        | `<button role="tab">`, `<a role="tab">`            |
| `tabpanel`   | `<div role="tabpanel">`                            |

### 🎛️ Interactive & Mis

| **Role**      | **Typical HTML**                                 |
| ------------- | ------------------------------------------------ |
| `dialog`      | `<dialog>`, `<div role="dialog">`                |
| `alert`       | `<div role="alert">`, `<div role="alertdialog">` |
| `tooltip`     | `<div role="tooltip">`                           |
| `progressbar` | `<progress>`, `<div role="progressbar">`         |
| `slider`      | `<input type="range">`                           |
| `status`      | `<div role="status">`, `<output>`                |

### ✅ Quick takeaway:

- Many roles come implicitly from native HTML tags.
- Some (like switch, menu, tab) require role="..." explicitly.
- Always confirm in DevTools → Accessibility Tree to see the actual Role and Name that Playwright will use.

### Example: 
- <button aria-label="Save Form"></button>
=> await page.getByRole('button', { name: 'Save Form' });

