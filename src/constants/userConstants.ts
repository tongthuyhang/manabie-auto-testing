export const UserConstants = {
  USR_DEFAULT: 'admin',
  USR_INVALID: 'invalid_user',
  //USR_STAGING: 'user_staging',
  USER_JSON_PATH: 'src/data/users.json',
} as const;

export type UserType = keyof typeof UserConstants;