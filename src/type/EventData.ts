// types/EventData.ts

/**
 * Benefits of defining a Type:
 *
 * 1. Autocomplete & IntelliSense in the editor: you will see properties like 
 *    eventMasterName, eventType, etc., while coding.
 * 2. Compile-time safety: TypeScript will detect errors early, without having 
 *    to run the tests to find mistakes.
 * 3. Easier maintenance: if the event structure changes, you only need to update 
 *    the type, and TypeScript will check all usages across your code.
 */
export type EventData = {
  eventMasterName: string;
  eventType: string;
  sendTo: string;
  reminder: number;
  maxEventPerStudent: number;
};