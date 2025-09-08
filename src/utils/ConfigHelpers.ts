import * as fs from 'fs';
import * as path from 'path';
import { CommonConstants } from '../constants/commonConstants';
import { JsonHelper } from './JsonHelper';
import { UserConstants } from '../constants/userConstants';


export interface User {
  username: string;
  password: string;
}

export async function loadConfig(env: string = CommonConstants.STAGING): Promise<void> {
  // Load environment-specific config file
  const envFile = path.join(process.cwd(), 'src/config', `${env.trim()}.env`);
  if (fs.existsSync(envFile)) {
    await loadEnvFile(envFile);
  } else {
    throw new Error(`Environment config file not found: ${envFile}.`);
  }

  // Load QASE config file
  const qaseFile = path.join(process.cwd(), 'src/config', 'qase.env');
  if (fs.existsSync(qaseFile)) {
    await loadEnvFile(qaseFile);
  }
}


export async function loadUserByEnv(
  env: string = CommonConstants.STAGING,
  userType: string = UserConstants.USR_DEFAULT
): Promise<User> {
  const jsonData = await JsonHelper.loadJsonFromFile(UserConstants.USER_JSON_PATH);
  const dataByEnv = jsonData[env.trim()];
  
  if (!dataByEnv) {
    throw new Error(`❌ Data for environment '${env}' not found in ${UserConstants.USER_JSON_PATH}.`);
  }

  const normalizedUserType = userType.trim().toLowerCase();
  const userInfo = dataByEnv[normalizedUserType];

  if (!userInfo) {
    throw new Error(`❌ User type '${userType}' not found in env '${env}'. Available users: ${Object.keys(dataByEnv).join(", ")}`);
  }

  return userInfo;
}


async function loadEnvFile(filePath: string): Promise<void> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, value] = trimmedLine.split('=', 2);
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}