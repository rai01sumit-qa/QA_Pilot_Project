import { test } from '@playwright/test';
import { buildEndpoint, sendRawRequest, assertNoServerCrash } from '../../utils/api-utils';

/**
 * TC-005: Invalid distId — non-numeric value
 * Documents actual API behavior — server currently returns 200 for a
 * non-numeric distId, indicating missing type validation.
 *
 * FINDING: API should return 400 for distId=INVALID, but returns 200.
 *
 * Params: mpn=TU55M72HBUXNA, ean=123, distId=INVALID, iso=da, flIso=54eddjhdgcvbvc
 */
test('TC-005 | Non-numeric distId — API does not crash (type validation finding)', async ({ request }) => {
  const endpoint = buildEndpoint({ mpn: 'TU55M72HBUXNA', ean: '123', distId: 'INVALID', iso: 'da', flIso: '54eddjhdgcvbvc' });
  const response = await sendRawRequest(request, endpoint);

  assertNoServerCrash(response);
});
