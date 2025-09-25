export const SiteLocators = {
  URL_IMPORT: '**/one/**',
  HEADER: 'id=oneHeader',
  IFRAME: 'iframe[title="accessibility title"]',
  POPUP: 'one-record-action-flexipage',
  //button
  BUTTON_NEXT_IMPORT: 'a:has-text("Next")',
  BUTTON_PREVIOUS_IMPORT: 'a:has-text("Previous")',
  BUTTON_CANCEL_IMPORT: 'a:has-text("Cancel")',
  BUTTON_ADD_NEW_RECORDS: 'Add new records',
  APP_LAUNCHER: 'css=input[placeholder="Search apps and items..."]',
  //header
  HEADER_PRIMARY_FIELD: '.slds-page-header__title.slds-m-right--small.slds-align-middle.slds-line-clamp.clip-text lightning-formatted-text',
  HEADER_SECONDARY_FIELD: 'div.maincontent',
  //input fields
  INPUT_SEARCH: 'Search this list...',
  //label fiels
  LABEL_CHARACTER_CODE: 'Character Code'
} as const;