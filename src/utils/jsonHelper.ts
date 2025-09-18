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
 * Retrieve objects from a JSON array that match specific key values.
 */
export function getItemsByKey<T, K extends keyof T>(
  items: T[],
  values: T[K][],
  key: K
): T[] {
  return values
    .map(v => items.find(item => item[key] === v))
    .filter((item): item is T => item !== undefined);
}
