import {FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    //await QaseReporterManager.completeRun();
  console.log("afterAll");

  console.log('✅ Global teardown done. (No browser to close, Playwright auto manages it)');

}

export default globalTeardown;