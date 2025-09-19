import { Page } from '@playwright/test';

/**
 * Helper to force English language in Salesforce
 */
export class LanguageHelper {
  /**
   * Force English language by setting URL parameter
   */
  static async forceEnglish(page: Page): Promise<void> {
    const currentUrl = page.url();
    
    // Add language parameter to URL if not present
    if (!currentUrl.includes('lang=en') && !currentUrl.includes('language=en')) {
      const separator = currentUrl.includes('?') ? '&' : '?';
      const newUrl = `${currentUrl}${separator}lang=en`;
      await page.goto(newUrl);
    }
  }

  /**
   * Set English in Salesforce user preferences
   */
  static async setSalesforceLanguage(page: Page): Promise<void> {
    try {
      // Execute JavaScript to set language preference
      await page.evaluate(() => {
        // Set localStorage language preference
        localStorage.setItem('language', 'en');
        localStorage.setItem('locale', 'en_US');
        
        // Set document language
        document.documentElement.lang = 'en';
      });
    } catch (error) {
      console.warn('Could not set language preference:', error);
    }
  }

  /**
   * Verify page is in English
   */
  static async verifyEnglish(page: Page): Promise<boolean> {
    try {
      // Check HTML lang attribute
      const htmlLang = await page.locator('html').getAttribute('lang');
      return htmlLang?.startsWith('en') || false;
    } catch {
      return false;
    }
  }
}