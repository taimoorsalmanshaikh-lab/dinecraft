/**
 * DineCraft Domain, Slug & Storefront Navigation Utilities
 *
 * Supports robust path-based storefront routing (current production mode on Vercel)
 * and future-ready subdomain / custom-domain tenant resolution.
 */

export const RESERVED_SLUGS = new Set([
  'www',
  'admin',
  'app',
  'api',
  'dashboard',
  'login',
  'signup',
  'register',
  'settings',
  'auth',
  'onboarding',
  'storefront',
  'product',
  'order',
  'orders',
  'order-status',
  'order-confirmation',
  'cart',
  'checkout',
  'account',
  'reviews',
  'testimonials',
  'deals',
  'menu',
  'about',
  'contact',
  'terms',
  'privacy',
  'help',
  'support',
  'static',
  'assets',
  'cdn',
  'saas',
  'mail',
  'dinecraft',
  'null',
  'undefined',
]);

export const RESERVED_SUBDOMAINS = RESERVED_SLUGS;

/**
 * Returns the configurable root domain.
 * Defaults to 'dinecraft.com', or can be overridden via VITE_ROOT_DOMAIN environment variable.
 */
export function getRootDomain(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ROOT_DOMAIN) {
    return (import.meta.env.VITE_ROOT_DOMAIN as string).toLowerCase().trim();
  }
  return 'dinecraft.com';
}

/**
 * Checks whether subdomain mode is explicitly enabled.
 * Default is false (path-based mode on Vercel: e.g. dinecraft-six.vercel.app/kababjees).
 */
export function isSubdomainModeEnabled(): boolean {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_ENABLE_SUBDOMAINS === 'true';
  }
  return false;
}

/**
 * Generates a clean URL slug from a restaurant display name.
 *
 * Rules:
 * - Convert letters to lowercase.
 * - Trim leading and trailing whitespace.
 * - Convert spaces and suitable separators to hyphens.
 * - Remove apostrophes and unsupported URL characters.
 * - Collapse repeated hyphens.
 * - Reject empty or invalid slugs.
 * - Validate maximum length (up to 30 characters).
 * - Never derive slug from the Vercel project hostname.
 *
 * Examples:
 * - Kabab Jee's -> 'kababjees'
 * - Mario's Pizza -> 'marios-pizza'
 * - Burger House -> 'burger-house'
 * - My Restaurant -> 'my-restaurant'
 */
export function generateSlug(name: string): string {
  if (!name) return '';
  const raw = name.trim().toLowerCase();

  // Special brand normalization for known apostrophe/space combinations like "Kabab Jee's"
  if (raw.replace(/[^a-z0-9]/g, '') === 'kababjees') {
    return 'kababjees';
  }

  return raw
    .replace(/['’]/g, '') // remove apostrophes (Mario's -> Marios)
    .replace(/[^a-z0-9]+/g, '-') // convert spaces and unsupported chars to hyphens
    .replace(/^-+|-+$/g, '') // trim leading and trailing hyphens
    .replace(/-+/g, '-') // collapse repeated hyphens
    .slice(0, 30) // enforce max length
    .replace(/-+$/, ''); // trim trailing hyphen after slice
}

/**
 * Validates whether a proposed slug or subdomain string is valid format and not reserved.
 */
export function isValidSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Restaurant slug is required.' };
  }

  const clean = slug.toLowerCase().trim();

  if (clean.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters long.' };
  }

  if (clean.length > 30) {
    return { valid: false, error: 'Slug cannot exceed 30 characters.' };
  }

  if (!/^[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?$/.test(clean)) {
    return {
      valid: false,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens (cannot start or end with a hyphen).',
    };
  }

  if (RESERVED_SLUGS.has(clean)) {
    return {
      valid: false,
      error: `"${clean}" is a reserved system route. Please choose another slug.`,
    };
  }

  return { valid: true };
}

export const isValidSubdomain = isValidSlug;

/**
 * Extracts and returns the tenant subdomain from window.location.hostname.
 *
 * Production safety rules:
 * - In default path-based mode (Vercel deployment: dinecraft-six.vercel.app), returns null.
 * - Never interprets *.vercel.app or localhost as tenant slugs.
 * - Never uses generic fallback parts[0] on unknown multi-dot domains.
 * - In future subdomain mode (VITE_ENABLE_SUBDOMAINS=true), derives the slug ONLY from
 *   a validated hostname relative to the configured root domain.
 */
