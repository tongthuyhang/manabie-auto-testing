import { Page} from "@playwright/test";
import { LoginAction } from './LoginHelper';
import fs from "fs";
import path from "path";

export class StorageHelper {
  static getPath(env: string): string {
    const dir = path.resolve(__dirname, '../../storage');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, `storageState.${env}.json`);
  }

  static async save(page: Page, env: string): Promise<string> {
    const filePath = this.getPath(env);
    await page.context().storageState({ path: filePath });
    console.log(`✅ Storage saved: ${filePath}`);
    return filePath;
  }

  static load(env: string): string | null {
    const filePath = this.getPath(env);
    return fs.existsSync(filePath) ? filePath : null;
  }

  static isValid(env: string): boolean {
    const filePath = this.getPath(env);
    if (!fs.existsSync(filePath)) return false;

    try {
      const state = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return Array.isArray(state.cookies) && state.cookies.length > 0;
    } catch {
      return false;
    }
  }

  static isExpired(env: string, maxAgeHours: number = 24): boolean {
    const filePath = this.getPath(env);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Storage file not found: ${filePath}`);
      return true;
    }

    // Check file age
    const stats = fs.statSync(filePath);
    const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
    
    if (ageHours > maxAgeHours) {
      console.log(`⏰ Storage expired by age: ${ageHours.toFixed(1)}h old (max: ${maxAgeHours}h)`);
      return true;
    }

    // Check cookie expiration
    try {
      const state = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const now = Date.now() / 1000; // Convert to seconds
      
      const expiredCookies = state.cookies?.filter((cookie: any) => 
        cookie.expires > 0 && cookie.expires < now
      );
      
      if (expiredCookies && expiredCookies.length > 0) {
        console.log(`🍪 Storage has ${expiredCookies.length} expired cookies`);
        return true;
      }
      
      console.log(`✅ Storage is fresh (${ageHours.toFixed(1)}h old)`);
      return false;
      
    } catch (error) {
      console.log(`❌ Error reading storage: ${error}`);
      return true;
    }
  }

  static shouldRefresh(env: string): boolean {
    const isValidResult = this.isValid(env);
    const isExpiredResult = this.isExpired(env);
    
    console.log(`🔍 Storage check for ${env}:`);
    console.log(`   - Valid: ${isValidResult}`);
    console.log(`   - Expired: ${isExpiredResult}`);
    console.log(`   - Should refresh: ${!isValidResult || isExpiredResult}`);
    
    return !isValidResult || isExpiredResult;
  }


  static async checkAndRefreshStorage(
      page: Page, 
      env?: string, 
      userType?: string
    ): Promise<void> {
      const environment = env || process.env.ENV?.trim() || 'dev-staging';
      const user = userType || process.env.USER_TYPE || 'admin';
      
      if (this.shouldRefresh(environment)) {
        console.log('🔄 Storage expired - forcing re-authentication...');
        
        await LoginAction(page, user);
        await page.waitForURL('**/lightning/**', { timeout: 30000 });
        await StorageHelper.save(page, environment);
        
        console.log('✅ Fresh storage created');
      }
    }
}
