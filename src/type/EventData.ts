/**
 * EventData Type Definition
 * 
 * This type ensures type safety and consistency across the entire test framework
 * when working with Event Master data.
 * 
 * @example Usage in Page Objects:
 * ```typescript
 * export class EventPage extends BasePage {
 *   async fillEventMasterForm(data: EventData): Promise<void> {
 *     await this.type(this.inputEventName, data.eventMasterName); // ✅ TypeScript knows this property exists
 *     await this.selectFromDropdown(this.selectEventType, data.eventType);
 *   }
 * }
 * ```
 * 
 * @example Usage in Test Data:
 * ```typescript
 * const testEvent: EventData = {
 *   eventMasterName: 'Demo Event',
 *   eventType: 'Meeting',
 *   sendTo: 'All Students',
 *   reminder: 5,
 *   maxEventPerStudent: 10
 * }; // ✅ TypeScript validates all required properties
 * ```
 * 
 * 🎯 Why We Need EventData Type:
 * 
 * 1. **Type Safety** 🛡️
 *    - Prevents runtime errors by catching type mismatches at compile time
 *    - Ensures all required properties are provided
 *    - Validates property types (string, number, etc.)
 * 
 * 2. **Developer Experience** 💡
 *    - IntelliSense/Autocomplete in IDE shows available properties
 *    - Immediate feedback on typos or missing properties
 *    - Better code navigation and refactoring support
 * 
 * 3. **Code Consistency** 📋
 *    - Standardizes event data structure across all files
 *    - Ensures same property names everywhere
 *    - Prevents inconsistent data handling
 * 
 * 4. **Maintainability** 🔧
 *    - Single source of truth for event structure
 *    - Easy to add/remove/modify properties
 *    - TypeScript automatically checks all usages when type changes
 * 
 * ❌ Without EventData type:
 * ```typescript
 * // Prone to errors - no type checking
 * async fillForm(data: any) {
 *   await this.type(this.inputName, data.eventName); // ❌ Wrong property name
 *   await this.type(this.inputReminder, data.reminder.toString()); // ❌ Might be undefined
 * }
 * ```
 * 
 * ✅ With EventData type:
 * ```typescript
 * // Type-safe and reliable
 * async fillEventMasterForm(data: EventData): Promise<void> {
 *   await this.type(this.inputEventName, data.eventMasterName); // ✅ Correct property
 *   await this.type(this.inputReminder, data.reminder.toString()); // ✅ Guaranteed to exist
 * }
 * ```
 */
export type EventData = {
  /** The name of the event master (required, max 80 characters) */
  eventMasterName: string;
  
  /** Type of event (Meeting, Workshop, Seminar, etc.) */
  eventType: string;
  
  /** Target audience for the event (All Students, Selected Students, etc.) */
  sendTo: string;
  
  /** Number of reminder notifications (0-999) */
  reminder: number;
  
  /** Maximum events per student (1-100) */
  maxEventPerStudent: number;
};