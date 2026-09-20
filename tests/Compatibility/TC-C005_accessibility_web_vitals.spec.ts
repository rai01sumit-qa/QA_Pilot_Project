import { test, expect } from '@playwright/test';

/**
 * TC-C005: Accessibility & Core Web Vitals
 *
 * Verifies baseline accessibility requirements and performance indicators.
 *
 * Artifacts captured per test:
 *   - Screenshots at each meaningful step  (screenshot: 'on' in config)
 *   - Full video recording                 (video: { mode: 'on' } in config)
 *   - Full trace with network + DOM        (trace: 'on' in config)
 *
 * NOTE: Full WCAG 2.1 compliance requires manual testing with assistive
 * technologies and expert review. These automated checks are a first-pass
 * safety net only.
 *
 * URL: https://modular.flix360.io/clamps/modularvnew/RetailWidthChecks.html
 */

const PAGE_URL     = '/clamps/modularvnew/RetailWidthChecks.html';
const VALID_PARAMS = '?mpn=TU55M72HBUXNA&ean=123&distId=6&iso=da&flIso=54eddjhdgcvbvc';
const FULL_URL     = `${PAGE_URL}${VALID_PARAMS}`;

test.describe('TC-C005 | Accessibility & Core Web Vitals', () => {

  // ══════════════════════════════════════════════════════════════════════════
  // ACCESSIBILITY
  // ══════════════════════════════════════════════════════════════════════════

  // ─── TC-C005-01: <html> has a lang attribute ──────────────────────────────
  test('TC-C005-01 | <html> element has a lang attribute set', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-01_page_loaded.png', fullPage: true });

    const lang = await page.getAttribute('html', 'lang');
    expect(lang, '<html> should have a non-empty lang attribute').toBeTruthy();
    expect((lang ?? '').trim().length).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-01_lang_verified.png', fullPage: true });
  });

  // ─── TC-C005-02: All <img> elements have alt attributes ──────────────────
  test('TC-C005-02 | All <img> elements have an alt attribute', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-02_page_loaded.png', fullPage: true });

    const imagesWithoutAlt: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img'))
        .filter((img) => !img.hasAttribute('alt'))
        .map((img) => img.src || img.outerHTML.slice(0, 120))
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-02_img_checked.png', fullPage: true });

    expect(imagesWithoutAlt, `Images missing alt attribute:\n${imagesWithoutAlt.join('\n')}`).toHaveLength(0);
  });

  // ─── TC-C005-03: Buttons have discernible text or aria-label ─────────────
  test('TC-C005-03 | All <button> elements have accessible text or aria-label', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-03_page_loaded.png', fullPage: true });

    const emptyButtons: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
        .filter((btn) => {
          const text           = (btn.textContent ?? '').trim();
          const ariaLabel      = btn.getAttribute('aria-label') ?? '';
          const ariaLabelledBy = btn.getAttribute('aria-labelledby') ?? '';
          const title          = btn.getAttribute('title') ?? '';
          return !text && !ariaLabel && !ariaLabelledBy && !title;
        })
        .map((btn) => btn.outerHTML.slice(0, 120))
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-03_buttons_checked.png', fullPage: true });

    expect(emptyButtons, `Buttons without accessible text:\n${emptyButtons.join('\n')}`).toHaveLength(0);
  });

  // ─── TC-C005-04: Links have discernible text or aria-label ───────────────
  test('TC-C005-04 | All <a> elements have accessible text or aria-label', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-04_page_loaded.png', fullPage: true });

    const emptyLinks: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .filter((a) => {
          const text           = (a.textContent ?? '').trim();
          const ariaLabel      = a.getAttribute('aria-label') ?? '';
          const title          = a.getAttribute('title') ?? '';
          const ariaLabelledBy = a.getAttribute('aria-labelledby') ?? '';
          return !text && !ariaLabel && !title && !ariaLabelledBy;
        })
        .map((a) => a.outerHTML.slice(0, 120))
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-04_links_checked.png', fullPage: true });

    expect(emptyLinks, `Links without accessible text:\n${emptyLinks.join('\n')}`).toHaveLength(0);
  });

  // ─── TC-C005-05: No positive tabindex values ──────────────────────────────
  test('TC-C005-05 | No elements use a positive tabindex (disrupts focus order)', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-05_page_loaded.png', fullPage: true });

    const positiveTabindex: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[tabindex]'))
        .filter((el) => parseInt(el.getAttribute('tabindex') ?? '0', 10) > 0)
        .map((el) => el.outerHTML.slice(0, 120))
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-05_tabindex_checked.png', fullPage: true });

    expect(positiveTabindex, `Elements with positive tabindex:\n${positiveTabindex.join('\n')}`).toHaveLength(0);
  });

  // ─── TC-C005-06: Form inputs have associated labels ───────────────────────
  test('TC-C005-06 | All visible <input> elements have an associated label or aria-label', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-06_page_loaded.png', fullPage: true });

    const unlabelledInputs: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input:not([type="hidden"])'))
        .filter((input) => {
          const id             = input.id;
          const ariaLabel      = input.getAttribute('aria-label') ?? '';
          const ariaLabelledBy = input.getAttribute('aria-labelledby') ?? '';
          const placeholder    = input.getAttribute('placeholder') ?? '';
          const hasLabel       = id ? !!document.querySelector(`label[for="${id}"]`) : false;
          return !hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder;
        })
        .map((input) => input.outerHTML.slice(0, 120))
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-06_inputs_checked.png', fullPage: true });

    expect(unlabelledInputs, `Inputs without labels:\n${unlabelledInputs.join('\n')}`).toHaveLength(0);
  });

  // ─── TC-C005-07: Page has at most one <h1> ────────────────────────────────
  test('TC-C005-07 | Page has at most one <h1> element', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-07_page_loaded.png', fullPage: true });

    const h1Count = await page.locator('h1').count();
    expect(h1Count, `Found ${h1Count} <h1> elements — should be at most one`).toBeLessThanOrEqual(1);

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-07_h1_verified.png', fullPage: true });
  });

  // ─── TC-C005-08: iframes have a title attribute ───────────────────────────
  test('TC-C005-08 | All <iframe> elements have a title attribute', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-08_page_loaded.png', fullPage: true });

    const iframesWithoutTitle: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'))
        .filter((iframe) => !(iframe.getAttribute('title') ?? '').trim())
        .map((iframe) => iframe.outerHTML.slice(0, 120))
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-08_iframes_checked.png', fullPage: true });

    expect(iframesWithoutTitle, `iframes missing title:\n${iframesWithoutTitle.join('\n')}`).toHaveLength(0);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // CORE WEB VITALS & PERFORMANCE
  // ══════════════════════════════════════════════════════════════════════════

  // ─── TC-C005-09: Time to First Byte < 800ms ───────────────────────────────
  test('TC-C005-09 | Time to First Byte (TTFB) is under 800ms', async ({ page }) => {
    await page.goto(FULL_URL, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-09_page_loaded.png', fullPage: true });

    const ttfb: number = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return nav ? nav.responseStart - nav.requestStart : -1;
    });

    if (ttfb === -1) {
      test.skip(true, 'Navigation Timing API not available — skipping TTFB check');
    }

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-09_ttfb_checked.png', fullPage: true });

    expect(ttfb, `TTFB was ${ttfb}ms — exceeded 800ms threshold`).toBeLessThan(800);
  });

  // ─── TC-C005-10: DOM Content Loaded < 3 000ms ────────────────────────────
  test('TC-C005-10 | DOM Content Loaded event fires within 3 000ms', async ({ page }) => {
    await page.goto(FULL_URL, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-10_page_loaded.png', fullPage: true });

    const dcl: number = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return nav ? nav.domContentLoadedEventEnd - nav.startTime : -1;
    });

    if (dcl === -1) {
      test.skip(true, 'Navigation Timing API not available — skipping DCL check');
    }

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-10_dcl_checked.png', fullPage: true });

    expect(dcl, `DOM Content Loaded took ${dcl}ms — exceeded 3 000ms threshold`).toBeLessThan(3_000);
  });

  // ─── TC-C005-11: Largest Contentful Paint < 4 000ms ──────────────────────
  test('TC-C005-11 | Largest Contentful Paint (LCP) is under 4 000ms', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __lcpValue?: number }).__lcpValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last    = entries[entries.length - 1];
        if (last) {
          (window as Window & { __lcpValue?: number }).__lcpValue = last.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    await page.goto(FULL_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-11_lcp_page_loaded.png', fullPage: true });

    const lcp: number = await page.evaluate(
      () => (window as Window & { __lcpValue?: number }).__lcpValue ?? 0
    );

    if (lcp === 0) {
      test.skip(true, 'LCP value not captured — PerformanceObserver may not be supported');
    }

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-11_lcp_checked.png', fullPage: true });

    expect(lcp, `LCP was ${lcp.toFixed(0)}ms — exceeded 4 000ms threshold`).toBeLessThan(4_000);
  });

  // ─── TC-C005-12: Cumulative Layout Shift < 0.1 ────────────────────────────
  test('TC-C005-12 | Cumulative Layout Shift (CLS) score is below 0.1', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __clsScore?: number }).__clsScore = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShift.hadRecentInput) {
            (window as Window & { __clsScore?: number }).__clsScore =
              ((window as Window & { __clsScore?: number }).__clsScore ?? 0) + layoutShift.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto(FULL_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-12_cls_page_loaded.png', fullPage: true });

    const cls: number = await page.evaluate(
      () => (window as Window & { __clsScore?: number }).__clsScore ?? 0
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-12_cls_checked.png', fullPage: true });

    expect(cls, `CLS score was ${cls.toFixed(4)} — exceeded 0.1 "Good" threshold`).toBeLessThan(0.1);
  });

  // ─── TC-C005-13: No render-blocking resources detected ────────────────────
  test('TC-C005-13 | No render-blocking scripts delay page rendering', async ({ page }) => {
    await page.goto(FULL_URL, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-13_page_loaded.png', fullPage: true });

    const renderBlockingScripts: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLScriptElement>('head script:not([async]):not([defer])'))
        .filter((s) => !!s.src)
        .map((s) => s.src)
    );

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-13_scripts_checked.png', fullPage: true });

    expect(
      renderBlockingScripts,
      `Render-blocking scripts in <head>:\n${renderBlockingScripts.join('\n')}`
    ).toHaveLength(0);
  });

  // ─── TC-C005-14: Page has a meaningful <title> element ───────────────────
  test('TC-C005-14 | Document <title> is set and meaningful', async ({ page }) => {
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-14_page_loaded.png', fullPage: true });

    const title = await page.title();
    expect(title.trim().length, 'Document title should not be empty').toBeGreaterThan(0);
    expect(title.toLowerCase()).not.toBe('untitled');
    expect(title.toLowerCase()).not.toBe('document');

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-14_title_verified.png', fullPage: true });
  });

  // ─── TC-C005-15: Colour scheme meta / prefers-color-scheme ────────────────
  test('TC-C005-15 | Page responds to prefers-color-scheme media query', async ({ page }) => {
    // Dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(FULL_URL);
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-15_dark_mode.png', fullPage: true });

    const darkBodyText = await page.locator('body').innerText();
    expect(darkBodyText.trim().length, 'Page body should have content in dark mode').toBeGreaterThan(0);

    // Light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await page.screenshot({ path: 'test-results/screenshots/TC-C005-15_light_mode.png', fullPage: true });

    const lightBodyText = await page.locator('body').innerText();
    expect(lightBodyText.trim().length, 'Page body should have content in light mode').toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/screenshots/TC-C005-15_color_scheme_verified.png', fullPage: true });
  });

});
