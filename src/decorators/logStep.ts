// src/decorators/logStep.ts
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type LogLevel = 'debug' | 'info' | 'error' | 'none';

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const LOG_FILE = process.env.LOG_FILE || path.join(process.cwd(), 'test-logs.json');

// Determine if a message should be logged based on level
function shouldLog(level: LogLevel): boolean {
  const order: LogLevel[] = ['debug', 'info', 'error', 'none'];
  return order.indexOf(level) >= order.indexOf(LOG_LEVEL);
}

// ANSI colors for console
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

// Pretty-print args/results with colors
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

// Append log entry to JSON file
function appendToFile(entry: any) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

export function LogStep(name?: string) {
  return function <T extends (...args: any[]) => any>(
    originalMethod: T,
    context: ClassMethodDecoratorContext
  ) {
    const stepName = name || String(context.name);

    async function replacement(this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
      return await test.step(stepName, async () => {
        const timestamp = new Date().toISOString();

        // Console start
        if (shouldLog('info')) console.log(`${colors.yellow}➡️ START:${colors.reset} ${colors.cyan}${stepName}${colors.reset}`);
        if (shouldLog('debug') && args.length > 0) console.log(`${colors.gray}   📥 Args:${colors.reset}\n${prettyPrint(args)}`);

        try {
          const result = await originalMethod.apply(this, args);

          // Append to log file
          const logEntry = {
            step: stepName,
            args,
            result,
            status: 'success',
            timestamp
          };
          appendToFile(logEntry);

          // Console result & success
          if (shouldLog('debug') && result !== undefined) console.log(`${colors.gray}   📤 Result:${colors.reset}\n${prettyPrint(result)}`);
          if (shouldLog('info')) console.log(`${colors.green}✅ SUCCESS:${colors.reset} ${stepName}`);

          return result;
        } catch (err) {
          // Narrow unknown type
          const errorMessage = err instanceof Error ? err.message : String(err);
          // Append failure to log file
          const logEntry = {
            step: stepName,
            args,
            error: errorMessage,
            status: 'failed',
            timestamp
          };
          appendToFile(logEntry);

          if (shouldLog('error')) console.error(`${colors.red}❌ FAILED:${colors.reset} ${stepName}`, err);
          throw err;
        }
      });
    }

    return replacement as T;
  };
}