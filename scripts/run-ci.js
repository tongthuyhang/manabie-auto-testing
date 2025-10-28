#!/usr/bin/env node
/**
 * CI test runner for Playwright + QASE integration
 * Supports env variables:
 * ENV, PROJECT, TAG, QASE_MODE, QASE_TESTOPS_API_TOKEN, QASE_TESTOPS_PROJECT
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(msg) {
  console.log(`\x1b[36m${msg}\x1b[0m`);
}

function run(cmd, opts = {}) {
  log(`> ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', ...opts });
  } catch (err) {
    console.warn(`⚠️ Command failed: ${cmd}`);
  }
}

// ---------- STEP 1. Collect envs ----------
const ENV = process.env.ENV || 'dev-staging';
const PROJECT = process.env.PROJECT || 'scheduling';
const TAG = process.env.TAG || '@Smoke';
const QASE_MODE = process.env.QASE_MODE || 'testops';
const QASE_API_TOKEN = process.env.QASE_TESTOPS_API_TOKEN || '';
const QASE_PROJECT = process.env.QASE_TESTOPS_PROJECT || PROJECT;

const timestamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
const RUN_TITLE = `${PROJECT}-${ENV}-${timestamp}`;

process.env.QASE_TESTOPS_RUN_TITLE = RUN_TITLE;
process.env.QASE_TESTOPS_PROJECT = QASE_PROJECT;
process.env.QASE_CAPTURE_LOGS = 'false';

// ---------- STEP 2. Show summary ----------
console.log('\n=== 🧪 Test Run Configuration ===');
console.log(`ENVIRONMENT : ${ENV}`);
console.log(`PROJECT     : ${PROJECT}`);
console.log(`TAG         : ${TAG}`);
console.log(`RUN_TITLE   : ${RUN_TITLE}`);
console.log(`QASE_PROJECT: ${QASE_PROJECT}`);
console.log('=================================\n');

// ---------- STEP 3. Run Playwright ----------
try {
  if (TAG === '@All') {
    run(`npx playwright test --project=${PROJECT}`);
  } else {
    run(`npx playwright test --project=${PROJECT} --grep ${TAG}`);
  }
} catch (err) {
  console.error('❌ Playwright tests failed');
}

// ---------- STEP 4. Collect reports ----------
const outputDir = path.resolve(`artifacts/${PROJECT}-${ENV}-${timestamp}`);
fs.mkdirSync(outputDir, { recursive: true });

const sources = [
  'playwright-report',
  '.playwright-report',
  'test-results',
  'test-results.json',
  'test-logs.json',
].filter((p) => fs.existsSync(p));

if (sources.length === 0) {
  console.warn('⚠️ No report folders found');
} else {
  for (const src of sources) {
    const dest = path.join(outputDir, path.basename(src));
    run(`cp -r ${src} ${dest}`);
  }
}

// ---------- STEP 5. Zip artifacts ----------
run(`cd artifacts && zip -r ${PROJECT}-${ENV}-${timestamp}.zip ${PROJECT}-${ENV}-${timestamp}`);

// ---------- STEP 6. (Optional) Upload to QASE via API ----------
if (QASE_API_TOKEN) {
  try {
    const uploadCmd = `npx qase-cli attachments upload --token=${QASE_API_TOKEN} --project=${QASE_PROJECT} artifacts/${PROJECT}-${ENV}-${timestamp}.zip`;
    run(uploadCmd);
  } catch (e) {
    console.warn('⚠️ Upload to QASE failed');
  }
}

console.log(`✅ Done. Artifacts saved at: artifacts/${PROJECT}-${ENV}-${timestamp}.zip`);
