/**
 * Customer Identification, Normalization, and Safe Matching System
 *
 * Implements strict rules for safe new vs. repeat customer detection:
 * - Identify customers using normalized email and phone number, NOT their name.
 * - Rule A: Same email AND same phone -> Repeat customer, even if name is different.
 * - Rule B: Same phone, different email -> Repeat customer (phone matches one existing customer).
 * - Rule C: Same email, different phone -> Repeat customer (email matches one existing customer).
 * - Rule D: Same name, different email AND different phone -> NEW customer.
 * - Rule E: Different name, different email AND different phone -> NEW customer.
 * - Rule F: Conflicting identifiers -> Do NOT automatically merge either record. Safely flag conflict.
 * - Rule G: Missing/placeholder identifiers -> Safely handle without guessing on name.
 * - Multi-tenant isolation: Scoped strictly within the same restaurantId.
 */

// 1. NORMALIZATION FUNCTIONS

/**
 * Normalizes email by trimming, converting to lowercase, and rejecting invalid or placeholder values.
 */
export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  const placeholders = [
    'null',
    'undefined',
    'none',
    'n/a',
    'na',
    'deleted',
    'unknown',
    'not provided',
    'no-email',
    'test@test',
    'placeholder@placeholder.com',
  ];
  if (placeholders.includes(trimmed)) return null;

  // Basic email structure validation
  if (!trimmed.includes('@') || !trimmed.includes('.')) return null;

  return trimmed;
}

/**
 * Normalizes phone numbers by trimming, stripping formatting characters (spaces, hyphens, parentheses),
 * standardizing Pakistani formats (e.g. 03001234567, +92 300 1234567, 0092 300 1234567, 3001234567)
 * to canonical +923XXXXXXXXX, and rejecting placeholders or short garbage strings.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const placeholders = [
    'null',
    'undefined',
    'none',
    'n/a',
    'na',
    'deleted',
    'unknown',
    'not provided',
    'test',
    '0',
  ];
  if (placeholders.includes(lower)) return null;

  // Extract digits only
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) {
    // Too short to be a valid phone number, avoids false positive matches on garbage
    return null;
  }

  // Pakistani mobile format canonicalization:
  // 1. 00923XXXXXXXXX (14 digits) -> +923XXXXXXXXX
  if (digits.startsWith('00923') && digits.length === 14) {
    return '+92' + digits.slice(4);
  }
  // 2. 923XXXXXXXXX (12 digits) -> +923XXXXXXXXX
  if (digits.startsWith('923') && digits.length === 12) {
    return '+' + digits;
  }
  // 3. 03XXXXXXXXX (11 digits, standard local) -> +923XXXXXXXXX
  if (digits.startsWith('03') && digits.length === 11) {
    return '+92' + digits.slice(1);
  }
  // 4. 3XXXXXXXXX (10 digits, missing leading 0 or +92) -> +923XXXXXXXXX
  if (digits.startsWith('3') && digits.length === 10) {
    return '+92' + digits;
  }

  // Standard international number with '+' prefix
  if (trimmed.startsWith('+')) {
    return '+' + digits;
  }

  return digits;
}

/**
 * Trims and collapses multiple spaces in names for display.
 * Name is NEVER used as an identity matching key.
 */
export function normalizeName(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return 'Customer';
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  return cleaned || 'Customer';
}

/**
 * Checks whether two phone numbers represent the same phone after normalization.
 */
export function arePhonesEqual(p1: string | null | undefined, p2: string | null | undefined): boolean {
  const norm1 = normalizePhone(p1);
  const norm2 = normalizePhone(p2);
  if (!norm1 || !norm2) return false;
  return norm1 === norm2;
}

/**
 * Checks whether two emails represent the same email after normalization.
 */
export function areEmailsEqual(e1: string | null | undefined, e2: string | null | undefined): boolean {
  const norm1 = normalizeEmail(e1);
  const norm2 = normalizeEmail(e2);
  if (!norm1 || !norm2) return false;
  return norm1 === norm2;
}

// 2. TYPES FOR CUSTOMER CANDIDATES AND CLASSIFICATION

export interface CustomerCandidate {
  id?: string;
  restaurantId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  orderTotal?: number;
}

