import { Page, Locator } from '@playwright/test';
import { LoginLocators } from '../locators/loginLocators';

export class LoginPage {
  readonly page: Page;
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly buttonLogin: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inputUsername= page.locator(LoginLocators.FIELD_USERNAME);
    this.inputPassword = page.locator(LoginLocators.FIELD_PASSWORD);
    this.buttonLogin = page.locator(LoginLocators.BUTTON_LOGIN);
  }

  async login(username: string, password: string) {
    await this.inputUsername.fill(username);
    await this.inputPassword.fill(password);
    await this.buttonLogin.click();
  }
}

