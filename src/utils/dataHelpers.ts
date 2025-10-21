/**
 * Generic helper functions for dynamic test data handling
 * Use this across the entire automation system for creating / updating / finding test data.
 */

export interface BaseData {
  [key: string]: any;
}

/**
* Attach timestamp to 1 or more objects (usually used when creating dynamic data tests)
* @param items - Original object array
* @param key - Field name to append timestamp (eg: 'eventMasterName', 'name', ...)
* @returns New object array with name that has timestamp appended
 */
export function updateNamesWithTimestamp<T extends BaseData>(
  items: T[],
  key: keyof T
): T[] {
  const timestamp = Date.now();
  return items.map((item, index) => ({
    ...item,
    [key]: `${item[key]} ${timestamp + index}`,
  }));
}

/**
*  Find object in array based on original value (excluding timestamp)
* @param items - Array of objects
* @param key - Field name to find (eg 'eventMasterName')
* @param originalName - Original name before adding timestamp
* @returns Object if found, undefined otherwise
 */
export function findItemByOriginalName<T extends BaseData>(
  items: T[],
  key: keyof T,
  originalName: string
): T | undefined {
  return items.find(item => {
    const value = String(item[key]);
    return value.startsWith(originalName);
  });
}

/**
* Get list of objects by original name list
* - If item does not exist, automatically skip (do not throw)
* @param items - Array of objects
* @param key - Field name to compare (eg 'eventMasterName')
* @param originalNames - Array of original names (no timestamp)
* @returns Array of found objects
 */
export function getItemsByOriginalNames<T extends BaseData>(
  items: T[],
  key: keyof T,
  originalNames: string[]
): T[] {
  return originalNames
    .map(name => findItemByOriginalName(items, key, name))
    .filter((item): item is T => item !== undefined);
}