export type CustomerClassificationResult =
  | {
      status: 'REPEAT';
      customerId: string;
      matchedBy: 'both' | 'phone' | 'email';
      existingRecord: any;
    }
  | {
      status: 'NEW';
      reason: 'no_match' | 'name_only_match';
    }
  | {
      status: 'CONFLICT';
      phoneMatchedCustomerId: string;
      emailMatchedCustomerId: string;
      phoneCustomer: any;
      emailCustomer: any;
      message: string;
    };

// 3. CLASSIFICATION ENGINE

/**
 * Classifies an incoming customer submission as REPEAT, NEW, or CONFLICT.
 *
 * Rules:
 * - Match ONLY by normalized phone or normalized email.
 * - Scoped strictly to candidate.restaurantId (multi-tenant safety).
 * - Never match by name alone.
 * - Conflicting identifiers (phone belongs to customer A, email belongs to customer B)
 *   returns CONFLICT without merging either record.
 */
export function classifyCustomer(
  candidate: CustomerCandidate,
  existingCustomers: any[]
): CustomerClassificationResult {
  // 1. Multi-Tenant isolation: filter existing customers strictly to candidate.restaurantId
  const restaurantScope = (existingCustomers || []).filter(
    (c) => (c.restaurant_id || c.restaurantId) === candidate.restaurantId
  );

  const normPhone = normalizePhone(candidate.phone);
  const normEmail = normalizeEmail(candidate.email);

  // Rule G: Missing/invalid identifiers -> Cannot identify as repeat, treat as NEW
  if (!normPhone && !normEmail) {
    return { status: 'NEW', reason: 'no_match' };
  }

  // Find match by normalized phone
  let matchedByPhone: any = null;
  if (normPhone) {
    matchedByPhone = restaurantScope.find((c) => {
      const cPhone = normalizePhone(c.phone);
      return cPhone !== null && cPhone === normPhone;
    });
  }

  // Find match by normalized email
  let matchedByEmail: any = null;
  if (normEmail) {
    matchedByEmail = restaurantScope.find((c) => {
      const cEmail = normalizeEmail(c.email);
      return cEmail !== null && cEmail === normEmail;
    });
  }

  // Evaluate Rule A and Rule F:
  if (matchedByPhone && matchedByEmail) {
    if (matchedByPhone.id === matchedByEmail.id) {
      // Rule A: Both email AND phone match the SAME existing customer -> REPEAT
      return {
        status: 'REPEAT',
        customerId: matchedByPhone.id,
        matchedBy: 'both',
        existingRecord: matchedByPhone,
      };
    } else {
      // Rule F: Conflicting identifiers! Email matches customer A, phone matches customer B!
      // Do NOT automatically merge either record.
      return {
        status: 'CONFLICT',
        phoneMatchedCustomerId: matchedByPhone.id,
        emailMatchedCustomerId: matchedByEmail.id,
        phoneCustomer: matchedByPhone,
        emailCustomer: matchedByEmail,
        message: `Customer conflict: Phone ${normPhone} matches customer ${matchedByPhone.id} (${matchedByPhone.name}), but Email ${normEmail} matches customer ${matchedByEmail.id} (${matchedByEmail.name}). Records preserved without merging.`,
      };
    }
  }

  // Rule B: Phone matches an existing customer, email does not match any other customer -> REPEAT
  if (matchedByPhone) {
    return {
      status: 'REPEAT',
      customerId: matchedByPhone.id,
      matchedBy: 'phone',
      existingRecord: matchedByPhone,
    };
  }

  // Rule C: Email matches an existing customer, phone does not match any other customer -> REPEAT
  if (matchedByEmail) {
    return {
      status: 'REPEAT',
      customerId: matchedByEmail.id,
      matchedBy: 'email',
      existingRecord: matchedByEmail,
    };
  }

  // Rule D & E: Neither phone nor email matches any existing customer.
  // Check if name happens to match an existing customer
  const cleanName = (candidate.name || '').trim().toLowerCase();
  const nameOnlyMatch = cleanName
    ? restaurantScope.some((c) => (c.name || '').trim().toLowerCase() === cleanName)
    : false;

  // Rule D & E: Always classify as NEW customer! Never classify based on name alone!
  return {
    status: 'NEW',
    reason: nameOnlyMatch ? 'name_only_match' : 'no_match',
  };
}
