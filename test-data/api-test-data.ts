// Test data for Retail Width Checks API
// Endpoint: https://modular.flix360.io/clamps/modularvnew/RetailWidthChecks.html

export const BASE_PATH = '/clamps/modularvnew/RetailWidthChecks.html';

// ─── Valid Parameter Sets ────────────────────────────────────────────────────
export const VALID_PARAMS = {
  default: {
    mpn: 'TU55M72HBUXNA',
    ean: '123',
    distId: '6',
    iso: 'da',
    flIso: '54eddjhdgcvbvc',
  },
  alternate: {
    mpn: 'AB123CD456XYZ',
    ean: '1234567890123',
    distId: '12',
    iso: 'en',
    flIso: '12abc34def56gh',
  },
  minimal: {
    mpn: 'TU55M72HBUXNA',
    ean: '123',
    distId: '6',
    iso: 'da',
    flIso: '54eddjhdgcvbvc',
  },
};

// ─── Valid ISO Language Codes ────────────────────────────────────────────────
export const VALID_ISO_CODES = ['en', 'da', 'de', 'fr', 'es', 'nl', 'sv', 'no', 'fi', 'it'];

// ─── Valid MPN Formats ───────────────────────────────────────────────────────
export const VALID_MPN_LIST = [
  'TU55M72HBUXNA',
  'AB123CD456',
  'MODEL2024X',
  'PROD-001-XYZ',
  'SKU123456789',
];

// ─── Valid EAN Formats ───────────────────────────────────────────────────────
export const VALID_EAN_LIST = [
  '123',
  '12345678',
  '123456789012',
  '1234567890123',
  '12345678901234',
];

// ─── Valid Distributor IDs ───────────────────────────────────────────────────
export const VALID_DIST_IDS = ['1', '6', '12', '50', '100'];

// ─── Invalid Parameter Sets ──────────────────────────────────────────────────
export const INVALID_PARAMS = {
  missingMpn: {
    ean: '123',
    distId: '6',
    iso: 'da',
    flIso: '54eddjhdgcvbvc',
  },
  missingEan: {
    mpn: 'TU55M72HBUXNA',
    distId: '6',
    iso: 'da',
    flIso: '54eddjhdgcvbvc',
  },
  missingDistId: {
    mpn: 'TU55M72HBUXNA',
    ean: '123',
    iso: 'da',
    flIso: '54eddjhdgcvbvc',
  },
  missingIso: {
    mpn: 'TU55M72HBUXNA',
    ean: '123',
    distId: '6',
    flIso: '54eddjhdgcvbvc',
  },
  missingFlIso: {
    mpn: 'TU55M72HBUXNA',
    ean: '123',
    distId: '6',
    iso: 'da',
  },
  emptyMpn: {
    mpn: '',
    ean: '123',
    distId: '6',
    iso: 'da',
    flIso: '54eddjhdgcvbvc',
  },
  emptyAll: {
    mpn: '',
    ean: '',
    distId: '',
    iso: '',
    flIso: '',
  },
};

// ─── Injection Payloads ──────────────────────────────────────────────────────
export const INJECTION_PAYLOADS = {
  sqlInjection: [
    "' OR '1'='1'--",
    "'; DROP TABLE products;--",
    "1' UNION SELECT * FROM users--",
    "' OR 1=1--",
  ],
  xssInjection: [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert('xss')",
    '"><svg onload=alert(1)>',
  ],
  commandInjection: [
    '; ls -la',
    '| cat /etc/passwd',
    '`id`',
    '$(whoami)',
  ],
};

// ─── Edge Case Values ────────────────────────────────────────────────────────
export const EDGE_CASE_VALUES = {
  longString: 'A'.repeat(1000),
  unicodeMpn: '测试产品型号',
  specialChars: 'TU55@M72#BUX!NA',
  whitespace: '   TU55M72HBUXNA   ',
  negativeDistId: '-1',
  zeroDistId: '0',
  largeDistId: '9999999999',
  invalidIso: 'xx',
  numericIso: '123',
  longIso: 'english',
};

// ─── Boundary Values ─────────────────────────────────────────────────────────
export const BOUNDARY_VALUES = {
  minDistId: '1',
  maxDistId: '999',
  minEan: '1',
  maxEan: '9'.repeat(14),
  minMpnLength: 'A',
  maxMpnLength: 'A'.repeat(50),
};
