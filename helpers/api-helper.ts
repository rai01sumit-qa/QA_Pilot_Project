import { APIRequestContext, APIResponse } from '@playwright/test';
import { BASE_PATH } from '../test-data/api-test-data';

export interface QueryParams {
  mpn?: string;
  ean?: string;
  distId?: string;
  iso?: string;
  flIso?: string;
  [key: string]: string | undefined;
}

export interface ApiResponseData {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  responseTime: number;
  url: string;
}

// ─── Build query string from params object ────────────────────────────────────
export function buildQueryString(params: Record<string, string | undefined>): string {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join('&');
  return query ? `?${query}` : '';
}

// ─── Send GET request and return enriched response data ──────────────────────
export async function sendRequest(
  request: APIRequestContext,
  params: QueryParams
): Promise<ApiResponseData> {
  const qs = buildQueryString(params as Record<string, string | undefined>);
  const url = `${BASE_PATH}${qs}`;
  const start = Date.now();

  const response: APIResponse = await request.get(url);
  const responseTime = Date.now() - start;

  let body: unknown;
  const contentType = response.headers()['content-type'] ?? '';
  try {
    body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
  } catch {
    body = await response.text();
  }

  return {
    status: response.status(),
    headers: response.headers(),
    body,
    responseTime,
    url,
  };
}

// ─── Send multiple concurrent requests (for performance tests) ───────────────
export async function sendConcurrentRequests(
  request: APIRequestContext,
  params: QueryParams,
  count: number
): Promise<ApiResponseData[]> {
  const requests = Array.from({ length: count }, () => sendRequest(request, params));
  return Promise.all(requests);
}

// ─── Send sequential requests and collect response times ─────────────────────
export async function sendSequentialRequests(
  request: APIRequestContext,
  params: QueryParams,
  count: number
): Promise<number[]> {
  const times: number[] = [];
  for (let i = 0; i < count; i++) {
    const result = await sendRequest(request, params);
    times.push(result.responseTime);
  }
  return times;
}

// ─── Calculate average of an array of numbers ────────────────────────────────
export function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// ─── Calculate percentile ────────────────────────────────────────────────────
export function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index];
}
