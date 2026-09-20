import { test, expect } from '@playwright/test';

/**
 * TC-C001: Desktop Browser Compatibility
 *
 * Verifies that the RetailWidthChecks page loads correctly and renders its
 * core UI elements across all desktop browsers (Chrome, Firefox, Safari, Edge).
 *
 * These tests run against the projects defined in playwright.config.ts:
 *   - Desktop Chrome
 *   - Desktop Firefox
 *   - Desktop Safari
 *   - Desktop Edge
 *
 * Artifacts captured per test:
 *   - Screenshots at each meaningful step  (screenshot: 'on' in config)
 *   - Full video recording                 (video: { mode: 'on' } in config)
 *   - Full trace with network + DOM        (trace: 'on' in config)
 *
 * URL: https://modular.flix360.io/clamps/modularvnew/RetailWidthChecks.html
 */

const PAGE_URL     = '/clamps/modularvnew/RetailWidthChecks.html';
const VALID_PARAMS = '?mpn=TU55M72HBUXNA&ean=123&distId=6&iso=da&flIso=54eddjhdgcvbvc';

test.describe('TC-C001 | Desktop Browser Compatibility', () => {

  // ─── TC-C001-01: Page loads with HTTP 200 ─────────────────────────────────
  test('TC-C001-01 | Page returns HTTP 200 on desktop', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-01_before_navigation.png', fullPage: true });

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('RetailWidthChecks.html')),
      page.goto(`${PAGE_URL}${VALID_PARAMS}`),
    ]);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-01_page_loaded.png', fullPage: true });

    expect(
      response.status(),
      `Expected 200 but received ${response.status()}`
    ).toBe(200);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-01_assertion_passed.png', fullPage: true });
  });

  // ─── TC-C001-02: Page title is present ────────────────────────────────────
  test('TC-C001-02 | Page has a valid document title', async ({ page }) => {
    await page.goto(`${PAGE_URL}${VALID_PARAMS}`);
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-02_page_loaded.png', fullPage: true });

    const title = await page.title();
    expect(title.length, 'Page title should not be empty').toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-02_title_verified.png', fullPage: true });
  });

  // ─── TC-C001-03: Core layout sections are rendered ────────────────────────
  test('TC-C001-03 | Core page sections are visible', async ({ page }) => {
    await page.goto(`${PAGE_URL}${VALID_PARAMS}`);
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-03_initial_load.png', fullPage: true });

    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-03_body_visible.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(
      bodyText.trim().length,
      'Page body should not be empty'
    ).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-03_content_verified.png', fullPage: true });
  });

  // ─── TC-C001-04: No JavaScript console errors on load ─────────────────────
  test('TC-C001-04 | No critical JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(`${PAGE_URL}${VALID_PARAMS}`);
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-04_page_loaded.png', fullPage: true });

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('net::ERR_BLOCKED_BY_CLIENT')
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-04_errors_checked.png', fullPage: true });

    expect(
      criticalErrors,
      `Critical JS errors detected: ${criticalErrors.join(', ')}`
    ).toHaveLength(0);
  });

  // ─── TC-C001-05: Page loads within acceptable time ────────────────────────
  test('TC-C001-05 | Page loads within 10 seconds on desktop', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${PAGE_URL}${VALID_PARAMS}`, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-05_loaded.png', fullPage: true });

    expect(
      loadTime,
      `Page load took ${loadTime}ms — exceeded 10 000ms threshold`
    ).toBeLessThan(10_000);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-05_timing_verified.png', fullPage: true });
  });

  // ─── TC-C001-06: Page does not redirect to an error page ──────────────────
  test('TC-C001-06 | URL does not redirect to an error or 404 page', async ({ page }) => {
    await page.goto(`${PAGE_URL}${VALID_PARAMS}`);
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-06_after_navigation.png', fullPage: true });

    const finalUrl = page.url();
    expect(finalUrl, 'URL should not redirect away from the expected path').toContain(
      'RetailWidthChecks.html'
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-06_url_verified.png', fullPage: true });
  });

  // ─── TC-C001-07: Page renders without mixed-content warnings ──────────────
  test('TC-C001-07 | All sub-resources load over HTTPS', async ({ page }) => {
    const insecureRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().startsWith('http://')) insecureRequests.push(req.url());
    });

    await page.goto(`${PAGE_URL}${VALID_PARAMS}`);
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-07_page_loaded.png', fullPage: true });

    expect(
      insecureRequests,
      `Insecure (HTTP) sub-resources detected:\n${insecureRequests.join('\n')}`
    ).toHaveLength(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-07_https_verified.png', fullPage: true });
  });

  // ─── TC-C001-08: Navigation tabs are present ──────────────────────────────
  test('TC-C001-08 | INpage, Minisite and Hotspots navigation items are present', async ({ page }) => {
    await page.goto(`${PAGE_URL}${VALID_PARAMS}`);
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-08_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText, 'Expected "INpage" navigation item').toContain('INpage');
    expect(bodyText, 'Expected "Minisite" navigation item').toContain('Minisite');
    expect(bodyText, 'Expected "Hotspots" navigation item').toContain('Hotspots');

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-08_nav_tabs_verified.png', fullPage: true });
  });

  // ─── TC-C001-09: Retailer tabs are rendered ───────────────────────────────
  test('TC-C001-09 | Retailer tab options are visible (Default, Currys, Darty, HN, MM DE)', async ({ page }) => {
    await page.goto(`${PAGE_URL}${VALID_PARAMS}`);
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-09_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    const expectedTabs = ["Default", "Curry's", "Darty", "HN", "MM DE"];
    for (const tab of expectedTabs) {
      expect(bodyText, `Expected retailer tab "${tab}" to be present`).toContain(tab);
    }

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-09_retailer_tabs_verified.png', fullPage: true });
  });

  // ─── TC-C001-10: Page without query params still returns a response ────────
  test('TC-C001-10 | Page loads (no crash) when accessed without query parameters', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/TC-C001-10_before_navigation.png', fullPage: true });

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('RetailWidthChecks.html')),
      page.goto(PAGE_URL),
    ]);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-10_no_params_loaded.png', fullPage: true });

    expect(
      response.status(),
      `Unexpected server error ${response.status()} when no params supplied`
    ).toBeLessThan(500);

    await page.screenshot({ path: 'test-results/screenshots/TC-C001-10_status_verified.png', fullPage: true });
  });

});
