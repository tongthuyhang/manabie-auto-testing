/**
 * Generic array utilities
 */

/**
 * Normalize input into an array
 * - If input is T[], return it directly
 * - If input is a single T, wrap it in an array
 */
export function normalizeToArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}