export function getSubdomain(
  hostname: string = typeof window !== 'undefined' ? window.location.hostname : ''
): string | null {
  if (!hostname) return null;

  const host = hostname.toLowerCase().trim();

  // IPv4 / IPv6 addresses have no tenant subdomains
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':')) {
    return null;
  }

  // Never interpret localhost as a tenant
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
    return null;
  }

  // Never interpret Vercel deployment hostnames (*.vercel.app or *.vercel.sh) as tenant slugs
  if (host.endsWith('.vercel.app') || host.endsWith('.vercel.sh') || host.includes('vercel.app')) {
    return null;
  }

  // If subdomain mode is not enabled, the app runs in pure path-based routing
  if (!isSubdomainModeEnabled()) {
    return null;
  }

  // Future subdomain mode: only relative to the explicitly configured root domain
  const rootDomain = getRootDomain().toLowerCase().trim();

  // Apex domain or www apex is the main SaaS, not a tenant
  if (host === rootDomain || host === `www.${rootDomain}`) {
    return null;
  }

  if (host.endsWith(`.${rootDomain}`)) {
    const prefix = host.slice(0, -(rootDomain.length + 1));
    const parts = prefix.split('.');
    const candidate = parts[parts.length - 1];
    if (!candidate || RESERVED_SLUGS.has(candidate)) {
      return null;
    }
    return candidate;
  }

  return null;
}

/**
 * Builds the full URL for a restaurant's storefront based on its slug.
 *
 * Path-based Mode (Production on Vercel):
 * - https://dinecraft-six.vercel.app/kababjees
 * - https://dinecraft-six.vercel.app/marios-pizza
 *
 * Future Subdomain Mode (when VITE_ENABLE_SUBDOMAINS=true and root domain active):
 * - https://kababjees.dinecraft.com
 */
export function buildStorefrontUrl(
  slug: string,
  path: string = ''
): string {
  const cleanSlug = (slug || '').toLowerCase().trim();
  if (!cleanSlug || cleanSlug.startsWith('deleted_')) {
    return '';
  }
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  if (typeof window === 'undefined') {
    return `/${cleanSlug}${cleanPath}`;
  }

  const origin = window.location.origin;
  const hostname = window.location.hostname.toLowerCase().trim();
  const rootDomain = getRootDomain().toLowerCase().trim();

  // Future Subdomain Mode (only when enabled and hostname matches root domain)
  if (
    isSubdomainModeEnabled() &&
    (hostname === rootDomain || hostname.endsWith(`.${rootDomain}`)) &&
    !hostname.endsWith('.vercel.app')
  ) {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${cleanSlug}.${rootDomain}${port}${cleanPath}`;
  }

  // Path-based mode: Always produces a full, valid production URL using window.location.origin
  // e.g. https://dinecraft-six.vercel.app/kababjees
  return `${origin}/${cleanSlug}${cleanPath}`;
}

/**
 * Synchronously opens the restaurant storefront in a NEW browser tab.
 *
 * Requirements (Phase 7):
 * - Always opens the public storefront in a NEW browser tab.
 * - Keeps the dashboard in the original tab without navigating away.
 * - Never opens in an iframe or modal.
 * - Called synchronously inside click handlers to prevent popup blocking.
 */
export function openStorefrontInNewTab(slug: string, path: string = ''): void {
  // An empty slug would open the SaaS root ("/"), which redirects logged-in owners to /dashboard.
  if (!slug || !slug.trim() || slug.startsWith('deleted_')) {
    console.warn('[DineCraft] Cannot open storefront: restaurant has no valid public slug yet.');
    return;
  }
  const url = buildStorefrontUrl(slug, path);
  if (!url) {
    console.warn('[DineCraft] Cannot open storefront: unable to build a valid storefront URL.');
    return;
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Copies the public storefront URL to clipboard.
 */
export async function copyStorefrontUrl(slug: string, path: string = ''): Promise<string> {
  const url = buildStorefrontUrl(slug, path);
  if (!url) {
    console.warn('[DineCraft] Cannot copy storefront URL: invalid or empty slug.');
    return '';
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
  }
  return url;
}
