
// ConfigHelpers.ts
import * as fs from 'fs';
import * as path from 'path';
import { CommonConstants } from "../constants/commonConstants";
import { loadJsonFromFile } from "./jsonHelper";
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
  userType: string = process.env.USER_TYPE || UserConstants.USR_DEFAULT // ✅ fallback cho USER_TYPE
): Promise<User> {
  const jsonData = await loadJsonFromFile(UserConstants.USER_JSON_PATH);
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

/**
 * 🧠 Lấy alias Salesforce theo ENV + ROLE
 * Ưu tiên alias có envType + type + status = Connected
 * Fallback nếu không có alias khớp.
 */
interface OrgEntry {
  alias: string;
  connectedStatus: string;
  instanceUrl?: string;
  [key: string]: any;
}

export function getOrgAlias(alias?: string, env?: string): string {
  const ENV = (env || process.env.ENV || 'dev-staging').trim();
  const orgListPath = path.resolve(process.cwd(), 'src','config', 'orgList.json');

  // 1. Check orgList.json existence
  if (!fs.existsSync(orgListPath)) {
    console.warn(`⚠️ orgList.json not found at ${orgListPath}. Falling back to default alias 'myOrgAlias'`);
    return 'myOrgAlias';
  }

  // 2. Read and clean file
  let parsed: any;
  try {
    const raw = fs.readFileSync(orgListPath, 'utf8');
    const cleaned = raw.replace(/[\x00-\x1F\x7F]+/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse orgList.json: ${(err as Error).message}`);
  }

  // 3. Flatten org entries
  const result = parsed.result || {};
  const orgGroups = ['other', 'nonScratchOrgs', 'devHubs', 'sandboxes', 'scratchOrgs'];
  const allOrgs: OrgEntry[] = orgGroups.flatMap((k) => Array.isArray(result[k]) ? result[k] : []);

  // Helper for alias lookup
  const normalize = (a?: string) => (a || '').trim().toLowerCase();

  // 4. Look up by explicit alias
  if (alias) {
    const requested = normalize(alias);
    const found = allOrgs.find(o => normalize(o.alias) === requested);
    if (found && found.connectedStatus === 'Connected') {
      console.log(`✅ Using provided alias: ${found.alias}`);
      return found.alias.trim();
    }
    console.warn(`⚠️ Provided alias '${alias}' not found/connected in orgList.json`);
  }

  // 5. Look up by ENV in instanceUrl
  const envLower = ENV.toLowerCase();
  const byEnv = allOrgs.filter(o => (o.instanceUrl || '').toLowerCase().includes(envLower) && o.connectedStatus === 'Connected');
  if (byEnv.length > 0) {
    console.log(`✅ Auto-selected alias for ENV='${ENV}': ${byEnv[0].alias}`);
    return byEnv[0].alias.trim();
  }

  // 6. Fallback: first connected org
  const firstConnected = allOrgs.find(o => o.connectedStatus === 'Connected');
  if (firstConnected) {
    console.log(`✅ Fallback alias: ${firstConnected.alias}`);
    return firstConnected.alias.trim();
  }

  // 7. Final fallback
  console.warn(`⚠️ No connected orgs found in orgList.json — using default alias 'myOrgAlias'`);
  return 'myOrgAlias';
}

