import { Page} from "@playwright/test";
import { LoginAction } from './loginHelper';
import fs from "fs";
import path from "path";

export class StorageHelper {
  /**
   * Gets the storage file path for the specified environment
   * Creates the storage directory if it doesn't exist
   * @param environment - Environment name (e.g., 'dev-staging', 'pre-prod')
   * @returns Full path to the storage state file
   */
  static getStorageFilePath(environment: string): string {
    const storageDirectory = path.resolve(__dirname, '../../storage');
    if (!fs.existsSync(storageDirectory)) {
      fs.mkdirSync(storageDirectory, { recursive: true });
    }
    return path.join(storageDirectory, `storageState.${environment}.json`);
  }

  /**
   * Saves the current page storage state to file
   * @param page - Playwright page instance
   * @param environment - Environment name
   * @returns Promise resolving to the saved file path
   * @throws Error when storage save operation fails
   */
  static async saveStorageState(page: Page, environment: string): Promise<string> {
    const filePath = this.getStorageFilePath(environment);
    
    try {
      await page.context().storageState({ path: filePath });
      console.log(`✅ Storage saved successfully: ${filePath}`);
      return filePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to save storage: ${errorMessage}`);
      throw new Error(`Storage save failed: ${errorMessage}`);
    }
  }

  /**
   * Loads the storage state file path if it exists
   * @param environment - Environment name
   * @returns File path if exists, null otherwise
   */
  static loadStorageState(environment: string): string | null {
    const filePath = this.getStorageFilePath(environment);
    return fs.existsSync(filePath) ? filePath : null;
  }

  /**
   * Validates if the storage state file contains valid data
   * @param environment - Environment name
   * @returns True if storage contains valid cookies, false otherwise
   */
  static isStorageStateValid(environment: string): boolean {
    const filePath = this.getStorageFilePath(environment);
    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      const storageState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return Array.isArray(storageState.cookies) && storageState.cookies.length > 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error reading storage state: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Checks if the storage state has expired based on file age and cookie expiration
   * @param environment - Environment name
   * @param maxAgeHours - Maximum age in hours before considering expired (default: 24)
   * @returns True if storage is expired, false otherwise
   */
  static isStorageStateExpired(environment: string, maxAgeHours: number = 24): boolean {
    const filePath = this.getStorageFilePath(environment);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Storage file not found: ${filePath}`);
      return true;
    }

    // Check file age
    const fileStats = fs.statSync(filePath);
    const ageInHours = (Date.now() - fileStats.mtime.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours > maxAgeHours) {
      console.log(`⏰ Storage expired by age: ${ageInHours.toFixed(1)}h old (max: ${maxAgeHours}h)`);
      return true;
    }

    // Check cookie expiration
    try {
      const storageState = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const currentTimeInSeconds = Date.now() / 1000;
      
      const expiredCookies = storageState.cookies?.filter((cookie: any) => 
        cookie.expires > 0 && cookie.expires < currentTimeInSeconds
      );
      
      if (expiredCookies && expiredCookies.length > 0) {
        console.log(`🍪 Storage has ${expiredCookies.length} expired cookies`);
        return true;
      }
      
      console.log(`✅ Storage is fresh (${ageInHours.toFixed(1)}h old)`);
      return false;
      
    } catch (error) {
      console.log(`❌ Error reading storage: ${error}`);
      return true;
    }
  }

  /**
   * Determines if storage state should be refreshed
   * Combines validity and expiration checks
   * @param environment - Environment name
   * @returns True if storage should be refreshed, false otherwise
   */
  static shouldRefreshStorageState(environment: string): boolean {
    const isValid = this.isStorageStateValid(environment);
    const isExpired = this.isStorageStateExpired(environment);
    
    console.log(`🔍 Storage check for ${environment}:`);
    console.log(`   - Valid: ${isValid}`);
    console.log(`   - Expired: ${isExpired}`);
    console.log(`   - Should refresh: ${!isValid || isExpired}`);
    
    return !isValid || isExpired;
  }


  /**
   * Checks if storage is expired and refreshes it if needed
   * @param page - Playwright page instance
   * @param env - Environment (defaults to dev-staging)
   * @param userType - User type for login (defaults to admin)
   */
  static async checkAndRefreshStorage(
    page: Page, 
    env?: string, 
    userType?: string
  ): Promise<void> {
    const environment = env || process.env.ENV?.trim() || 'dev-staging';
    const user = userType || process.env.USER_TYPE || 'admin';
    
    if (this.shouldRefreshStorageState(environment)) {
      console.log('🔄 Storage expired - forcing re-authentication...');
      
      await LoginAction(page, user);
      await page.waitForURL('**/lightning/**', { timeout: 30000 });
      await this.saveStorageState(page, environment);
      
      console.log('✅ Fresh storage created');
    }
  }
}
