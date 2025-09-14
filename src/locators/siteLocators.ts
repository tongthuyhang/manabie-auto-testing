export const SiteLocators = {
  HEADER: 'id=oneHeader',
  POPUP: 'one-record-action-flexipage',
  NAVIGATE_APP: 'css=.slds-button.slds-context-bar__button.slds-icon-waffle_container.slds-show',
  APP_LAUNCHER: 'css=input[placeholder="Search apps and items..."]',
  EVENT_MASTER_TITLE: 'css=h1.slds-var-p-right_x-small >> nth=0',
  BUTTON_NEW: 'role=button[name="New"]',
  BUTTON_NEXT: 'role=button[name="Next"]',
  BUTTON_SAVE: 'role=button[name="Save"]',
  HEADER_PRIMARY_FIELD: '.slds-page-header__title.slds-m-right--small.slds-align-middle.slds-line-clamp.clip-text lightning-formatted-text',
  HEADER_SECONDARY_FIELD: 'div.maincontent'
} as const;