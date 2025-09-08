export const EventLocators = {
  TITLE_MASTER_EVENT: 'css=[class="header slds-modal__title slds-hyphenate slds-text-heading_medium"]',
  INPUT_EVENT_MASTER_NAME: '[name="Name"]',
  SELECT_EVENT_TYPE: 'button[aria-label="Event Type"]',
  SELECT_SEND_TO: 'button[aria-label="Send To"]',
  INPUT_REMINDERS: '[name=MANAERP__Reminders__c]',
  INPUT_MAX_EVENT_PER_STUDENT: '[name=MANAERP__Max_Event_Per_Student__c]',
  LABEL_WHO_CAN_RESERVE: 'Who Can Reserve',
  INPUT_EVENT_MASTER_SEARCH: '[name="Event Master-search-input"]'
} as const;