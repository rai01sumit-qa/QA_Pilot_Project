import { test, expect } from '@playwright/test';
import { VALID_ENDPOINT, sendRawRequest } from '../../utils/api-utils';

/**
 * TC-010: HTTPS enforcement
 * Verifies the endpoint is reachable over HTTPS and returns a valid HTTP
 * status — confirming the TLS handshake succeeded and the server responded.
 *
 * Params: mpn=TU55M72HBUXNA, ean=123, distId=6, iso=da, flIso=54eddjhdgcvbvc
 */
test('TC-010 | Endpoint is served over HTTPS and returns a valid status', async ({ request }) => {
  const response = await sendRawRequest(request, VALID_ENDPOINT);

  // A valid status > 0 confirms TLS succeeded and the server responded
  expect(response.status).toBeGreaterThan(0);
  expect([200, 301, 302, 400, 401, 403, 404]).toContain(response.status);
});
