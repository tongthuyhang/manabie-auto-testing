// src/decorators/logStep.ts
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';


/** This file defines a method decorator called LogStep.
- It wraps any test step in Playwright with logging.
- It logs input arguments, results, errors, and writes them both to the console (with colors) and to a JSON file.
- It also uses test.step so that Playwright’s test report will show the decorated method as a named step. 
# Example usage in EventMasterFacade.ts
@LogStep('Create event')
async createEvent(data: EventData): Promise<void> {
  // ...
}
# What happens when you run?
- The decorator wraps the test step with logging.
- The test step is logged to the console and written to the JSON file.
- The test step is also logged to the Playwright test report as a named step.
- The test step is executed as normal.
You will see console logs like: 
➡️ START: Create Event
📥 Args:
{ "eventMasterName": "My Test Event", "eventType": "Seminar", ... }
✅ SUCCESS: Create Event
And in test-logs.json, you’ll get:
{"step":"Create Event","args":[{"eventMasterName":"My Test Event","eventType":"Seminar","sendTo":"All","reminder":true,"maxEventPerStudent":5}],"status":"success","timestamp":"2025-09-10T01:23:45.678Z"}
*/

// Define allowed log levels
type LogLevel = 'debug' | 'info' | 'error' | 'none';

// Current log level (from environment variable, default = 'info')
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'debug';

// File path for writing logs (default = test-logs.json at project root)
const LOG_FILE = process.env.LOG_FILE || path.join(process.cwd(), 'test-logs.json');

// Check if a log message should be printed based on the current log level
function shouldLog(level: LogLevel): boolean {
  const order: LogLevel[] = ['debug', 'info', 'error', 'none'];
  return order.indexOf(level) >= order.indexOf(LOG_LEVEL);
}

// ANSI escape codes for colored console output
const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

// Pretty-print values with colors for console logging
function prettyPrint(obj: any): string {
  if (obj === null) return `${colors.gray}null${colors.reset}`;
  if (typeof obj === 'string') return `${colors.green}"${obj}"${colors.reset}`;
  if (typeof obj === 'number') return `${colors.cyan}${obj}${colors.reset}`;
  if (typeof obj === 'boolean') return obj ? `${colors.magenta}true${colors.reset}` : `${colors.magenta}false${colors.reset}`;
  if (Array.isArray(obj)) return `[${obj.map(prettyPrint).join(', ')}]`;
  if (typeof obj === 'object') {
    const entries = Object.entries(obj).map(
      ([k, v]) => `${colors.blue}"${k}"${colors.reset}: ${prettyPrint(v)}`
    );
    return `{ ${entries.join(', ')} }`;
  }
  return String(obj);
}

// Append log entry as JSON to the log file
function appendToFile(entry: any) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

// Main decorator function
// Usage: @LogStep('Step Name') above any async method
export function LogStep(name?: string) {
  return function <T extends (...args: any[]) => any>(
    originalMethod: T,
    context: ClassMethodDecoratorContext
  ) {
    // Step name comes from argument or method name
    const stepName = name || String(context.name);

    // Replacement function that wraps the original method
    async function replacement(this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
      return await test.step(stepName, async () => {
        const timestamp = new Date().toISOString();

        // Console: start message + arguments (if debug)
        if (shouldLog('info')) console.log(`${colors.yellow}➡️ START:${colors.reset} ${colors.cyan}${stepName}${colors.reset}`);
        if (shouldLog('debug') && args.length > 0) console.log(`${colors.gray}   📥 Args:${colors.reset}\n${prettyPrint(args)}`);

        try {
          // Call the original method
          const result = await originalMethod.apply(this, args);

          // Log success entry
          const logEntry = {
            step: stepName,
            args,
            result,
            status: 'success',
            timestamp
          };
          appendToFile(logEntry);

          // Console: result (if debug) + success message
          if (shouldLog('debug') && result !== undefined) console.log(`${colors.gray}   📤 Result:${colors.reset}\n${prettyPrint(result)}`);
          if (shouldLog('info')) console.log(`${colors.green}✅ SUCCESS:${colors.reset} ${stepName}`);

          return result;
        } catch (err) {
          // Handle failure
          const errorMessage = err instanceof Error ? err.message : String(err);

          // Log failure entry
          const logEntry = {
            step: stepName,
            args,
            error: errorMessage,
            status: 'failed',
            timestamp
          };
          appendToFile(logEntry);

          // Console: failure message
          if (shouldLog('error')) console.error(`${colors.red}❌ FAILED:${colors.reset} ${stepName}`, err);

          // Rethrow to fail the test
          throw err;
        }
      });
    }

    // Return the wrapped method
    return replacement as T;
  };
}
