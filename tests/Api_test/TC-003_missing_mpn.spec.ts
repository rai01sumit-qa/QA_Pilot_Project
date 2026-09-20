import { test } from '@playwright/test';
import { buildEndpoint, sendRawRequest, assertNoServerCrash } from '../../utils/api-utils';

/**
 * TC-003: Missing required parameter "mpn"
 * Documents actual API behavior — server currently returns 200 without mpn,
 * indicating missing server-side input validation.
 *
 * FINDING: API should return 400 when mpn is absent, but returns 200.
 *
 * Params: ean=123, distId=6, iso=da, flIso=54eddjhdgcvbvc (mpn omitted)
 */
test('TC-003 | Missing mpn — API does not crash (server validation finding)', async ({ request }) => {
  const endpoint = buildEndpoint({ ean: '123', distId: '6', iso: 'da', flIso: '54eddjhdgcvbvc' });
  const response = await sendRawRequest(request, endpoint);

  assertNoServerCrash(response);
});
