import * as fs from 'fs';
import path from 'path';

/**
 * JsonHelper
 *
 * A general-purpose utility class for working with JSON data. Provides methods to:
 *  - Load and save JSON files
 *  - Access and modify values using dot-notated paths
 *  - Validate JSON objects against required keys
 *  - Filter arrays of JSON objects by key values
 *
 * This helper is reusable across modules for consistent JSON operations.
 */
export class JsonHelper {
  /**
   * Retrieve a value from a JSON object using a dot-notated path.
   * Example: "user.address.city"
   * @param jsonObj - the JSON object to read from
   * @param path - dot-separated path to the property
   * @returns the value at the specified path
   */
  static getJsonValue(jsonObj: any, path: string): any {
    const keys = path.split('.');
    let value = jsonObj;
    for (const key of keys) {
      value = value[key];
    }
    return value;
  }

  /**
   * Set a value in a JSON object using a dot-notated path.
   * Example: "user.address.city"
   * @param jsonObj - the JSON object to modify
   * @param path - dot-separated path to the property
   * @param value - the value to set
   * @returns the updated JSON object
   */
  static setJsonValue(jsonObj: any, path: string, value: any): any {
    const keys = path.split('.');
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
   * @param datapath - relative path to the JSON file
   * @returns a parsed JSON object
   */
  // static async loadJsonFromFile(datapath: string): Promise<any> {
  //   //const filePath = path.join(process.cwd(), datapath);
  //   const filePath = path.resolve(__dirname, "..", datapath); 
  //   const content = await fs.promises.readFile(filePath, 'utf8');
  //   return JSON.parse(content);
  // }
   static async loadJsonFromFile(datapath: string): Promise<any> {
    let filePath = datapath;

    // Nếu path chưa phải absolute → resolve lại
    if (!path.isAbsolute(datapath)) {
      // Ưu tiên tìm trong project root
      filePath = path.resolve(process.cwd(), datapath);

      // Nếu không tồn tại, thử resolve từ __dirname (dành cho trường hợp gọi "data/users.json")
      if (!fs.existsSync(filePath)) {
        filePath = path.resolve(__dirname, "..", "..", datapath);
      }
    }

    // Kiểm tra lần cuối
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ JSON file not found: ${filePath}`);
    }

    const content = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(content);
  }

  /**
   * Save a JSON object to a file.
   * @param jsonObj - the JSON object to save
   * @param filePath - path where the JSON file will be saved
   */
  static async saveJsonToFile(jsonObj: any, filePath: string): Promise<void> {
    const jsonString = JSON.stringify(jsonObj);
    await fs.promises.writeFile(filePath, jsonString);
  }

  /**
   * Validate that a JSON object contains all required keys.
   * @param jsonObj - the JSON object to validate
   * @param requiredKeys - an array of required key names
   * @returns true if all required keys exist, otherwise throws an error
   */
  static validateJsonSchema(jsonObj: any, requiredKeys: string[]): boolean {
    for (const key of requiredKeys) {
      if (!(key in jsonObj)) {
        throw new Error(`Required key '${key}' not found in JSON`);
      }
    }
    return true;
  }

  /**
   * Retrieve objects from a JSON array that match specific key values.
   * @param items - array of objects to search
   * @param values - array of values to match
   * @param key - the object property to compare against the values
   * @returns an array of objects that match the given values
   */
  static getItemsByKey<T, K extends keyof T>(items: T[], values: T[K][], key: K): T[] {
    return values
      .map(v => items.find(item => item[key] === v))
      .filter((item): item is T => item !== undefined);
  }
}
