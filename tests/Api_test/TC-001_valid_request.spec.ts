import { test } from '@playwright/test';
import { VALID_ENDPOINT, sendRawRequest, assertOk } from '../../utils/api-utils';

/**
 * TC-001: Valid request with all parameters
 * Verifies the API returns HTTP 200 when all valid parameters are supplied.
 *
 * URL: https://modular.flix360.io/clamps/modularvnew/RetailWidthChecks.html
 * Params: mpn=TU55M72HBUXNA, ean=123, distId=6, iso=da, flIso=54eddjhdgcvbvc
 */
test('TC-001 | Valid request with all parameters returns 200', async ({ request }) => {
  const response = await sendRawRequest(request, VALID_ENDPOINT);

  assertOk(response);
});
