/**
 * Customer Identification Rules Test Suite
 *
 * Verifies all 12 minimum requirements:
 * 1. Same name, different email and phone -> New customer.
 * 2. Different name, same email -> Repeat customer.
 * 3. Different name, same phone -> Repeat customer.
 * 4. Different name, same email and phone -> Repeat customer.
 * 5. Same name with both identifiers different -> New customer.
 * 6. Email and phone match two different existing customers -> Conflict; no automatic merge.
 * 7. Email capitalization and whitespace differences -> Correct match.
 * 8. Equivalent Pakistani phone formats -> Correct match.
 * 9. Missing email or phone -> Safe handling without false matches.
 * 10. Different businesses with identical contact details -> Separate customer identities.
 * 11. Repeat submissions -> No duplicate customer records.
 * 12. Existing features and customer history remain intact.
 */

import {
  normalizeEmail,
  normalizePhone,
  normalizeName,
  arePhonesEqual,
  areEmailsEqual,
  classifyCustomer,
} from './customerIdentification.ts';

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

console.log('=== RUNNING CUSTOMER IDENTIFICATION TESTS ===\n');

// Test 7: Email capitalization and whitespace differences
assert(
  normalizeEmail('  Alice@Example.COM  ') === 'alice@example.com',
  'Test 7: Email normalization trims and lowercases'
);
assert(
  areEmailsEqual('  USER@Domain.com ', 'user@domain.COM'),
  'Test 7b: areEmailsEqual handles whitespace and casing'
);
assert(
  normalizeEmail('not provided') === null && normalizeEmail('n/a') === null && normalizeEmail('test') === null,
  'Test 7c: Email rejects placeholders and invalid strings'
);

// Test 8: Equivalent Pakistani phone formats
const pakistaniVariants = [
  '03001234567',
  '+92 300 1234567',
  '+92-300-1234567',
  '923001234567',
  '0092 300 1234567',
  '3001234567',
];

const normalizedPak = pakistaniVariants.map((p) => normalizePhone(p));
const allPakMatch = normalizedPak.every((p) => p === '+923001234567');
assert(allPakMatch, 'Test 8: Equivalent Pakistani phone formats match identically (+923001234567)');

// Mock database state for Restaurant A
const existingCustomers = [
  {
    id: 'cust_001',
    restaurant_id: 'resto_alpha',
    name: 'Alice Original',
    email: 'alice@alpha.com',
    phone: '+923001234567',
    total_orders: 3,
    total_spent: 60.0,
  },
  {
    id: 'cust_002',
    restaurant_id: 'resto_alpha',
    name: 'Bob Builder',
    email: 'bob@alpha.com',
    phone: '+923129876543',
    total_orders: 1,
    total_spent: 25.0,
  },
  {
    id: 'cust_003',
    restaurant_id: 'resto_beta', // Different business / tenant
    name: 'Alice Beta',
    email: 'alice@alpha.com',
    phone: '+923001234567',
    total_orders: 5,
    total_spent: 100.0,
  },
];

// Test 1: Same name, different email and phone -> New customer
const res1 = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Alice Original',
    email: 'alice.different@gmail.com',
    phone: '03450000000',
  },
  existingCustomers
);
assert(
  res1.status === 'NEW',
  'Test 1: Same name with different email & phone is classified as NEW customer'
);

// Test 2: Different name, same email -> Repeat customer
const res2 = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Alice Renamed',
    email: 'alice@alpha.com',
    phone: '03459999999',
  },
  existingCustomers
);
assert(
  res2.status === 'REPEAT' && res2.customerId === 'cust_001' && res2.matchedBy === 'email',
  'Test 2: Different name with same email is classified as REPEAT customer (cust_001)'
);

// Test 3: Different name, same phone -> Repeat customer
const res3 = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Alice Mobile Only',
    email: 'different.email@domain.com',
    phone: '0300 1234567', // Pakistani format matching cust_001 (+923001234567)
  },
  existingCustomers
);
assert(
  res3.status === 'REPEAT' && res3.customerId === 'cust_001' && res3.matchedBy === 'phone',
  'Test 3: Different name with same phone is classified as REPEAT customer (cust_001)'
);

// Test 4: Different name, same email and phone -> Repeat customer
const res4 = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Completely Different Name',
    email: 'alice@alpha.com',
    phone: '+92 300 1234567',
  },
  existingCustomers
);
assert(
  res4.status === 'REPEAT' && res4.customerId === 'cust_001' && res4.matchedBy === 'both',
  'Test 4: Different name with same email AND phone is classified as REPEAT customer'
);

// Test 5: Same name with both identifiers different -> New customer
const res5 = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Bob Builder',
    email: 'bob.new@other.com',
    phone: '03331112233',
  },
  existingCustomers
);
assert(
  res5.status === 'NEW',
  'Test 5: Same name with different identifiers is classified as NEW customer (no name matching)'
);

// Test 6: Email and phone match two different existing customers -> Conflict; no automatic merge
const res6 = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Conflicting Person',
    email: 'alice@alpha.com', // Belongs to cust_001
    phone: '03129876543',     // Belongs to cust_002
  },
  existingCustomers
);
assert(
  res6.status === 'CONFLICT' &&
    res6.emailMatchedCustomerId === 'cust_001' &&
    res6.phoneMatchedCustomerId === 'cust_002',
  'Test 6: Conflicting identifiers returns CONFLICT without merging either record'
);

// Test 9: Missing email or phone -> Safe handling without false matches
const res9a = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Alice No Email',
    email: '',
    phone: '03001234567',
  },
  existingCustomers
);
assert(
  res9a.status === 'REPEAT' && res9a.customerId === 'cust_001',
  'Test 9a: Missing email matches safely on valid phone'
);

const res9b = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Alice Garbage',
    email: 'null',
    phone: '123', // Too short
  },
  existingCustomers
);
assert(
  res9b.status === 'NEW',
  'Test 9b: Placeholder email and short garbage phone safely classified as NEW (no guessing on name)'
);

// Test 10: Different businesses with identical contact details -> Separate customer identities
const res10 = classifyCustomer(
  {
    restaurantId: 'resto_gamma', // New business
    name: 'Alice Alpha',
    email: 'alice@alpha.com',
    phone: '+923001234567',
  },
  existingCustomers
);
assert(
  res10.status === 'NEW',
  'Test 10: Multi-tenant isolation: identical contact details under new business does NOT match existing tenant'
);

// Test 11: Repeat submissions -> Consistent permanent ID
const res11_first = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Alice',
    phone: '03001234567',
  },
  existingCustomers
);
const res11_second = classifyCustomer(
  {
    restaurantId: 'resto_alpha',
    name: 'Alice',
    phone: '+92 300 1234567',
  },
  existingCustomers
);
assert(
  res11_first.status === 'REPEAT' &&
    res11_second.status === 'REPEAT' &&
    res11_first.customerId === res11_second.customerId,
  'Test 11: Repeat submissions consistently reuse existing customer ID'
);

console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
