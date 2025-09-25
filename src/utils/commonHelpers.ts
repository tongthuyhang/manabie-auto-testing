import { Page } from '@playwright/test';
import { CommonConstants } from '../constants/commonConstants';


async function navigateToPage(page: Page, pageName: string): Promise<void> {
  const url = getPageURL(pageName);
  await page.goto(url);
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

// async function teardownBrowser(page: Page): Promise<void> {
//   await page.close();
// }

function getPageURL(pageName: string): string {
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

 /**
   * Check if value is a valid date (YYYY-MM-DD format)
   */
function isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  /**
   * Check if age is valid (between minAge and maxAge)
   */
 function isValidAge(age: number, minAge: number = 0, maxAge: number = 120): boolean {
    return age >= minAge && age <= maxAge;
  }

  /**
   * Check if number is within range
   */
 function isNumberInRange(value: number, min: number, max: number): boolean {
    return typeof value === "number" && value >= min && value <= max;
  }

  /**
   * Check if field is mandatory (not null, not empty string)
   */
 function isMandatory(value: any): boolean {
    return value !== undefined && value !== null && value.toString().trim().length > 0;
  }

  /**
   * Check if value is non-negative (≥ 0)
   */
  function isNonNegative(value: number): boolean {
    return typeof value === "number" && value >= 0;
  }

  /**
   * Validate currency (positive number with max 2 decimals)
   */
  function isValidCurrency(value: string): boolean {
    return /^\d+(\.\d{1,2})?$/.test(value);
  }

export class CommonHelpers {
  static navigateToPage = navigateToPage;
  static isNumberInRange = isNumberInRange;
  static isMandatory = isMandatory;
}