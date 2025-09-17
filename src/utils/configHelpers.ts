// ConfigHelpers.ts

import * as fs from "fs";
import * as path from "path";
import { CommonConstants } from "../constants/commonConstants";
import { JsonHelper } from "./JsonHelper";
import { UserConstants } from "../constants/userConstants";
import * as dotenv from "dotenv";

export interface User {
  username: string;
  password: string;
}

/**
 * Load environment-specific .env file (staging, pre-prod, …)
 */
export async function loadConfig(
  env: string = CommonConstants.STAGING
): Promise<void> {
  const filePath = path.resolve(__dirname, "..", "config", `${env.trim()}.env`);
  console.log(`🌍 Loading environment config: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Environment config file not found: ${filePath}`);
  }

  const result = dotenv.config({ path: filePath });
  if (result.error) {
    throw new Error(`❌ Failed to load env file: ${filePath}. Error: ${result.error}`);
  }

  console.log(`✅ Loaded environment config: ${filePath}`);
}

/**
 * Load user info by environment + userType
 */
export async function loadUserByEnv(
  env: string = CommonConstants.STAGING,
  userType: string = UserConstants.USR_DEFAULT
): Promise<User> {
  const jsonData = await JsonHelper.loadJsonFromFile(UserConstants.USER_JSON_PATH);
  const dataByEnv = jsonData[env.trim()];

  if (!dataByEnv) {
    throw new Error(
      `❌ Data for environment '${env}' not found in ${UserConstants.USER_JSON_PATH}.`
    );
  }

  const normalizedUserType = userType.trim().toLowerCase();
  const userInfo = dataByEnv[normalizedUserType];

  if (!userInfo) {
    throw new Error(
      `❌ User type '${userType}' not found in env '${env}'. Available users: ${Object.keys(
        dataByEnv
      ).join(", ")}`
    );
  }

  return userInfo;
}
