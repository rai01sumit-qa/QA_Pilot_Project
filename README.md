# QA Pilot Project — Retail Width Checks API & Browser Compatibility

[![Playwright Tests](https://github.com/rai01sumit-qa/QA_Pilot_Project/actions/workflows/playwright.yml/badge.svg)](https://github.com/rai01sumit-qa/QA_Pilot_Project/actions/workflows/playwright.yml)

Playwright + TypeScript test suite for the **Retail Width Checks** endpoint, including API validation and cross-browser compatibility testing.

---

## Endpoint Under Test

```
https://modular.flix360.io/clamps/modularvnew/RetailWidthChecks.html
```

| Parameter | Description              | Example            |
|-----------|--------------------------|--------------------|
| `mpn`     | Manufacturer Part Number | `TU55M72HBUXNA`    |
| `ean`     | European Article Number  | `123`              |
| `distId`  | Distributor ID           | `6`                |
| `iso`     | ISO language code        | `da`               |
| `flIso`   | Formatted ISO code       | `54eddjhdgcvbvc`   |

---

## Project Structure

```
QA_Pilot_Project/
│
├── tests/
│   ├── Api_test/                        # API test spec files (one per test case)
│   │   ├── TC-001_valid_request.spec.ts
│   │   ├── TC-002_response_time.spec.ts
│   │   ├── TC-003_missing_mpn.spec.ts
│   │   ├── TC-004_missing_ean.spec.ts
│   │   ├── TC-005_invalid_distid.spec.ts
│   │   ├── TC-006_invalid_iso.spec.ts
│   │   ├── TC-007_sql_injection.spec.ts
│   │   ├── TC-008_xss_injection.spec.ts
│   │   ├── TC-009_empty_params.spec.ts
│   │   └── TC-010_https_enforcement.spec.ts
│   │
│   └── Compatibility/                   # Browser & device compatibility tests
│       ├── TC-C001_desktop_browser_compatibility.spec.ts
│       ├── TC-C002_mobile_device_compatibility.spec.ts
│       ├── TC-C003_tablet_device_compatibility.spec.ts
│       ├── TC-C004_viewport_responsive_layout.spec.ts
│       └── TC-C005_accessibility_web_vitals.spec.ts
│
├── utils/                               # Utilities and custom reporter
│   ├── api-utils.ts                    # API helpers & assertion utilities
│   └── CustomReporter.ts               # Custom HTML + JSON test reporter
│                                         with screenshots, videos & traces
│
├── reports/                             # Generated test reports (git-ignored output)
│   ├── custom/                         # Custom HTML + JSON report
│   │   ├── index.html                  # Categorized test report with media
│   │   └── results.json                # Machine-readable test results
│   ├── html/                           # Playwright HTML report
│   ├── json/                           # Playwright JSON results
│   └── junit-results.xml               # JUnit XML (CI systems)
│
├── .github/
│   └── workflows/
│       └── playwright.yml              # GitHub Actions CI workflow
│
├── docs/                                # Additional project documentation
├── config/                              # Environment / configuration files
├── test-results/                        # Playwright trace zips, screenshots & videos
│
├── playwright.config.ts                 # Playwright configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Node.js dependencies and scripts
└── README.md                            # This file
```

---

## Test Cases

### API Tests

| ID      | File                                   | Category    | Description                                               |
|---------|----------------------------------------|-------------|-----------------------------------------------------------|
| TC-001  | `TC-001_valid_request.spec.ts`         | Functional  | Valid request with all parameters returns 200             |
| TC-002  | `TC-002_response_time.spec.ts`         | Performance | Response time is under 3000ms                             |
| TC-003  | `TC-003_missing_mpn.spec.ts`           | Negative    | Missing `mpn` — server must not crash                     |
| TC-004  | `TC-004_missing_ean.spec.ts`           | Negative    | Missing `ean` — server must not crash                     |
| TC-005  | `TC-005_invalid_distid.spec.ts`        | Negative    | Non-numeric `distId` — server must not crash              |
| TC-006  | `TC-006_invalid_iso.spec.ts`           | Negative    | Invalid ISO code — no 5xx error                           |
| TC-007  | `TC-007_sql_injection.spec.ts`         | Security    | SQL injection in `mpn` is sanitised                       |
| TC-008  | `TC-008_xss_injection.spec.ts`         | Security    | XSS payload in `mpn` is not reflected in response         |
| TC-009  | `TC-009_empty_params.spec.ts`          | Negative    | Empty string values for all params — server must not crash|
| TC-010  | `TC-010_https_enforcement.spec.ts`     | Security    | Endpoint is served over HTTPS                             |

### Compatibility Tests

| ID        | File                                             | Category       | Description                                          |
|-----------|--------------------------------------------------|----------------|------------------------------------------------------|
| TC-C001   | `TC-C001_desktop_browser_compatibility.spec.ts`  | Compatibility  | Desktop browser compatibility (Chrome, Firefox, etc.)|
| TC-C002   | `TC-C002_mobile_device_compatibility.spec.ts`    | Compatibility  | Mobile device compatibility (iPhone, Pixel, Galaxy)  |
| TC-C003   | `TC-C003_tablet_device_compatibility.spec.ts`    | Compatibility  | Tablet device compatibility (iPad, Galaxy Tab)       |
| TC-C004   | `TC-C004_viewport_responsive_layout.spec.ts`     | Compatibility  | Responsive layout across breakpoints (320px–1920px)  |
| TC-C005   | `TC-C005_accessibility_web_vitals.spec.ts`       | Accessibility  | Accessibility checks & Core Web Vitals (LCP, CLS)    |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/rai01sumit-qa/QA_Pilot_Project.git
cd QA_Pilot_Project

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install
```

---

## Running Tests

### Run All Tests

```bash
# Run all test suites (API + Compatibility)
npm test
```

### Run API Tests Only

```bash
# Run API test suite
npx playwright test --project=retail-width-checks

# Run a single API test file
npx playwright test tests/Api_test/TC-001_valid_request.spec.ts
```

### Run Compatibility Tests Only

```bash
# Run all compatibility tests
npx playwright test --project=compatibility

# Run specific compatibility test file
npx playwright test tests/Compatibility/TC-C001_desktop_browser_compatibility.spec.ts
```

### Run by Category or Keyword

```bash
# Run by grep keyword
npx playwright test --grep "Security"
npx playwright test --grep "Negative"
npx playwright test --grep "Performance"

# Run in headed mode (browser visible)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

---

## Viewing Reports

After running tests, the custom HTML report is automatically generated with embedded media:

### Custom HTML Report (Recommended) ⭐

Categorized report with summary stats, per-test details, screenshots, videos & traces:

```bash
# Open directly (auto-generated after test run)
Start-Process reports/custom/index.html   # Windows PowerShell
open reports/custom/index.html            # macOS
xdg-open reports/custom/index.html       # Linux
```

**Features:**
- 📊 Visual summary with pass rate
- 🎯 Tests grouped by category (Functional, Security, Negative, Performance, Compatibility, Accessibility)
- ⏱️ Duration tracking for each test
- 🎨 Color-coded status badges
- 🖼️ **Screenshots** — Inline image viewer for every test step
- 🎥 **Videos** — Playable HTML5 video player with controls
- 🔍 **Traces** — Playwright trace files with CLI command to view
- 📱 Responsive design

### JSON Report

Machine-readable format for CI/CD integration:

- **Location:** `reports/custom/results.json`
- **Contains:** Test summary, individual test results, timestamps, durations, media paths

| Format          | Location                      | Use Case                   |
|-----------------|-------------------------------|----------------------------|
| Custom HTML     | `reports/custom/index.html`   | Daily test review          |
| JSON            | `reports/custom/results.json` | CI/CD integration          |
| JUnit XML       | `reports/junit-results.xml`   | CI systems (Jenkins, etc.) |

---

## Artifacts & Media Capture

The custom reporter automatically captures and embeds the following artifacts for every test:

| Artifact    | Config Setting           | Displayed In Report        |
|-------------|--------------------------|----------------------------|
| Screenshots | `screenshot: 'on'`       | Inline image viewer        |
| Videos      | `video: 'on'`            | HTML5 video player         |
| Traces      | `trace: 'on'`            | File path + CLI command    |

> **Note:** Screenshots and videos are captured for browser-based tests (Compatibility suite). API tests using the `{ request }` fixture do not generate screenshots/videos as they run without a browser page.

---

## CI/CD — GitHub Actions

Tests run automatically on every push and pull request to `main` / `master` via GitHub Actions.

**Workflow file:** [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)

| Trigger        | Branches           | Action                                      |
|----------------|--------------------|---------------------------------------------|
| `push`         | `main`, `master`   | Install deps → install browsers → run tests |
| `pull_request` | `main`, `master`   | Install deps → install browsers → run tests |

After each run, the Playwright HTML report is uploaded as a workflow artifact (`playwright-report`) and retained for **30 days**. You can download it directly from the GitHub Actions run summary page.

---

## npm Scripts

| Script           | Description                                          |
|------------------|------------------------------------------------------|
| `npm test`       | Run all tests with custom reporter                   |
| `npm run report` | Open custom HTML report in browser                   |

---

## Known API Findings

The following issues were surfaced during testing and should be raised with the backend team:

| Finding                     | Test   | Detail                                                    |
|-----------------------------|--------|-----------------------------------------------------------|
| Missing `mpn` accepted      | TC-003 | Server returns 200 instead of 400 when `mpn` is omitted  |
| Missing `ean` accepted      | TC-004 | Server returns 200 instead of 400 when `ean` is omitted  |
| Invalid `distId` accepted   | TC-005 | Server returns 200 for non-numeric `distId`               |
| Empty values accepted       | TC-009 | Server returns 200 when all parameter values are empty    |

---

## Tech Stack

| Tool       | Version  | Purpose                                     |
|------------|----------|---------------------------------------------|
| Playwright | ^1.47.0  | API & UI test runner, browser automation    |
| TypeScript | ^5.5.0   | Type-safe test authoring                    |
| Node.js    | v18+     | Runtime                                     |

---

## Repository

[https://github.com/rai01sumit-qa/QA_Pilot_Project](https://github.com/rai01sumit-qa/QA_Pilot_Project)

---

*Last updated: September 20, 2026*
