import { test } from '@playwright/test';
import { VALID_ENDPOINT, sendRawRequest, assertResponseTime } from '../../utils/api-utils';

/**
 * TC-002: Response time is within acceptable threshold
 * Ensures the API responds in under 3000ms for a valid request.
 *
 * URL: https://modular.flix360.io/clamps/modularvnew/RetailWidthChecks.html
 * Params: mpn=TU55M72HBUXNA, ean=123, distId=6, iso=da, flIso=54eddjhdgcvbvc
 */
test('TC-002 | Response time is under 3000ms', async ({ request }) => {
  const response = await sendRawRequest(request, VALID_ENDPOINT);

  assertResponseTime(response, 3000);
});
