import { test } from '@playwright/test';
import { buildEndpoint, sendRawRequest, assertNoServerCrash } from '../../utils/api-utils';

/**
 * TC-006: Invalid ISO language code
 * Verifies the API handles an unsupported ISO code (e.g. "xx") without
 * crashing — it should either return 4xx or fall back to a default locale.
 *
 * Params: mpn=TU55M72HBUXNA, ean=123, distId=6, iso=xx, flIso=54eddjhdgcvbvc
 */
test('TC-006 | Invalid ISO code does not cause a 5xx server error', async ({ request }) => {
  const endpoint = buildEndpoint({ mpn: 'TU55M72HBUXNA', ean: '123', distId: '6', iso: 'xx', flIso: '54eddjhdgcvbvc' });
  const response = await sendRawRequest(request, endpoint);

  assertNoServerCrash(response);
});
