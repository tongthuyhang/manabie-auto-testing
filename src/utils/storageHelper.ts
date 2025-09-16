import { Page, BrowserContext } from "@playwright/test";
import fs from "fs";
import path from "path";

export class StorageHelper {
  static getPath(env: string): string {
    const dir = "storage";
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
}
