// src/decorators/trackTime.ts
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ✅ TrackTime decorator
// - Measures how long a method takes to run
// - Logs duration to console + JSON file
// - Useful for performance monitoring
//
// Example usage:
// @TrackTime()
// async generateReport() {
//   await this.page.click('button.generate');
//   await this.page.waitForSelector('.report-ready');
// }

type LogEntry = {
  step: string;
  durationMs: number;
  status: string;
  timestamp: string;
};

const LOG_FILE = process.env.LOG_FILE || path.join(process.cwd(), 'test-logs.json');

function appendToFile(entry: LogEntry) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write trackTime log:', err);
  }
}

export function TrackTime() {
  return function <T extends (...args: any[]) => any>(
    originalMethod: T,
    context: ClassMethodDecoratorContext
  ) {
    const stepName = String(context.name);

    async function replacement(this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
      return await test.step(`TrackTime: ${stepName}`, async () => {
        const start = Date.now();
        try {
          const result = await originalMethod.apply(this, args);
          const duration = Date.now() - start;

          appendToFile({
            step: stepName,
            durationMs: duration,
            status: 'success',
            timestamp: new Date().toISOString(),
          });

          console.log(`⏱️ [${stepName}] took ${duration} ms`);
          return result;
        } catch (err) {
          const duration = Date.now() - start;

          appendToFile({
            step: stepName,
            durationMs: duration,
            status: 'failed',
            timestamp: new Date().toISOString(),
          });

          console.error(`❌ [${stepName}] failed after ${duration} ms`, err);
          throw err;
        }
      });
    }

    return replacement as T;
  };
}
