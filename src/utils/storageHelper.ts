import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

export class StorageHelper {
  static async save(page: Page, env: string): Promise<string> {
    const dir = "storage";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `storageState.${env}.json`);
    await page.context().storageState({ path: filePath });

    console.log(`✅ Storage saved: ${filePath}`);
    return filePath;
  }
}
