import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant } from '../../types';
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  Phone,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Home,
  UtensilsCrossed,
  Tag,
  Receipt,
  User,
} from 'lucide-react';
import { getStorefrontThemeStyle } from './themeUtils';
import { CartDrawer } from './CartDrawer';
import { formatCurrency } from '../../lib/currency';

interface StorefrontLayoutProps {
  restaurant: Restaurant;
  children: React.ReactNode;
  isPreviewMode?: boolean;
  currentSubpage?: string;
  onNavigatePreview?: (page: string) => void;
}

export const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({
  restaurant,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCart, getCartSubtotal, currentUser, userProfile } = useDineCraft();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const currency = restaurant.currency || restaurant.ordering?.currency || 'USD';

  const cart = getCart(restaurant.id);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getCartSubtotal(restaurant.id);

  // Injected CSS variables from theme
  const themeStyle = getStorefrontThemeStyle(restaurant);

  const navLinks = [
    { label: 'Home', path: `/${restaurant.slug}` },
    { label: 'Menu', path: `/${restaurant.slug}/menu` },
    ...(restaurant.showDealsPage || restaurant.sections?.deals
      ? [{ label: 'Special Offers', path: `/${restaurant.slug}/deals` }]
      : []),
    { label: 'Reviews', path: `/${restaurant.slug}/reviews` },
    { label: 'My Orders', path: `/${restaurant.slug}/orders` },
    { label: 'About', path: `/${restaurant.slug}/about` },
    { label: 'Contact', path: `/${restaurant.slug}/contact` },
  ];

  const isCurrentPath = (path: string) => {
    if (path === `/${restaurant.slug}`) {
      return location.pathname === `/${restaurant.slug}` || location.pathname === `/${restaurant.slug}/`;
    }
    return location.pathname.startsWith(path);
  };

  const logoDisplay = restaurant.logo || restaurant.logoUrl;
  const isLogoImage =
    logoDisplay &&
    (logoDisplay.startsWith('data:') ||
      logoDisplay.startsWith('http') ||
      logoDisplay.startsWith('/'));

  const phone = restaurant.phone || restaurant.contact?.phone || '+1 (555) 019-2831';
  const openingHours = restaurant.openingHours || restaurant.contact?.openingHours || 'Daily: 11:00 AM – 10:00 PM';
  const address = restaurant.address || restaurant.contact?.address || '100 Main Street';
  const city = restaurant.city || restaurant.contact?.city || 'Downtown';

  const activeThemeColor = restaurant.themeColor || restaurant.theme?.primary || '#FF6900';

  return (
    <div
      className="min-h-screen bg-[var(--sf-surface,#F3F4F6)] text-[var(--text,#111827)] font-[family-name:var(--font-body)] antialiased transition-colors duration-200"
      style={themeStyle}
    >
      <style>{`
        :root {
          --brand: ${activeThemeColor} !important;
          --brand-subtle: ${activeThemeColor}18 !important;
          --brand-soft: ${activeThemeColor}12 !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col min-h-screen">
        {/* Top Slim Rounded Info Pill */}
        <div className="mx-auto w-fit max-w-full px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-2xs text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-3 sm:gap-6 mb-2 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span className="truncate">{openingHours}</span>
            </span>
            <span className="hidden md:inline text-black/10">|</span>
            <span className="hidden md:flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span>{phone}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline font-medium text-[var(--text)]">
              {restaurant.deliveryEnabled ? 'Doorstep Delivery' : 'Counter Pickup'}
            </span>
            <span className="text-black/15 hidden sm:inline">·</span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              Min Order: {formatCurrency(restaurant.minimumOrder || 15, currency)}
            </span>
          </div>
        </div>

        {/* Floating White Pill Navbar */}
        <header className="sticky top-2 z-40 bg-white rounded-full shadow-[var(--sf-shadow)] px-4 sm:px-6 py-2.5 sm:py-3 transition-all mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Zone 1: Brand Wordmark / Logo */}
            <Link
              to={`/${restaurant.slug}`}
              className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group"
            >
              {isLogoImage ? (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-white shadow-2xs flex items-center justify-center">
                  <img
                    src={logoDisplay}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-2xs text-white"
                  style={{
                    backgroundColor: 'var(--brand)',
                  }}
                >
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span
                  className="text-base sm:text-lg font-bold tracking-tight text-[var(--text)] group-hover:text-[var(--brand)] transition-colors leading-tight"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {restaurant.name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-semibold">
                  {restaurant.category || 'Restaurant & Dining'}
                </span>
              </div>
            </Link>

            {/* Zone 2: Centered Nav Links (Active = Soft Brand Pill) */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#F9FAFB] rounded-full">
              {navLinks.map((link) => {
                const active = isCurrentPath(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[var(--brand-subtle)] text-[var(--brand)] font-bold shadow-2xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: Actions (Cart Pill & Mobile Menu) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:brightness-95 active:scale-95"
                style={{
                  backgroundColor: 'var(--brand)',
                  color: 'var(--brand-contrast, #ffffff)',
                }}
                aria-label={`Shopping bag with ${totalCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Bag</span>
                {totalCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full font-mono text-[11px] tabular-nums font-bold">
                    {totalCount}
                  </span>
                )}
                {subtotal > 0 && (
                  <span className="hidden md:inline font-mono text-[11px] pl-1 border-l border-white/25 tabular-nums">
                    {formatCurrency(subtotal, currency)}
                  </span>
                )}
              </button>

              {/* Mobile hamburger menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center text-[var(--text)] bg-[#F3F4F6] hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-black/5 space-y-1">
              {navLinks.map((link) => {
                const active = isCurrentPath(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[var(--brand-subtle)] text-[var(--brand)] font-bold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-16 md:pb-6">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onOpenCart: () => setCartDrawerOpen(true),
              });
            }
            return child;
          })}
        </main>

        {/* Slide-over Cart Drawer */}
        <CartDrawer
          restaurant={restaurant}
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
        />

        {/* Floating Mobile Bottom Navigation Bar (Home, Menu, Deals, Cart) */}
        <div className="md:hidden fixed bottom-3 left-4 right-4 z-40">
          <nav className="bg-white/95 backdrop-blur-md rounded-full shadow-[var(--sf-shadow)] border border-black/5 px-4 py-2 flex items-center justify-around">
            <Link
              to={`/${restaurant.slug}`}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-full transition-all ${
                isCurrentPath(`/${restaurant.slug}`) && location.pathname === `/${restaurant.slug}`
                  ? 'text-[var(--brand)] bg-[var(--brand-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to={`/${restaurant.slug}/menu`}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-full transition-all ${
                location.pathname.includes('/menu')
                  ? 'text-[var(--brand)] bg-[var(--brand-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu</span>
            </Link>

            {restaurant.showDealsPage || restaurant.sections?.deals ? (
              <Link
                to={`/${restaurant.slug}/deals`}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-full transition-all ${
                  location.pathname.includes('/deals')
                    ? 'text-[var(--brand)] bg-[var(--brand-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Deals</span>
              </Link>
            ) : null}

            <Link
              to={`/${restaurant.slug}/orders`}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-full transition-all ${
                location.pathname.includes('/orders')
                  ? 'text-[var(--brand)] bg-[var(--brand-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            <button

              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="relative flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[var(--brand)] text-white text-[9px] font-bold flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </div>
              <span>Bag</span>
            </button>
          </nav>
        </div>


        {/* Footer: Large Rounded Bento Card (28px radius, clean columns) */}
        <footer className="sf-card p-6 sm:p-10 lg:p-12 mt-8 mb-4 text-[var(--text)]">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Col 1: Brand Wordmark */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isLogoImage ? (
                    <img
                      src={logoDisplay}
                      alt={restaurant.name}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: 'var(--brand)' }}
                    >
                      {restaurant.name.charAt(0)}
                    </div>
                  )}
                  <span
                    className="text-lg font-bold text-[var(--text)] tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {restaurant.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
                  {restaurant.description || 'Authentic dishes crafted daily using wholesome ingredients and time-honored recipes.'}
                </p>
              </div>

              {/* Col 2: Navigation Links */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Explore
                </h4>
                <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                  {navLinks.map((l) => (
                    <li key={l.label}>
                      <Link to={l.path} className="hover:text-[var(--brand)] transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Address & Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Location & Hours
                </h4>
                <div className="space-y-2 text-xs text-[var(--text-muted)]">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                    <span>{address}, {city}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                    <span>{openingHours}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                    <span>{phone}</span>
                  </p>
                </div>
              </div>

              {/* Col 4: Online Ordering Guarantee */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Direct Kitchen Orders
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Hot meals prepared fresh upon order receipt. Fast doorstep delivery or convenient counter pickup.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setCartDrawerOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:underline cursor-pointer"
                  >
                    <span>View Active Order ({totalCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
              <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Powered by DineCraft Restaurant Platform</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
