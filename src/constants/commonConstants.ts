export const CommonConstants = {
  EMPTY_VALUE: '',
  SITE_TITLE: 'Lightning Experience',
  STAGING: 'dev-staging',
  PRE_PROD: 'pre-prod',
  PAGE_EVENT_MASTER: 'event',
  PAGE_LESSONS: 'lession',
  PAGE_TIMESHEET: 'timesheet',
} as const;

export type Environment = typeof CommonConstants.STAGING | typeof CommonConstants.PRE_PROD;