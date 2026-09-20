import { test, expect } from '@playwright/test';

/**
 * TC-C004: Viewport & Responsive Layout
 *
 * Verifies the RetailWidthChecks page adapts correctly across standard CSS
 * breakpoints by resizing the viewport programmatically.
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

const BREAKPOINTS = [
  { label: '320px  — small mobile',       width: 320,  height: 568  },
  { label: '375px  — standard mobile',    width: 375,  height: 667  },
  { label: '414px  — large mobile',       width: 414,  height: 896  },
  { label: '480px  — mobile/tablet edge', width: 480,  height: 854  },
  { label: '600px  — small tablet',       width: 600,  height: 960  },
  { label: '768px  — tablet portrait',    width: 768,  height: 1024 },
  { label: '1024px — tablet landscape',   width: 1024, height: 768  },
  { label: '1280px — laptop',             width: 1280, height: 800  },
  { label: '1440px — wide desktop',       width: 1440, height: 900  },
  { label: '1920px — full-HD desktop',    width: 1920, height: 1080 },
] as const;

test.describe('TC-C004 | Viewport & Responsive Layout', () => {

  // ─── TC-C004-01 to 10: No horizontal overflow at every breakpoint ──────────
  for (const bp of BREAKPOINTS) {
    test(`TC-C004 | No horizontal overflow at ${bp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.screenshot({ path: `test-results/screenshots/TC-C004_overflow_before_${bp.width}px.png`, fullPage: true });

      await page.goto(FULL_URL);
      await page.screenshot({ path: `test-results/screenshots/TC-C004_overflow_loaded_${bp.width}px.png`, fullPage: true });

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth:  document.documentElement.clientWidth,
      }));

      await page.screenshot({ path: `test-results/screenshots/TC-C004_overflow_checked_${bp.width}px.png`, fullPage: true });

      expect(
        scrollWidth,
        `Horizontal overflow at ${bp.width}px: scrollWidth (${scrollWidth}px) > clientWidth (${clientWidth}px)`
      ).toBeLessThanOrEqual(clientWidth);
    });
  }

  // ─── TC-C004-11 to 20: Page body has content at every breakpoint ──────────
  for (const bp of BREAKPOINTS) {
    test(`TC-C004 | Page body has content at ${bp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(FULL_URL);
      await page.screenshot({ path: `test-results/screenshots/TC-C004_content_${bp.width}px.png`, fullPage: true });

      const bodyText = await page.locator('body').innerText();
      expect(
        bodyText.trim().length,
        `Page body is empty at viewport width ${bp.width}px`
      ).toBeGreaterThan(0);

      await page.screenshot({ path: `test-results/screenshots/TC-C004_content_verified_${bp.width}px.png`, fullPage: true });
    });
  }

  // ─── TC-C004-21: INpage width indicator is visible at 320px ──────────────
  test('TC-C004-21 | INpage width indicator is present at 320px (smallest viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-21_320px_set.png', fullPage: true });

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-21_320px_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText, '"INpage" label should be visible at 320px').toContain('INpage');

    await page.screenshot({ path: 'test-results/screenshots/TC-C004-21_inpage_verified.png', fullPage: true });
  });

  // ─── TC-C004-22: Retailer tabs present at 1920px ──────────────────────────
  test('TC-C004-22 | Retailer tabs are present at 1920px (full-HD desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-22_1920px_set.png', fullPage: true });

    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-22_1920px_loaded.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText, '"Default" tab should be present at 1920px').toContain('Default');

    await page.screenshot({ path: 'test-results/screenshots/TC-C004-22_tabs_verified.png', fullPage: true });
  });

  // ─── TC-C004-23: Portrait → landscape orientation switch ─────────────────
  test('TC-C004-23 | Layout remains stable when switching portrait → landscape', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-23_portrait_loaded.png', fullPage: true });

    const portraitScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const portraitClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(portraitScrollWidth, `Portrait overflow at 390px`).toBeLessThanOrEqual(portraitClientWidth);

    // Landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-23_landscape_switched.png', fullPage: true });

    const landscapeScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const landscapeClientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    await page.screenshot({ path: 'test-results/screenshots/TC-C004-23_landscape_checked.png', fullPage: true });

    expect(landscapeScrollWidth, `Landscape overflow at 844px`).toBeLessThanOrEqual(landscapeClientWidth);
  });

  // ─── TC-C004-24: Body text still present after orientation flip ───────────
  test('TC-C004-24 | Page content is present after orientation flip (landscape)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-24_portrait_loaded.png', fullPage: true });

    await page.setViewportSize({ width: 844, height: 390 });
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-24_landscape_flipped.png', fullPage: true });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length, 'Page body should not be empty after switching to landscape').toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C004-24_content_verified.png', fullPage: true });
  });

  // ─── TC-C004-25: Document width does not exceed viewport at 375px ─────────
  test('TC-C004-25 | document.body width does not exceed viewport at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-25_375px_loaded.png', fullPage: true });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth, `document.body.scrollWidth (${bodyWidth}px) exceeds 375px viewport`).toBeLessThanOrEqual(375);

    await page.screenshot({ path: 'test-results/screenshots/TC-C004-25_width_verified.png', fullPage: true });
  });

  // ─── TC-C004-26: No JS errors across a range of viewports ─────────────────
  test('TC-C004-26 | No critical JS errors when resizing from 320px to 1920px', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-26_320px_start.png', fullPage: true });

    for (const bp of [768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width: bp, height: 800 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: `test-results/screenshots/TC-C004-26_resized_${bp}px.png`, fullPage: true });
    }

    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR_BLOCKED_BY_CLIENT')
    );

    expect(criticalErrors, `JS errors during viewport resize:\n${criticalErrors.join('\n')}`).toHaveLength(0);
  });

  // ─── TC-C004-27: meta viewport tag is present ────────────────────────────
  test('TC-C004-27 | <meta name="viewport"> tag is present in the document head', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C004-27_page_loaded.png', fullPage: true });

    const metaContent = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(metaContent, 'A <meta name="viewport"> tag should be defined').not.toBeNull();

    await page.screenshot({ path: 'test-results/screenshots/TC-C004-27_meta_verified.png', fullPage: true });
  });

});
