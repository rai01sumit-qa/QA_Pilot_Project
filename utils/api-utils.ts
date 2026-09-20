import { APIRequestContext, APIResponse, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Base path of the endpoint under test. Combined with baseURL from playwright.config.ts */
export const BASE_PATH = '/clamps/modularvnew/RetailWidthChecks.html';

/** Default set of valid query parameters taken from the reference URL */
export const DEFAULT_PARAMS: QueryParams = {
  mpn:   'TU55M72HBUXNA',
  ean:   '123',
  distId: '6',
  iso:   'da',
  flIso: '54eddjhdgcvbvc',
};

/** Pre-built full endpoint string using default valid parameters */
export const VALID_ENDPOINT = buildEndpoint(DEFAULT_PARAMS);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Shape of the query parameters accepted by the Retail Width Checks API */
export interface QueryParams {
  mpn?:    string;
  ean?:    string;
  distId?: string;
  iso?:    string;
  flIso?:  string;
  /** Allow arbitrary extra keys for negative / edge-case tests */
  [key: string]: string | undefined;
}

/** Enriched response object returned by sendRequest() */
export interface ApiResponse {
  /** Raw Playwright APIResponse */
  raw:          APIResponse;
  /** HTTP status code */
  status:       number;
  /** Response headers map */
  headers:      Record<string, string>;
  /** Parsed body — JSON object when content-type is JSON, plain string otherwise */
  body:         unknown;
  /** End-to-end response time in milliseconds */
  responseTime: number;
  /** Relative URL path + query string that was requested */
  url:          string;
}

// ─────────────────────────────────────────────────────────────────────────────
// URL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a query string from a params object.
 * Undefined values are omitted; empty strings are kept (for negative tests).
 *
 * @example
 * buildQueryString({ mpn: 'ABC', ean: '123' })
 * // → '?mpn=ABC&ean=123'
 */
export function buildQueryString(params: Record<string, string | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Builds the full relative endpoint URL for the given params.
 *
 * @example
 * buildEndpoint({ mpn: 'TU55M72HBUXNA', ean: '123' })
 * // → '/clamps/modularvnew/RetailWidthChecks.html?mpn=TU55M72HBUXNA&ean=123'
 */
export function buildEndpoint(params: QueryParams): string {
  return `${BASE_PATH}${buildQueryString(params)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a GET request to the Retail Width Checks endpoint and returns an
 * enriched ApiResponse that includes the status, headers, parsed body,
 * response time, and URL.
 *
 * @param request - Playwright APIRequestContext (injected by the test fixture)
 * @param params  - Query parameters to append to the request URL
 */
export async function sendRequest(
  request: APIRequestContext,
  params: QueryParams
): Promise<ApiResponse> {
  const url   = buildEndpoint(params);
  const start = Date.now();

  const raw         = await request.get(url);
  const responseTime = Date.now() - start;

  const contentType = raw.headers()['content-type'] ?? '';
  let body: unknown;
  try {
    body = contentType.includes('application/json')
      ? await raw.json()
      : await raw.text();
  } catch {
    body = await raw.text();
  }

  return {
    raw,
    status: raw.status(),
    headers: raw.headers(),
    body,
    responseTime,
    url,
  };
}

/**
 * Sends a GET request using a pre-built endpoint string (for tests that
 * construct the URL manually, e.g. with encoded injection payloads).
 *
 * @param request  - Playwright APIRequestContext
 * @param endpoint - Full relative URL path including query string
 */
export async function sendRawRequest(
  request: APIRequestContext,
  endpoint: string
): Promise<ApiResponse> {
  const start = Date.now();
  const raw   = await request.get(endpoint);
  const responseTime = Date.now() - start;

  const contentType = raw.headers()['content-type'] ?? '';
  let body: unknown;
  try {
    body = contentType.includes('application/json')
      ? await raw.json()
      : await raw.text();
  } catch {
    body = await raw.text();
  }

  return {
    raw,
    status: raw.status(),
    headers: raw.headers(),
    body,
    responseTime,
    url: endpoint,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSERTION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Asserts the response returned HTTP 200 OK.
 */
export function assertOk(response: ApiResponse): void {
  expect(response.status, `Expected 200 but got ${response.status}`).toBe(200);
}

/**
 * Asserts the response is a client error (4xx).
 */
export function assertClientError(response: ApiResponse): void {
  expect(
    response.status,
    `Expected 4xx but got ${response.status}`
  ).toBeGreaterThanOrEqual(400);
  expect(
    response.status,
    `Expected 4xx but got ${response.status}`
  ).toBeLessThan(500);
}

/**
 * Asserts the server did not crash — status must not be 500 or 503.
 */
export function assertNoServerCrash(response: ApiResponse): void {
  expect(response.status, 'Server returned 500 — unexpected crash').not.toBe(500);
  expect(response.status, 'Server returned 503 — service unavailable').not.toBe(503);
}

/**
 * Asserts the response time is within the given threshold (default 3000ms).
 */
export function assertResponseTime(response: ApiResponse, thresholdMs = 3000): void {
  expect(
    response.responseTime,
    `Response took ${response.responseTime}ms — exceeded ${thresholdMs}ms threshold`
  ).toBeLessThan(thresholdMs);
}

/**
 * Asserts the response body does NOT contain the given string.
 * Used to verify XSS / injection payloads are not reflected.
 */
export function assertBodyNotContains(response: ApiResponse, text: string): void {
  expect(
    String(response.body),
    `Response body reflected forbidden string: "${text}"`
  ).not.toContain(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the average of an array of numbers.
 */
export function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculates the nth percentile of an array of numbers.
 *
 * @example
 * percentile([100, 200, 300, 400, 500], 95) // → 500
 */
export function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index  = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
