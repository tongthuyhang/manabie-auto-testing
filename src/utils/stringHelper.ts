/**
 * Escape RegExp special characters in a string
 * Example: escapeRegExp('a.b*c') → 'a\\.b\\*c'
 *|Flag| Description                                                | EX                                              |
| ---- | ---------------------------------------------------------- | ----------------------------------------------- |
| `i`  | Case-insensitive                                           | `new RegExp('abc', 'i')` match `'ABC'`, `'abc'` |
| `g`  | Global — find **all results**, not stopping at the first   | `str.match(/a/g)`                               |
| `m`  | Multi-line — `^` and `$` match line by lin                 |                                                 |
| `s`  | DotAll — `.` matches line breaks `\n`                      |                                                 |
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * For: string “known for sure” is string
 * Normalize whitespace: collapse multiple spaces and trim both ends
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Convert any input (string | string[] | number | object) into a clean string
 * Commonly used for assertions or dynamic field input
 * EX:
 * toCleanString('  Hello   World  '); 
 * => output: 'Hello World'
 */
export function toCleanString(value: unknown, separator = ' '): string {
  if (value == null) return '';

  if (Array.isArray(value)) {
    return value
      .map(v => normalizeWhitespace(String(v)))
      .filter(Boolean)
      .join(separator);
  }

  return String(value).trim();
}

/**
 * Compare 2 strings ignoring case and extra spaces
 * Example: equalsIgnoreCase('Hello  world', 'hello world') → true
 * EX: expect(equalsIgnoreCase(actualButtonText, 'save')).toBeTruthy()
 */
export function equalsIgnoreCase(a: string, b: string): boolean {
  return normalizeWhitespace(a).toLowerCase() === normalizeWhitespace(b).toLowerCase();
}

/**
 * Check if a string is null, undefined, or empty after trimming
 * EX: if (isEmpty(formData.name)) throw new Error('Name is required');
 */
export function isEmpty(value?: string | null): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Generate random string with prefix (for dynamic test data)
 * Example: randomName('event') → 'event_mb4o4h'
 */
export function randomName(prefix = 'auto'): string {
  return `${prefix}_${Date.now().toString(36)}`;
}

/**
  * Normalize input (string or string[]) into a single clean string.
  * - Trims all whitespace
  * - Removes empty entries if input is array
  * - Joins array with custom separator
  * 
  * @param value - A string or an array of strings
  * @param separator - String used to join array items (default: " ")
  * @returns A clean, normalized string
  * 
  * @example
  * normalizeToString(" demo ") 
  * // => "demo"
  * 
  * normalizeToString(["demo", " test ", ""]) 
  * // => "demo test"
  * 
  * normalizeToString(["demo", "test"], ", ")
  * // => "demo, test"
  */
  export function normalizeToString(value: string | string[], separator = ' '): string {
    if (value == null) return '';

    if (Array.isArray(value)) {
      return value
        .map(v => v?.trim())            // double space type
        .filter(v => v && v.length > 0) // hollow element type
        .join(separator);
    }

    return value.trim();
  }
