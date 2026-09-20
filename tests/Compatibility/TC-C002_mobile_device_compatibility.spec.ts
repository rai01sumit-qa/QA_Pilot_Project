import { test, expect } from '@playwright/test';

/**
 * TC-C002: Mobile Device Compatibility
 *
 * Verifies the RetailWidthChecks page renders and behaves correctly on mobile
 * devices. Projects: iPhone 14, iPhone 14 Pro Max, Pixel 7, Galaxy S9+
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

test.describe('TC-C002 | Mobile Device Compatibility', () => {

  // ─── TC-C002-01: Page returns HTTP 200 on mobile ──────────────────────────
  test('TC-C002-01 | Page returns HTTP 200 on mobile device', async ({ page }) => {
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-01_before_nav.png', fullPage: true });

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('RetailWidthChecks.html')),
      page.goto(FULL_URL),
    ]);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-01_page_loaded.png', fullPage: true });

    expect(response.status(), `Expected 200 but received ${response.status()}`).toBe(200);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-01_status_verified.png', fullPage: true });
  });

  // ─── TC-C002-02: Viewport width matches mobile device ─────────────────────
  test('TC-C002-02 | Viewport width is within mobile range (≤ 480px)', async ({ page }) => {
    const viewportWidth = page.viewportSize()?.width ?? 0;
    // Skip on desktop projects where the viewport is intentionally wide
    if (viewportWidth > 480) {
      test.skip(true, `Skipped on desktop viewport (${viewportWidth}px) — mobile-only check`);
    }

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-02_page_loaded.png', fullPage: true });

    expect(
      viewportWidth,
      `Viewport width ${viewportWidth}px is not in the mobile range (≤ 480px)`
    ).toBeLessThanOrEqual(480);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-02_viewport_verified.png', fullPage: true });
  });

  // ─── TC-C002-03: Page body renders content on mobile ──────────────────────
  test('TC-C002-03 | Page body is not blank on mobile', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-03_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length, 'Page body should have visible content on mobile').toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-03_content_verified.png', fullPage: true });
  });

  // ─── TC-C002-04: No horizontal overflow (no side-scroll) ──────────────────
  test('TC-C002-04 | Page has no horizontal overflow on mobile', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-04_page_loaded.png', fullPage: true });

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth:  document.documentElement.clientWidth,
    }));

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-04_overflow_checked.png', fullPage: true });

    expect(
      scrollWidth,
      `Horizontal overflow detected: scrollWidth (${scrollWidth}px) > clientWidth (${clientWidth}px)`
    ).toBeLessThanOrEqual(clientWidth);
  });

  // ─── TC-C002-05: Touch events are supported ───────────────────────────────
  test('TC-C002-05 | Touch events are supported on mobile device', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-05_page_loaded.png', fullPage: true });

    const hasTouchSupport = await page.evaluate(() => 'ontouchstart' in window);

    // Desktop browsers don't have touch — skip rather than fail
    if (!hasTouchSupport) {
      test.skip(true, 'Touch not available on this project — mobile-only check');
    }

    expect(hasTouchSupport, 'Touch events should be supported on mobile').toBe(true);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-05_touch_verified.png', fullPage: true });
  });

  // ─── TC-C002-06: Mobile user-agent is sent ────────────────────────────────
  test('TC-C002-06 | User-agent header contains mobile identifier', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-06_page_loaded.png', fullPage: true });

    const userAgent: string = await page.evaluate(() => navigator.userAgent);
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);

    // Skip gracefully on desktop projects
    if (!isMobile) {
      test.skip(true, `Desktop UA detected ("${userAgent.slice(0, 60)}…") — mobile-only check`);
    }

    expect(isMobile, `User-agent "${userAgent}" does not identify as a mobile device`).toBe(true);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-06_ua_verified.png', fullPage: true });
  });

  // ─── TC-C002-07: Page loads within 12 seconds on mobile ───────────────────
  test('TC-C002-07 | Page loads within 12 seconds on mobile', async ({ page }) => {
    const start = Date.now();
    await page.goto(FULL_URL, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-07_loaded.png', fullPage: true });

    expect(loadTime, `Page load took ${loadTime}ms — exceeded 12 000ms mobile threshold`).toBeLessThan(12_000);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-07_timing_verified.png', fullPage: true });
  });

  // ─── TC-C002-08: No critical JS errors on mobile ──────────────────────────
  test('TC-C002-08 | No critical JavaScript errors on mobile page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-08_page_loaded.png', fullPage: true });

    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR_BLOCKED_BY_CLIENT')
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-08_errors_checked.png', fullPage: true });

    expect(criticalErrors, `Critical JS errors on mobile: ${criticalErrors.join(', ')}`).toHaveLength(0);
  });

  // ─── TC-C002-09: INpage section label is present on mobile ────────────────
  test('TC-C002-09 | INpage section label is present on mobile', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-09_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText, 'Expected "INpage" content to be present on mobile').toContain('INpage');

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-09_inpage_verified.png', fullPage: true });
  });

  // ─── TC-C002-10: "Tap To View Content" CTA is present ────────────────────
  test('TC-C002-10 | "Tap To View Content" CTA is present on mobile', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-10_page_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText, 'Expected mobile tap-to-view CTA to be present').toContain('Tap To View Content');

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-10_cta_verified.png', fullPage: true });
  });

  // ─── TC-C002-11: Page does not redirect away on mobile ────────────────────
  test('TC-C002-11 | URL does not redirect away from RetailWidthChecks.html on mobile', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-11_after_nav.png', fullPage: true });

    expect(page.url(), 'URL should still reference RetailWidthChecks.html after navigation').toContain(
      'RetailWidthChecks.html'
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-11_url_verified.png', fullPage: true });
  });

  // ─── TC-C002-12: All sub-resources load over HTTPS on mobile ──────────────
  test('TC-C002-12 | All sub-resources load over HTTPS on mobile', async ({ page }) => {
    const insecureRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().startsWith('http://')) insecureRequests.push(req.url());
    });

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C002-12_page_loaded.png', fullPage: true });

    expect(
      insecureRequests,
      `Insecure HTTP sub-resources on mobile:\n${insecureRequests.join('\n')}`
    ).toHaveLength(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C002-12_https_verified.png', fullPage: true });
  });

});
