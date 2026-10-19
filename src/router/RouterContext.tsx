import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getSubdomain } from '../lib/subdomain';

export interface RouteMatch {
  path: string;
  isStorefront: boolean;
  restaurantSlug?: string;
  subdomain?: string | null;
  storefrontSubpage?:
    | 'home'
    | 'menu'
    | 'deals'
    | 'about'
    | 'contact'
    | 'cart'
    | 'checkout'
    | 'order-confirmation'
    | 'order-status'
    | 'product'
    | 'orders'
    | 'account'
    | 'reviews';
  orderId?: string;
  itemId?: string;
  isDashboard: boolean;
  dashboardSubpage?:
    | 'overview'
    | 'menu'
    | 'deals'
    | 'website'
    | 'orders'
    | 'customers'
    | 'settings'
    | 'subscription'
    | 'assets'
    | 'reviews';
  isAuth: boolean;
  authType?: 'login' | 'signup';
  isOnboarding: boolean;
  isLanding: boolean;
}

export interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  routeMatch: RouteMatch;
  subdomain: string | null;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Helper to normalize path from HTML5 pathname or legacy hash migration
function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';

  // Transparently migrate legacy hash URLs (e.g. #/dashboard/menu -> /dashboard/menu)
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const legacyPath = window.location.hash.slice(1);
    window.history.replaceState({}, '', legacyPath);
    return legacyPath;
  }

  const path = window.location.pathname;
  if (path && path !== '') {
    return path;
  }
  return '/';
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const detectedSubdomain = useMemo(() => getSubdomain(), []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((targetPath: string) => {
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    window.history.pushState({}, '', cleanPath);
    setCurrentPath(cleanPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Parse path into semantic match
  const routeMatch = useMemo<RouteMatch>(() => {
    const raw = currentPath.split('?')[0].replace(/\/+$/, '') || '/';
    const parts = raw.split('/').filter(Boolean);

    // 1. SUBDOMAIN-BASED TENANT STOREFRONT (e.g. http://my-restaurant.localhost:3000/ or my-restaurant.dinecraft.com)
    if (detectedSubdomain) {
      const restaurantSlug = detectedSubdomain;

      // Allow owner to navigate to dashboard or login even on their subdomain if needed
      if (parts[0] === 'dashboard') {
        const second = (parts[1] || 'overview').toLowerCase() as RouteMatch['dashboardSubpage'];
        return {
          path: raw,
          subdomain: detectedSubdomain,
          isStorefront: false,
          isDashboard: true,
          dashboardSubpage: [
            'menu',
            'deals',
            'website',
            'orders',
            'customers',
            'settings',
            'subscription',
            'assets',
            'reviews',
          ].includes(second || '')
            ? second
            : 'overview',
          isAuth: false,
          isOnboarding: false,
          isLanding: false,
        };
      }

      // If URL contains the slug in path (e.g. /my-restaurant/menu), shift parts so it resolves smoothly
      let first = parts[0]?.toLowerCase() || '';
      let remaining = parts.slice(1);
      if (first === restaurantSlug.toLowerCase()) {
        first = remaining[0]?.toLowerCase() || '';
        remaining = remaining.slice(1);
      }

      if (!first || first === '') {
        return {
          path: raw,
          subdomain: detectedSubdomain,
          isStorefront: true,
          restaurantSlug,
          storefrontSubpage: 'home',
          isDashboard: false,
          isAuth: false,
          isOnboarding: false,
          isLanding: false,
        };
      }

      if (first === 'product' && remaining[0]) {
        return {
          path: raw,
          subdomain: detectedSubdomain,
          isStorefront: true,
          restaurantSlug,
          storefrontSubpage: 'product',
          itemId: remaining[0],
          isDashboard: false,
          isAuth: false,
          isOnboarding: false,
          isLanding: false,
        };
      }

      if (first === 'order-confirmation' && remaining[0]) {
        return {
          path: raw,
          subdomain: detectedSubdomain,
          isStorefront: true,
          restaurantSlug,
          storefrontSubpage: 'order-confirmation',
          orderId: remaining[0],
          isDashboard: false,
          isAuth: false,
          isOnboarding: false,
          isLanding: false,
        };
      }

      if (first === 'order-status' && remaining[0]) {
        return {
          path: raw,
          subdomain: detectedSubdomain,
          isStorefront: true,
          restaurantSlug,
          storefrontSubpage: 'order-status',
          orderId: remaining[0],
          isDashboard: false,
          isAuth: false,
          isOnboarding: false,
          isLanding: false,
        };
      }

      if (first === 'orders' || first === 'account') {
        return {
          path: raw,
          subdomain: detectedSubdomain,
          isStorefront: true,
          restaurantSlug,
          storefrontSubpage: 'orders',
          isDashboard: false,
          isAuth: false,
          isOnboarding: false,
          isLanding: false,
        };
      }

      if (first === 'reviews' || first === 'testimonials') {
        return {
          path: raw,
          subdomain: detectedSubdomain,
          isStorefront: true,
          restaurantSlug,
          storefrontSubpage: 'reviews',
          isDashboard: false,
          isAuth: false,
          isOnboarding: false,
          isLanding: false,
        };
      }

      const validSubpages: NonNullable<RouteMatch['storefrontSubpage']>[] = [
        'home',
        'menu',
        'deals',
        'about',
        'contact',
        'cart',
        'checkout',
        'product',
        'orders',
        'account',
        'reviews',
      ];

      const storefrontSubpage = validSubpages.includes(
        first as NonNullable<RouteMatch['storefrontSubpage']>
      )
        ? (first as NonNullable<RouteMatch['storefrontSubpage']>)
        : 'home';

      return {
        path: raw,
        subdomain: detectedSubdomain,
        isStorefront: true,
        restaurantSlug,
        storefrontSubpage,
        isDashboard: false,
        isAuth: false,
        isOnboarding: false,
        isLanding: false,
      };
    }

    // 2. MAIN SAAS SITE (No subdomain, e.g. localhost:3000 or dinecraft.com)
    const first = parts.length > 0 ? parts[0].toLowerCase() : '';

    // Root path is the DineCraft SaaS Login Screen
    if (parts.length === 0 || first === '') {
      return {
        path: '/',
        isStorefront: false,
        isDashboard: false,
        isAuth: true,
        authType: 'login',
        isOnboarding: false,
        isLanding: false,
      };
    }

    // Auth
    if (first === 'login') {
      return {
        path: '/login',
        isStorefront: false,
        isDashboard: false,
        isAuth: true,
        authType: 'login',
        isOnboarding: false,
        isLanding: false,
      };
    }
    if (first === 'signup') {
      return {
        path: '/signup',
        isStorefront: false,
        isDashboard: false,
        isAuth: true,
        authType: 'signup',
        isOnboarding: false,
        isLanding: false,
      };
    }

    // Onboarding
    if (first === 'onboarding') {
      return {
        path: '/onboarding',
        isStorefront: false,
        isDashboard: false,
        isAuth: false,
        isOnboarding: true,
        isLanding: false,
      };
    }

    // Dashboard
    if (first === 'dashboard') {
      const second = (parts[1] || 'overview').toLowerCase() as RouteMatch['dashboardSubpage'];
      return {
        path: raw,
        isStorefront: false,
        isDashboard: true,
        dashboardSubpage: [
          'menu',
          'deals',
          'website',
          'orders',
          'customers',
          'settings',
          'subscription',
          'assets',
          'reviews',
        ].includes(second || '')
          ? second
          : 'overview',
        isAuth: false,
        isOnboarding: false,
        isLanding: false,
      };
    }

    // Path-based Storefront routes: /:restaurantSlug or /:restaurantSlug/menu, /deals, /cart, /checkout, /product/:itemId, /account, /reviews
    const restaurantSlug = parts[0];
    const second = (parts[1] || 'home').toLowerCase();

    if (second === 'product' && parts[2]) {
      return {
        path: raw,
        isStorefront: true,
        restaurantSlug,
        storefrontSubpage: 'product',
        itemId: parts[2],
        isDashboard: false,
        isAuth: false,
        isOnboarding: false,
        isLanding: false,
      };
    }

    if (second === 'order-confirmation' && parts[2]) {
      return {
        path: raw,
        isStorefront: true,
        restaurantSlug,
        storefrontSubpage: 'order-confirmation',
        orderId: parts[2],
        isDashboard: false,
        isAuth: false,
        isOnboarding: false,
        isLanding: false,
      };
    }

    if (second === 'order-status' && parts[2]) {
      return {
        path: raw,
        isStorefront: true,
        restaurantSlug,
        storefrontSubpage: 'order-status',
        orderId: parts[2],
        isDashboard: false,
        isAuth: false,
        isOnboarding: false,
        isLanding: false,
      };
    }

    if (second === 'orders' || second === 'account') {
      return {
        path: raw,
        isStorefront: true,
        restaurantSlug,
        storefrontSubpage: 'orders',
        isDashboard: false,
        isAuth: false,
        isOnboarding: false,
        isLanding: false,
      };
    }

    if (second === 'reviews' || second === 'testimonials') {
      return {
        path: raw,
        isStorefront: true,
        restaurantSlug,
        storefrontSubpage: 'reviews',
        isDashboard: false,
        isAuth: false,
        isOnboarding: false,
        isLanding: false,
      };
    }

    const validSubpages: NonNullable<RouteMatch['storefrontSubpage']>[] = [
      'home',
      'menu',
      'deals',
      'about',
      'contact',
      'cart',
      'checkout',
      'product',
      'orders',
      'account',
      'reviews',
    ];

    const storefrontSubpage = validSubpages.includes(
      second as NonNullable<RouteMatch['storefrontSubpage']>
    )
      ? (second as NonNullable<RouteMatch['storefrontSubpage']>)
      : 'home';

    return {
      path: raw,
      isStorefront: true,
      restaurantSlug,
      storefrontSubpage,
      isDashboard: false,
      isAuth: false,
      isOnboarding: false,
      isLanding: false,
    };
  }, [currentPath, detectedSubdomain]);

  return (
    <RouterContext.Provider
      value={{ currentPath, navigate, routeMatch, subdomain: detectedSubdomain }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

// Re-export router hooks and link helper so components can use standard router semantics safely
export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useLocation = () => {
  const { currentPath } = useRouter();
  return { pathname: currentPath, search: '', hash: '' };
};

export const useParams = <T extends Record<string, string | undefined>>(): T => {
  const { routeMatch } = useRouter();
  return {
    restaurantSlug: routeMatch.restaurantSlug,
    orderId: routeMatch.orderId,
    itemId: routeMatch.itemId,
  } as unknown as T;
};

export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  'aria-label'?: string;
}> = ({ to, className, children, style, onClick, title, 'aria-label': ariaLabel }) => {
  const { navigate } = useRouter();
  const cleanTo = to.startsWith('/') ? to : `/${to}`;
  return (
    <a
      href={cleanTo}
      className={className}
      style={style}
      title={title}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (onClick) onClick(e);
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};
