import { test } from '@playwright/test';
import { BASE_PATH, sendRawRequest, assertBodyNotContains } from '../../utils/api-utils';

/**
 * TC-008: XSS payload in mpn parameter
 * Verifies the API does not reflect a raw <script> tag back in the response
 * body, which would indicate an XSS vulnerability.
 *
 * Params: mpn=<script>alert('xss')</script>, ean=123, distId=6, iso=da, flIso=54eddjhdgcvbvc
 */
test('TC-008 | XSS payload in mpn is not reflected raw in the response body', async ({ request }) => {
  const xssPayload = encodeURIComponent("<script>alert('xss')</script>");
  const endpoint = `${BASE_PATH}?mpn=${xssPayload}&ean=123&distId=6&iso=da&flIso=54eddjhdgcvbvc`;
  const response = await sendRawRequest(request, endpoint);

  assertBodyNotContains(response, "<script>alert('xss')</script>");
});
