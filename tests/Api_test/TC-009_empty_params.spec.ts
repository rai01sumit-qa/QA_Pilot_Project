import { test } from '@playwright/test';
import { buildEndpoint, sendRawRequest, assertNoServerCrash } from '../../utils/api-utils';

/**
 * TC-009: Empty string values for all parameters
 * Documents actual API behavior — server currently returns 200 when all
 * parameters are present but empty, indicating missing empty-value validation.
 *
 * FINDING: API should return 400 for empty values, but returns 200.
 *
 * Params: mpn=, ean=, distId=, iso=, flIso= (all empty strings)
 */
test('TC-009 | Empty parameter values — API does not crash (empty-value validation finding)', async ({ request }) => {
  const endpoint = buildEndpoint({ mpn: '', ean: '', distId: '', iso: '', flIso: '' });
  const response = await sendRawRequest(request, endpoint);

  assertNoServerCrash(response);
});
