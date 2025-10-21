import { Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { loadUserByEnv } from "./configHelpers";

export async function LoginAction(page: Page, userType: string) {
  const loginPage = new LoginPage(page);
  const userInfo = await loadUserByEnv(process.env.ENV,userType);

  await page.goto(process.env.PAGE_URL as string);
  console.log(`📝 UserInfo loaded:`, JSON.stringify(userInfo, null, 2));

  if (!userInfo || !userInfo.username || !userInfo.password) {
    throw new Error(`❌ Invalid user data for ENV=${process.env.ENV}, USER_TYPE=${userType}`);
  }
  console.log(`🔑 Logging in as ${userType} (${userInfo.username})`);
  await loginPage.login(userInfo.username, userInfo.password);

}
