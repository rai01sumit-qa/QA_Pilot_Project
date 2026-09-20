import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Root directory for all test specs
  testDir: './tests',

  // Run each test file in parallel
  fullyParallel: true,

  // Fail CI build if test.only is accidentally committed
  forbidOnly: !!process.env.CI,

  // Retry failed tests once locally, twice on CI
  retries: process.env.CI ? 2 : 1,

  // Number of parallel workers (auto on CI, 4 locally)
  workers: process.env.CI ? undefined : 4,

  // Global test timeout
  timeout: 30_000,

  // Assertion timeout
  expect: {
    timeout: 10_000,
  },

  // ─── Reporters ──────────────────────────────────────────────────────────────
  reporter: [
    ['list'],                                                      // console output
    ['./utils/CustomReporter.ts'],                                // custom HTML + JSON
    ['json', { outputFile: 'reports/json/results.json' }],       // JSON report
    ['junit', { outputFile: 'reports/junit-results.xml' }],      // JUnit (CI)
  ],

  // ─── Shared request context settings ────────────────────────────────────────
  use: {
    // Base URL — all tests use relative paths from here
    baseURL: 'https://modular.flix360.io',

    // Default headers for every API request
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    // Capture trace for EVERY test (shows full request/response lifecycle)
    trace: 'on',

    // Capture screenshot for EVERY test
    screenshot: 'on',

    // Capture video for EVERY test
    video: 'on',

    // Enforce strict HTTPS — do not silently accept bad certs
    ignoreHTTPSErrors: false,
  },

  // ─── Test projects ───────────────────────────────────────────────────────────
  projects: [
    {
      name: 'retail-width-checks',
      testDir: './tests/Api_test',
    },
    {
      name: 'compatibility',
      testDir: './tests/Compatibility',
    },
  ],
});
