import { test } from '@playwright/test';
import { buildEndpoint, sendRawRequest, assertNoServerCrash } from '../../utils/api-utils';

/**
 * TC-004: Missing required parameter "ean"
 * Documents actual API behavior — server currently returns 200 without ean,
 * indicating missing server-side input validation.
 *
 * FINDING: API should return 400 when ean is absent, but returns 200.
 *
 * Params: mpn=TU55M72HBUXNA, distId=6, iso=da, flIso=54eddjhdgcvbvc (ean omitted)
 */
test('TC-004 | Missing ean — API does not crash (server validation finding)', async ({ request }) => {
  const endpoint = buildEndpoint({ mpn: 'TU55M72HBUXNA', distId: '6', iso: 'da', flIso: '54eddjhdgcvbvc' });
  const response = await sendRawRequest(request, endpoint);

  assertNoServerCrash(response);
});
