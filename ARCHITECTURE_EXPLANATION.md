# Why EventData Type vs Interface in EventPage?

## 🤔 **The Question:**
"We can create interface in EventPage but why do we just need EventData?"

## 🎯 **The Answer:**

### **❌ Interface in EventPage (Not Recommended):**
```typescript
// EventPage.ts
export class EventPage extends BasePage {
  // This would be BAD architecture
  interface EventFormData {
    eventMasterName: string;
    eventType: string;
    sendTo: string;
  }
  
  async fillForm(data: EventFormData) { ... }
}
```

### **✅ Separate EventData Type (Recommended):**
```typescript
// EventData.ts
export type EventData = {
  eventMasterName: string;
  eventType: string;
  sendTo: string;
  reminder: number;
  maxEventPerStudent: number;
};

// EventPage.ts
import { EventData } from '../type/EventData';
export class EventPage extends BasePage {
  async fillEventMasterForm(data: EventData) { ... }
}
```

## 🏗️ **Architectural Benefits:**

### **1. Separation of Concerns 📋**
- **EventData**: Defines WHAT the data structure is
- **EventPage**: Defines HOW to interact with the page
- **EventMasterFacade**: Defines WHAT business operations to perform

### **2. Reusability Across Multiple Files 🔄**
```typescript
// ✅ EventData can be used everywhere
import { EventData } from '@src/type/EventData';

// In Page Object
export class EventPage extends BasePage {
  async fillForm(data: EventData) { ... }
}

// In Facade
export class EventMasterFacade {
  async createEvent(data: EventData) { ... }
}

// In Tests
test('Create event', async ({ page }) => {
  const eventData: EventData = { ... };
  await EventMasterFacade.createAndVerifyEvent(eventData);
});

// In Test Data Helper
export class TestDataHelper {
  static getEventData(name: string): EventData { ... }
}
```

### **3. Single Source of Truth 🎯**
```typescript
// ❌ With interface in EventPage - Multiple definitions
// EventPage.ts
interface EventFormData { eventMasterName: string; }

// EventMasterFacade.ts  
interface EventInfo { eventMasterName: string; } // Duplicate!

// Tests
interface TestEventData { eventMasterName: string; } // Another duplicate!

// ✅ With separate EventData - One definition
// EventData.ts
export type EventData = { eventMasterName: string; }

// Used everywhere consistently
```

### **4. Domain-Driven Design 🏛️**
```typescript
// EventData represents a DOMAIN CONCEPT (business entity)
// It's not tied to any specific UI implementation

// This allows the same data structure to be used for:
// - Web UI testing (EventPage)
// - API testing (EventAPI)
// - Mobile testing (EventMobilePage)
// - Database validation (EventDB)
```

### **5. Testability & Mocking 🧪**
```typescript
// ✅ Easy to create test data
const mockEventData: EventData = {
  eventMasterName: 'Test Event',
  eventType: 'Meeting',
  sendTo: 'All Students',
  reminder: 5,
  maxEventPerStudent: 10
};

// ✅ Easy to validate in different contexts
function validateEventData(data: EventData): boolean {
  return data.eventMasterName.length <= 80;
}
```

### **6. Future-Proof Architecture 🚀**
```typescript
// If you need to add new pages or components:

// EventEditPage.ts
export class EventEditPage extends BasePage {
  async updateEvent(data: EventData) { ... } // Same type!
}

// EventListPage.ts  
export class EventListPage extends BasePage {
  async getEventData(name: string): EventData { ... } // Same type!
}

// EventAPI.ts
export class EventAPI {
  async createEvent(data: EventData): Promise<EventData> { ... } // Same type!
}
```

## 🔄 **Real-World Comparison:**

### **❌ Interface in EventPage Approach:**
```typescript
// EventPage.ts - Tightly coupled
export class EventPage extends BasePage {
  interface LocalEventData { name: string; }
  async fillForm(data: LocalEventData) { ... }
}

// EventMasterFacade.ts - Has to duplicate or import from page
export class EventMasterFacade {
  // Option 1: Duplicate (BAD)
  interface EventData { name: string; }
  
  // Option 2: Import from page (WEIRD)
  import { EventPage } from '../pages/EventPage';
  async create(data: EventPage.LocalEventData) { ... } // Awkward!
}
```

### **✅ Separate EventData Approach:**
```typescript
// EventData.ts - Clean, focused
export type EventData = { eventMasterName: string; };

// EventPage.ts - Focused on UI interactions
import { EventData } from '../type/EventData';
export class EventPage extends BasePage {
  async fillEventMasterForm(data: EventData) { ... }
}

// EventMasterFacade.ts - Focused on business logic
import { EventData } from '../type/EventData';
export class EventMasterFacade {
  async createAndVerifyEvent(data: EventData) { ... }
}
```

## 🎯 **Summary:**

**EventData as a separate type is better because:**

1. **🔄 Reusable** - Used across pages, facades, tests, and utilities
2. **📋 Focused** - Each file has a single responsibility
3. **🎯 Consistent** - One definition prevents inconsistencies
4. **🚀 Scalable** - Easy to extend and maintain
5. **🧪 Testable** - Simple to mock and validate
6. **🏛️ Clean Architecture** - Follows domain-driven design principles

**The EventPage should focus on HOW to interact with the UI, while EventData defines WHAT the data structure looks like.**