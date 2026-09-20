import { test } from '@playwright/test';
import { BASE_PATH, sendRawRequest, assertNoServerCrash } from '../../utils/api-utils';

/**
 * TC-007: SQL injection in mpn parameter
 * Verifies the API sanitises SQL injection payloads and does not crash or
 * expose internal database errors.
 *
 * Params: mpn=' OR '1'='1'--, ean=123, distId=6, iso=da, flIso=54eddjhdgcvbvc
 */
test('TC-007 | SQL injection in mpn is sanitised — no 5xx server error', async ({ request }) => {
  const maliciousMpn = encodeURIComponent("' OR '1'='1'--");
  const endpoint = `${BASE_PATH}?mpn=${maliciousMpn}&ean=123&distId=6&iso=da&flIso=54eddjhdgcvbvc`;
  const response = await sendRawRequest(request, endpoint);

  assertNoServerCrash(response);
});
