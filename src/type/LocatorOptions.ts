// types/LocatorOptions.ts
import { Page } from '@playwright/test';

export interface LocatorOptions {
  /** Role of element, using Playwright built-in type
   * This means the role type will automatically be equal to the Playwright standard type, e.g. 'button' | 'row' | 'checkbox' | ...
   */
  role?: Parameters<Page['getByRole']>[0]; //Parameters<Page['getByRole']>[0] = type of first parameter of getByRole
  
  /** Text or RegEx to match element name/label */
  name?: string | RegExp;

  /** Row scoping */
  rowIndex?: number;
  rowText?: string | RegExp;

  /** Other locator strategies */
  id?: string;
  dataTestId?: string;
  placeholder?: string;
  title?: string;
  css?: string;
  xpath?: string;
}