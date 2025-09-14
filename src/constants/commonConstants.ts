export const CommonConstants = {
  EMPTY_VALUE: '',
  FAIL_STATUS: 'failed',
  PASS_STATUS: 'passed',
  SITE_TITLE: 'Lightning Experience',
  STAGING: 'dev-staging',
  PRE_PROD: 'pre-prod',
  PAGE_EVENT_MASTER: 'event',
  PAGE_LESSONS: 'lession',
  PAGE_TIMESHEET: 'timesheet',
} as const;

export type TestStatus = typeof CommonConstants.PASS_STATUS | typeof CommonConstants.FAIL_STATUS;
export type Environment = typeof CommonConstants.STAGING | typeof CommonConstants.PRE_PROD;