import { Page, Locator } from '@playwright/test';
import { LocatorOptions } from '@src/type/LocatorOptions';

/**
 * Locator utilities for Page Object Model
 */

/**
 * Normalize locator input into a Playwright Locator
 * - String → CSS/XPath/placeholder detection
 * - Locator → return as-is
 * - LocatorOptions → convert to appropriate locator
 */
export function normalizeLocator(page: Page, locator: string | Locator | LocatorOptions): Locator {
  // --- string case ---
  if (typeof locator === 'string') {
    const isCssSelector = /^[.#\[]/.test(locator) || 
      /\[.*=.*\]/.test(locator) || 
      locator.startsWith('//') || locator.startsWith('xpath=');

    const isPlaceholder = !isCssSelector && 
      (locator.includes(' ') || locator.includes('...'));

    if (isPlaceholder) return page.getByPlaceholder(locator);
    if (locator.startsWith('//') || locator.startsWith('xpath=')) {
      return page.locator(locator.startsWith('//') ? `xpath=${locator}` : locator);
    }
    return page.locator(locator);
  }

  // --- already a Locator ---
  if ('click' in (locator as Locator)) return locator as Locator;

  // --- LocatorOptions ---
  const opts = locator as LocatorOptions;

  if (opts.role) {
    if (opts.rowIndex !== undefined || opts.rowText) {
      let rows = page.getByRole('row');
      if (opts.rowText) rows = rows.filter({ hasText: opts.rowText });
      const row = opts.rowIndex !== undefined ? rows.nth(opts.rowIndex) : rows.first();
      return opts.name ? row.getByRole(opts.role, { name: opts.name }) : row.getByRole(opts.role);
    }
    return opts.name ? page.getByRole(opts.role, { name: opts.name }) : page.getByRole(opts.role);
  }

  if (opts.dataTestId) {
    return page.locator(`[data-test-id="${opts.dataTestId}"], [data-testid="${opts.dataTestId}"]`);
  }

  if (opts.id) return page.locator(`#${opts.id}`);
  if (opts.placeholder) return page.getByPlaceholder(opts.placeholder);
  if (opts.title) return page.getByTitle(opts.title);
  if (opts.css) return page.locator(opts.css);
  
  if (opts.xpath) {
    console.warn('[normalizeLocator] Using xpath (not recommended):', opts.xpath);
    return page.locator(`xpath=${opts.xpath}`);
  }

  throw new Error('[normalizeLocator] No valid locator provided: ' + JSON.stringify(locator));
}