// src/decorators/retry.ts
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ✅ Retry decorator
// - Retries a method multiple times if it fails
// - Logs each attempt to console + JSON file
// - Works with async Playwright test steps
//
// Example usage:
// @Retry(3, 1000)  // retry up to 3 times, 1 second delay between attempts
// async submitForm() {
//   await this.page.click('button.submit');
// }

type LogEntry = {
  step: string;
  attempt: number;
  status: string;
  error?: string;
  timestamp: string;
};

const LOG_FILE = process.env.LOG_FILE || path.join(process.cwd(), 'test-logs.json');

function appendToFile(entry: LogEntry) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write retry log:', err);
  }
}

export function Retry(maxRetries = 3, delayMs = 1000) {
  return function <T extends (...args: any[]) => any>(
    originalMethod: T,
    context: ClassMethodDecoratorContext
  ) {
    const stepName = String(context.name);

    async function replacement(this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
      return await test.step(`Retry: ${stepName}`, async () => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const result = await originalMethod.apply(this, args);

            appendToFile({
              step: stepName,
              attempt,
              status: 'success',
              timestamp: new Date().toISOString(),
            });

            console.log(`✅ SUCCESS [${stepName}] (attempt ${attempt})`);
            return result;
          } catch (err) {
            appendToFile({
              step: stepName,
              attempt,
              status: 'failed',
              error: err instanceof Error ? err.message : String(err),
              timestamp: new Date().toISOString(),
            });

            console.warn(`⚠️ FAILED [${stepName}] attempt ${attempt}:`, err);

            if (attempt < maxRetries) {
              await new Promise((r) => setTimeout(r, delayMs));
              console.log(`🔄 Retrying ${stepName} (attempt ${attempt + 1})...`);
            } else {
              throw err;
            }
          }
        }
        throw new Error(`Unexpected exit in Retry for ${stepName}`);
      });
    }

    return replacement as T;
  };
}
