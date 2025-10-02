import { Page, ElementHandle, Locator } from '@playwright/test';
import { CommonConstants } from '../constants/commonConstants';

export class CommonHelpers {
  /**
   * Navigate to a specific page by name.
   */
  static async navigateToPage(page: Page, pageName: string): Promise<void> {
    const url = this.getPageURL(pageName);
    await page.goto(url);
  }

  /**
   * Check if a number is within a specific range.
   */
  static isNumberInRange(value: number, min: number, max: number): boolean {
    return typeof value === 'number' && value >= min && value <= max;
  }

  /**
   * Check if a field is mandatory (not null, not empty string).
   */
  static isMandatory(value: any): boolean {
    return value !== undefined && value !== null && value.toString().trim().length > 0;
  }

  /**
   * Validate currency (positive number with max 2 decimals).
   */
  static isValidCurrency(value: string): boolean {
    return /^\d+(\.\d{1,2})?$/.test(value);
  }

  /**
   * Check if value is a valid date (YYYY-MM-DD format).
   */
  static isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  /**
   * Check if age is valid (between minAge and maxAge).
   */
  static isValidAge(age: number, minAge: number = 0, maxAge: number = 120): boolean {
    return age >= minAge && age <= maxAge;
  }

  /**
   * Check if value is non-negative (≥ 0).
   */
  static isNonNegative(value: number): boolean {
    return typeof value === 'number' && value >= 0;
  }

  /**
   * Resolve URL by page name.
   */
  private static getPageURL(pageName: string): string {
    switch (pageName) {
      case CommonConstants.PAGE_EVENT_MASTER:
        return process.env.EVENT_MASTER_URL as string;
      case CommonConstants.PAGE_LESSONS:
        return process.env.LESSONS_URL as string;
      case CommonConstants.PAGE_TIMESHEET:
        return process.env.TIMESHEET_URL as string;
      default:
        return process.env.PAGE_URL as string;
    }
  }

  // async function navigateToSite(page: Page,  timeout = 15000): Promise<void> {
  //   const url = process.env.PAGE_URL || '/';
  //   if (!url) {
  //     throw new Error('❌ PAGE_URL environment variable is not set.');
  //   }

  //   try {
  //     console.log(`➡️ Navigating to ${url}`);
  //     await page.goto(url, { waitUntil: 'networkidle', timeout }); // chờ network idle
  //     console.log(`✅ Navigation to ${url} successful`);
  //   } catch (error) {
  //     console.error(`❌ Failed to navigate to ${url}`);
  //     throw error;
  //   }
  // }

  // function getEnvironment(): string {
  //   return process.env.ENV || CommonConstants.STAGING;
  // }

  /**
   * Close the browser page gracefully.
   * Often used in global teardown or after a test suite.
   */
  static async teardownBrowser(page: Page): Promise<void> {
    if (page && !page.isClosed()) {
      console.log('🧹 Closing browser page...');
      await page.close();
      console.log('✅ Browser page closed');
    }
  }
}
