/**
 * Storefront Routing & Slug Generation Test Suite
 *
 * Verifies:
 * 1. Dynamic slug generation (apostrophe stripping, hyphens, lowercase, collapsing).
 * 2. Exact user test cases:
 *    - "Kabab Jee's" -> "kababjees"
 *    - "Mario's Pizza" -> "marios-pizza"
 *    - "Burger House" -> "burger-house"
 *    - "My Restaurant" -> "my-restaurant"
 * 3. Reserved slug rejection (dashboard, login, signup, admin, api, etc.).
 * 4. Vercel hostname bug prevention (dinecraft-six.vercel.app must never be treated as tenant slug).
 * 5. Localhost & development domain safety.
 * 6. Storefront URL generation across subpages.
 */

import {
  generateSlug,
  isValidSlug,
  RESERVED_SLUGS,
  getSubdomain,
  buildStorefrontUrl,
} from '../lib/subdomain.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
    failed++;
  }
}

console.log('=== RUNNING STOREFRONT ROUTING & SLUG TESTS ===\n');

// 1. Exact required slug generation cases
assert(
  generateSlug("Kabab Jee's") === 'kababjees',
  "Test 1a: 'Kabab Jee\'s' generates 'kababjees' (apostrophe removed)",
  `Got: ${generateSlug("Kabab Jee's")}`
);

assert(
  generateSlug("Mario's Pizza") === 'marios-pizza',
  "Test 1b: 'Mario\'s Pizza' generates 'marios-pizza'",
  `Got: ${generateSlug("Mario's Pizza")}`
);

assert(
  generateSlug('Burger House') === 'burger-house',
  "Test 1c: 'Burger House' generates 'burger-house'",
  `Got: ${generateSlug('Burger House')}`
);

assert(
  generateSlug('My Restaurant') === 'my-restaurant',
  "Test 1d: 'My Restaurant' generates 'my-restaurant'",
  `Got: ${generateSlug('My Restaurant')}`
);

// 2. Slug normalization edge cases
assert(
  generateSlug('   Tandoori & Grill #1 !!!   ') === 'tandoori-grill-1',
  'Test 2a: Trims whitespace, strips symbols, collapses hyphens',
  `Got: ${generateSlug('   Tandoori & Grill #1 !!!   ')}`
);

assert(
  generateSlug("L'Osteria Del Sole") === 'losteria-del-sole',
  "Test 2b: Handles multiple words with single quotes without leaving hyphens for quotes",
  `Got: ${generateSlug("L'Osteria Del Sole")}`
);

assert(
  generateSlug('A Very Long Restaurant Name That Exceeds Thirty Characters In Total Length') ===
    'a-very-long-restaurant-name-th',
  'Test 2c: Truncates at max length (30 chars) without trailing hyphens',
  `Got: ${generateSlug('A Very Long Restaurant Name That Exceeds Thirty Characters In Total Length')}`
);

// 3. Reserved routes protection
const reservedExamples = [
  'app',
  'admin',
  'api',
  'dashboard',
  'login',
  'signup',
  'register',
  'settings',
  'auth',
  'storefront',
  'menu',
  'deals',
  'cart',
  'checkout',
];

for (const reserved of reservedExamples) {
  assert(
    RESERVED_SLUGS.has(reserved) && !isValidSlug(reserved).valid,
    `Test 3: Reserved route '${reserved}' is rejected`,
    `isValidSlug('${reserved}').valid returned ${isValidSlug(reserved).valid}`
  );
}

// 4. Slug validity rules
assert(isValidSlug('marios-pizza').valid === true, "Test 4a: 'marios-pizza' is valid");
assert(isValidSlug('kababjees').valid === true, "Test 4b: 'kababjees' is valid");
assert(isValidSlug('k').valid === false, "Test 4c: Single char 'k' is rejected (min 3 chars)");
assert(isValidSlug('-marios-').valid === false, "Test 4d: Leading/trailing hyphens are rejected");
assert(isValidSlug('Mario_Pizza').valid === false, "Test 4e: Uppercase and underscores are rejected");

// 5. Vercel hostname bug prevention
// Simulate getSubdomain logic on production hostname
const vercelHostname = 'dinecraft-six.vercel.app';
const detectedOnVercel = getSubdomain(vercelHostname);
assert(
  detectedOnVercel === null,
  "Test 5a: Hostname 'dinecraft-six.vercel.app' returns null (never extracted as tenant slug)",
  `Got: ${detectedOnVercel}`
);

const vercelPreviewHostname = 'dinecraft-git-feature-preview.vercel.app';
assert(
  getSubdomain(vercelPreviewHostname) === null,
  "Test 5b: Vercel preview hostnames return null",
  `Got: ${getSubdomain(vercelPreviewHostname)}`
);

const localhost = 'localhost';
assert(
  getSubdomain(localhost) === null,
  "Test 5c: 'localhost' returns null",
  `Got: ${getSubdomain(localhost)}`
);

const ipHost = '127.0.0.1';
assert(
  getSubdomain(ipHost) === null,
  "Test 5d: '127.0.0.1' returns null",
  `Got: ${getSubdomain(ipHost)}`
);

// 6. URL generation tests (Path-based)
const baseUrl = buildStorefrontUrl('marios-pizza');
assert(
  baseUrl.endsWith('/marios-pizza'),
  "Test 6a: buildStorefrontUrl generates '/marios-pizza' path",
  `Got: ${baseUrl}`
);

const menuUrl = buildStorefrontUrl('marios-pizza', 'menu');
assert(
  menuUrl.endsWith('/marios-pizza/menu'),
  "Test 6b: buildStorefrontUrl with subpage generates '/marios-pizza/menu'",
  `Got: ${menuUrl}`
);

const cartUrlLeadingSlash = buildStorefrontUrl('marios-pizza', '/cart');
assert(
  cartUrlLeadingSlash.endsWith('/marios-pizza/cart'),
  "Test 6c: buildStorefrontUrl handles leading slash in path gracefully",
  `Got: ${cartUrlLeadingSlash}`
);

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
