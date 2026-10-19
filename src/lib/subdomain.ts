/**
 * Shopify-Style Subdomain Routing Utilities
 *
 * Reads window.location.hostname to determine restaurant subdomains:
 * - "my-restaurant.localhost" -> "my-restaurant"
 * - "my-restaurant.dinecraft.com" -> "my-restaurant"
 * - "localhost" -> null
 * - "127.0.0.1" -> null
 * - "dinecraft.com" -> null
 * - "www.dinecraft.com" -> null
 * - "admin.localhost" / "app.dinecraft.com" -> null (reserved system subdomains)
 */

export const RESERVED_SUBDOMAINS = new Set([
  'www',
  'admin',
  'app',
  'api',
  'dashboard',
  'login',
  'signup',
  'mail',
  'support',
  'help',
  'static',
  'assets',
  'cdn',
  'saas',
  'onboarding',
]);

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
 * Extracts and returns the tenant subdomain from window.location.hostname or the provided hostname string.
 * Returns null if accessed from localhost root, the apex production domain, an IP address, or a reserved subdomain.
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

  // Development: *.localhost:3000
  if (host === 'localhost') {
    return null;
  }

  if (host.endsWith('.localhost')) {
    const prefix = host.replace(/\.localhost$/, '');
    const parts = prefix.split('.');
    const candidate = parts[parts.length - 1];
    if (!candidate || RESERVED_SUBDOMAINS.has(candidate)) {
      return null;
    }
    return candidate;
  }

  // Production or Custom Root Domain: *.dinecraft.com
  const rootDomain = getRootDomain().toLowerCase().trim();

  // Exact apex domain or www
  if (host === rootDomain || host === `www.${rootDomain}`) {
    return null;
  }

  if (host.endsWith(`.${rootDomain}`)) {
    const prefix = host.slice(0, -(rootDomain.length + 1));
    const parts = prefix.split('.');
    const candidate = parts[parts.length - 1];
    if (!candidate || RESERVED_SUBDOMAINS.has(candidate)) {
      return null;
    }
    return candidate;
  }

  // Generic fallback if user visits a custom multi-level domain (e.g., custom-slug.domain.com)
  const parts = host.split('.');
  if (parts.length > 2) {
    const candidate = parts[0];
    if (!RESERVED_SUBDOMAINS.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Validates whether a proposed subdomain string is valid format and not reserved.
 */
export function isValidSubdomain(subdomain: string): { valid: boolean; error?: string } {
  if (!subdomain) {
    return { valid: false, error: 'Subdomain is required.' };
  }

  const clean = subdomain.toLowerCase().trim();

  if (clean.length < 3) {
    return { valid: false, error: 'Subdomain must be at least 3 characters long.' };
  }

  if (clean.length > 30) {
    return { valid: false, error: 'Subdomain cannot exceed 30 characters.' };
  }

  if (!/^[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?$/.test(clean)) {
    return {
      valid: false,
      error: 'Subdomain can only contain lowercase letters, numbers, and hyphens (cannot start or end with a hyphen).',
    };
  }

  if (RESERVED_SUBDOMAINS.has(clean)) {
    return {
      valid: false,
      error: `"${clean}" is a reserved system name. Please choose another subdomain.`,
    };
  }

  return { valid: true };
}

/**
 * Builds the full URL for a restaurant's storefront based on its subdomain or slug.
 */
export function buildStorefrontUrl(
  subdomainOrSlug: string,
  path: string = ''
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanSub = subdomainOrSlug.toLowerCase().trim();

  if (typeof window === 'undefined') {
    return `${cleanPath}`;
  }

  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;

  // Localhost environment
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return `${protocol}//${cleanSub}.localhost${port}${cleanPath}`;
  }

  // Production environment
  const rootDomain = getRootDomain();
  if (hostname === rootDomain || hostname.endsWith(`.${rootDomain}`)) {
    return `${protocol}//${cleanSub}.${rootDomain}${cleanPath}`;
  }

  // Fallback to path-based on unexpected hosts
  return `/${cleanSub}${cleanPath}`;
}
