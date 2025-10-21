import * as fs from "fs";
import path from "path";

/**
 * JSON Utilities
 *
 * General-purpose functions for working with JSON data:
 *  - Load and save JSON files
 *  - Access and modify values using dot-notated paths
 *  - Validate JSON objects against required keys
 *  - Filter arrays of JSON objects by key values
 */

/**
 * Retrieve a value from a JSON object using a dot-notated path.
 * Example: "user.address.city"
 */
export function getJsonValue(jsonObj: any, pathStr: string): any {
  const keys = pathStr.split(".");
  let value = jsonObj;
  for (const key of keys) {
    value = value[key];
  }
  return value;
}

/**
 * Set a value in a JSON object using a dot-notated path.
 * Example: "user.address.city"
 */
export function setJsonValue(jsonObj: any, pathStr: string, value: any): any {
  const keys = pathStr.split(".");
  const lastKey = keys.pop()!;
  let parent = jsonObj;
  for (const key of keys) {
    parent = parent[key];
  }
  parent[lastKey] = value;
  return jsonObj;
}

/**
 * Load JSON data from a file.
 */
export async function loadJsonFromFile(datapath: string): Promise<any> {
  let filePath = datapath;

  // Nếu path chưa phải absolute → resolve lại
  if (!path.isAbsolute(datapath)) {
    filePath = path.resolve(process.cwd(), datapath);

    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(__dirname, "..", "..", datapath);
    }
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ JSON file not found: ${filePath}`);
  }

  const content = await fs.promises.readFile(filePath, "utf8");
  return JSON.parse(content);
}

/**
 * Save a JSON object to a file.
 */
export async function saveJsonToFile(jsonObj: any, filePath: string): Promise<void> {
  const jsonString = JSON.stringify(jsonObj, null, 2); // pretty print
  await fs.promises.writeFile(filePath, jsonString);
}

/**
 * Validate that a JSON object contains all required keys.
 */
export function validateJsonSchema(jsonObj: any, requiredKeys: string[]): boolean {
  for (const key of requiredKeys) {
    if (!(key in jsonObj)) {
      throw new Error(`Required key '${key}' not found in JSON`);
    }
  }
  return true;
}

/**
 * Helper function to filter items from an array based on a list of values for a specific key.
 * - Supports TypeScript autocomplete for the key thanks to `K extends keyof T`.
 * - Keeps the same order as the `values` array.
 * @template T - Type of objects in the array (e.g., EventData)
 * @template K - Type of the key (must be one of the keys of T)
 * @param items - Original array of objects
 * @param values - List of values to search by
 * @param key - Object key to match against
 * @returns Filtered array of matching objects
 *
 *  Example:
 * ```ts
 * const testData = [
  { eventMasterName: 'A', eventType: 'Free' },
  { eventMasterName: 'B', eventType: 'Paid' },
  ];

  getItemsByKey(testData, ['B'], 'eventMasterName');
// Found: return [{eventMasterName: 'B', eventType: 'Paid'}]

 * ```
 */
export function getItemsByKey<T, K extends keyof T>(
  items: T[],
  values: T[K][],
  key: K
): T[] {
  return values.map(v => items.find(item => item[key] === v))
    .filter((item): item is T => item !== undefined);
  
}

/**
 * Helper function to update one or more fields of each object in an array.
 * - Keeps the original fields using spread syntax (`...item`)
 * - Merges the new or updated fields returned from the `fieldsToUpdate` function
 *
 * @template T - The type of the array elements (e.g., EventData)
 * @param originalArray - The original array containing objects
 * @param fieldsToUpdate - A callback function that returns the fields to update,
 *                         which can depend on the current item and its index
 * @returns A new array with objects that have their fields updated
 */
export function updateObjectFields<T>(
  originalArray: T[],
  fieldsToUpdate: (item: T, index: number) => Partial<T>
): T[] {
  return originalArray.map((item, index) => ({
    ...item,
    ...fieldsToUpdate(item, index),
  }));
}


