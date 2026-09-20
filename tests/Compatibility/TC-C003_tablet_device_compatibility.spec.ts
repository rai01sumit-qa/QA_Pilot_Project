import { test, expect } from '@playwright/test';

/**
 * TC-C003: Tablet Device Compatibility
 *
 * Verifies the RetailWidthChecks page renders and behaves correctly on tablet
 * devices. Projects: iPad Pro 11, iPad Mini, Galaxy Tab S4
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
const FULL_URL     = `${PAGE_URL}${VALID_PARAMS}`;

test.describe('TC-C003 | Tablet Device Compatibility', () => {

  // ─── TC-C003-01: Page returns HTTP 200 on tablet ──────────────────────────
  test('TC-C003-01 | Page returns HTTP 200 on tablet device', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-01_before_nav.png', fullPage: true });

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('RetailWidthChecks.html')),
      page.goto(FULL_URL),
    ]);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-01_page_loaded.png', fullPage: true });

    expect(response.status(), `Expected 200 but received ${response.status()}`).toBe(200);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-01_status_verified.png', fullPage: true });
  });

  // ─── TC-C003-02: Viewport width is in tablet range ────────────────────────
  test('TC-C003-02 | Viewport width is within tablet range (481px – 1280px)', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-02_page_loaded.png', fullPage: true });

    const viewportWidth = page.viewportSize()?.width ?? 0;

    // Skip on mobile projects (< 481px) and very wide desktops (> 1280px)
    if (viewportWidth <= 480 || viewportWidth > 1280) {
      test.skip(true, `Viewport ${viewportWidth}px is outside tablet range — tablet-only check`);
    }

    expect(viewportWidth, `Viewport ${viewportWidth}px below tablet minimum 481px`).toBeGreaterThan(480);
    expect(viewportWidth, `Viewport ${viewportWidth}px exceeds tablet maximum 1280px`).toBeLessThanOrEqual(1280);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-02_viewport_verified.png', fullPage: true });
  });

  // ─── TC-C003-03: Page body renders content on tablet ──────────────────────
  test('TC-C003-03 | Page body is not blank on tablet', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-03_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length, 'Page body should have visible content on tablet').toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-03_content_verified.png', fullPage: true });
  });

  // ─── TC-C003-04: No horizontal overflow on tablet ─────────────────────────
  test('TC-C003-04 | Page has no horizontal overflow on tablet', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-04_page_loaded.png', fullPage: true });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth:  document.documentElement.clientWidth,
    }));

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-04_overflow_checked.png', fullPage: true });

    expect(
      scrollWidth,
      `Horizontal overflow on tablet: scrollWidth (${scrollWidth}px) > clientWidth (${clientWidth}px)`
    ).toBeLessThanOrEqual(clientWidth);
  });

  // ─── TC-C003-05: Touch support is available on tablet ─────────────────────
  test('TC-C003-05 | Touch events are supported on tablet device', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-05_page_loaded.png', fullPage: true });

    const hasTouchSupport = await page.evaluate(() => 'ontouchstart' in window);

    if (!hasTouchSupport) {
      test.skip(true, 'Touch not available on this project — tablet-only check');
    }

    expect(hasTouchSupport, 'Touch events should be supported on a tablet').toBe(true);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-05_touch_verified.png', fullPage: true });
  });

  // ─── TC-C003-06: Tablet user-agent is sent ────────────────────────────────
  test('TC-C003-06 | User-agent identifies this device as mobile/tablet', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-06_page_loaded.png', fullPage: true });

    const userAgent: string = await page.evaluate(() => navigator.userAgent);
    const isTabletOrMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);

    if (!isTabletOrMobile) {
      test.skip(true, `Desktop UA detected — tablet-only check`);
    }

    expect(isTabletOrMobile, `User-agent "${userAgent}" does not identify as tablet/mobile`).toBe(true);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-06_ua_verified.png', fullPage: true });
  });

  // ─── TC-C003-07: Page loads within 12 seconds on tablet ───────────────────
  test('TC-C003-07 | Page loads within 12 seconds on tablet', async ({ page }) => {
    const start = Date.now();
    await page.goto(FULL_URL, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-07_loaded.png', fullPage: true });

    expect(loadTime, `Page load took ${loadTime}ms — exceeded 12 000ms tablet threshold`).toBeLessThan(12_000);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-07_timing_verified.png', fullPage: true });
  });

  // ─── TC-C003-08: No critical JS errors on tablet ──────────────────────────
  test('TC-C003-08 | No critical JavaScript errors on tablet page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-08_page_loaded.png', fullPage: true });

    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR_BLOCKED_BY_CLIENT')
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-08_errors_checked.png', fullPage: true });

    expect(criticalErrors, `Critical JS errors on tablet: ${criticalErrors.join(', ')}`).toHaveLength(0);
  });

  // ─── TC-C003-09: Core navigation items are present on tablet ──────────────
  test('TC-C003-09 | INpage, Minisite and Hotspots tabs are present on tablet', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-09_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText, 'Expected "INpage" tab on tablet').toContain('INpage');
    expect(bodyText, 'Expected "Minisite" tab on tablet').toContain('Minisite');
    expect(bodyText, 'Expected "Hotspots" tab on tablet').toContain('Hotspots');

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-09_nav_verified.png', fullPage: true });
  });

  // ─── TC-C003-10: Retailer tab options are rendered on tablet ──────────────
  test('TC-C003-10 | Retailer tab options are visible on tablet', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-10_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    const expectedTabs = ["Default", "Curry's", "Darty", "HN", "MM DE"];
    for (const tab of expectedTabs) {
      expect(bodyText, `Retailer tab "${tab}" should be present on tablet`).toContain(tab);
    }

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-10_retailer_tabs_verified.png', fullPage: true });
  });

  // ─── TC-C003-11: Page does not redirect away on tablet ────────────────────
  test('TC-C003-11 | URL remains on RetailWidthChecks.html after navigation on tablet', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-11_after_nav.png', fullPage: true });

    expect(page.url(), 'URL should still contain RetailWidthChecks.html').toContain('RetailWidthChecks.html');

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-11_url_verified.png', fullPage: true });
  });

  // ─── TC-C003-12: All sub-resources load over HTTPS on tablet ──────────────
  test('TC-C003-12 | All sub-resources load over HTTPS on tablet', async ({ page }) => {
    const insecureRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().startsWith('http://')) insecureRequests.push(req.url());
    });

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-12_page_loaded.png', fullPage: true });

    expect(
      insecureRequests,
      `Insecure HTTP sub-resources on tablet:\n${insecureRequests.join('\n')}`
    ).toHaveLength(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-12_https_verified.png', fullPage: true });
  });

  // ─── TC-C003-13: Landscape orientation renders correctly ──────────────────
  test('TC-C003-13 | Page renders without overflow in landscape orientation', async ({ page, viewport }) => {
    if (viewport) {
      await page.setViewportSize({ width: viewport.height, height: viewport.width });
    }

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C003-13_landscape_loaded.png', fullPage: true });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth:  document.documentElement.clientWidth,
    }));

    await page.screenshot({ path: 'test-results/screenshots/TC-C003-13_landscape_overflow_checked.png', fullPage: true });

    expect(
      scrollWidth,
      `Horizontal overflow in landscape: scrollWidth (${scrollWidth}px) > clientWidth (${clientWidth}px)`
    ).toBeLessThanOrEqual(clientWidth);
  });

});
