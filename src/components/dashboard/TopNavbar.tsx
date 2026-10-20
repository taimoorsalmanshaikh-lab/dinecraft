import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  Globe,
  ExternalLink,
  ChevronDown,
  Check,
  Store,
  Share2,
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Palette,
  Settings,
  Star,
  FolderOpen,
  Tag,
  CreditCard,
} from 'lucide-react';
import { buildStorefrontUrl, openStorefrontInNewTab } from '../../lib/subdomain';

interface TopNavbarProps {
  currentSubpage: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ currentSubpage }) => {
  const { navigate } = useRouter();
  const { restaurants, activeRestaurant, setActiveRestaurantId, session } = useDineCraft();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);


  const allNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, path: '/dashboard/orders' },
    { id: 'menu', label: 'Menu Dishes & Items', icon: UtensilsCrossed, path: '/dashboard/menu' },
    { id: 'assets', label: 'Assets Media Library', icon: FolderOpen, path: '/dashboard/assets' },
    { id: 'deals', label: 'Deals & Specials', icon: Tag, path: '/dashboard/deals' },
    { id: 'reviews', label: 'Customer Reviews', icon: Star, path: '/dashboard/reviews' },
    { id: 'website', label: 'Website Customizer', icon: Palette, path: '/dashboard/website' },
    { id: 'customers', label: 'Customers CRM', icon: Users, path: '/dashboard/customers' },
    { id: 'settings', label: 'Restaurant Settings', icon: Settings, path: '/dashboard/settings' },
    { id: 'subscription', label: 'Subscription Plan', icon: CreditCard, path: '/dashboard/subscription' },
  ];

  const isStorefrontReady = Boolean(activeRestaurant?.slug && activeRestaurant.websiteStatus === 'published');

  const handleCopyLink = () => {
    if (!isStorefrontReady) return;
    const url = buildStorefrontUrl(activeRestaurant.slug);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      <header className="w-full flex items-center justify-between gap-2 sm:gap-4 py-1 sm:py-2 select-none">
        {/* Floating White Pill Bar */}
        <div className="w-full bg-white rounded-full px-3 sm:px-6 py-2 sm:py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] flex items-center justify-between gap-2 sm:gap-4 border border-black/5">
          {/* Left: Hamburger (mobile/tablet) + Brand logo & name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="w-5 h-5 text-[#111827]" />
            </button>

            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 cursor-pointer group min-w-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFF1E6] flex items-center justify-center text-base sm:text-lg shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                {activeRestaurant.logo || '🍽️'}
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#111827] tracking-tight block leading-tight truncate max-w-[110px] sm:max-w-[180px]">
                  {activeRestaurant.name}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#9CA3AF] font-semibold tracking-wider uppercase hidden sm:block truncate">
                  Owner Dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Store Status Pill */}
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Accepting Orders</span>
            </span>
            {activeRestaurant.slug && (
              <span className="text-[11px] font-mono text-slate-400">
                /{activeRestaurant.slug}
              </span>
            )}
          </div>

          {/* Right side: Circular icon buttons and avatar with dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Share Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              disabled={!isStorefrontReady}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                !isStorefrontReady
                  ? 'opacity-40 cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]'
                  : copiedLink
                  ? 'bg-emerald-50 text-emerald-600 cursor-pointer'
                  : 'bg-[#F3F4F6] hover:bg-[#FFF1E6] text-[#4B5563] hover:text-[#FF6900] cursor-pointer'
              }`}
              title={!isStorefrontReady ? 'Publish your store first' : 'Copy Public Storefront Link'}
              aria-label="Copy Storefront Link"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* View Live Storefront Button */}
            <button
              type="button"
              onClick={() => openStorefrontInNewTab(activeRestaurant.slug)}
              disabled={!isStorefrontReady}
              className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                isStorefrontReady
                  ? 'bg-[#FFF1E6] hover:bg-[#ffe3cc] text-[#FF6900] cursor-pointer active:scale-95'
                  : 'bg-[#F3F4F6] text-[#9CA3AF] opacity-50 cursor-not-allowed'
              }`}
              title={!isStorefrontReady ? 'Publish your store first' : 'Open Live Website'}
            >
              <Globe className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isStorefrontReady ? 'text-[#FF6900]' : 'text-[#9CA3AF]'}`} />
              <span className="hidden md:inline">Storefront</span>
              <ExternalLink className="w-3 h-3 opacity-60 hidden md:inline" />
            </button>

            {/* Restaurant Switcher & Owner Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 p-1 sm:pl-2.5 sm:pr-2 bg-[#F3F4F6] hover:bg-slate-200/60 rounded-full transition-all cursor-pointer"
                aria-label="Account and restaurant options"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FF6900] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {(session.user?.name || activeRestaurant.name || 'O').charAt(0)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-[0_8px_32px_rgba(16,24,40,0.14)] p-2 z-50 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#111827] truncate">
                      {session.user?.name || 'Restaurant Owner'}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] truncate">
                      {session.user?.email || 'owner@dinecraft.app'}
                    </p>
                  </div>

                  <div className="py-1">
                    <span className="px-3 py-1 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                      Switch Restaurant
                    </span>
                    {restaurants.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setActiveRestaurantId(r.id);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-2xl text-xs flex items-center justify-between transition-colors ${
                          r.id === activeRestaurant.id
                            ? 'bg-[#FFF1E6] text-[#FF6900] font-bold'
                            : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{r.logo || '🍽️'}</span>
                          <span className="truncate">{r.name}</span>
                        </div>
                        {r.id === activeRestaurant.id && (
                          <Check className="w-3.5 h-3.5 text-[#FF6900]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isStorefrontReady) return;
                        setShowDropdown(false);
                        openStorefrontInNewTab(activeRestaurant.slug);
                      }}
                      disabled={!isStorefrontReady}
                      title={!isStorefrontReady ? 'Publish your store first' : undefined}
                      className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                        isStorefrontReady
                          ? 'text-[#111827] hover:bg-[#F3F4F6] cursor-pointer'
                          : 'opacity-50 cursor-not-allowed text-slate-400'
                      }`}
                    >
                      <Store className={`w-3.5 h-3.5 ${isStorefrontReady ? 'text-[#FF6900]' : 'text-slate-400'}`} />
                      <span>View Public Storefront</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Full Navigation Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FFF1E6] flex items-center justify-center text-lg">
                    {activeRestaurant.logo || '🍽️'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] truncate max-w-[140px]">
                      {activeRestaurant.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      Navigation Menu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <div className="py-4 space-y-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSubpage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                        isActive
                          ? 'bg-[#FF6900] text-white shadow-xs'
                          : 'text-[#4B5563] hover:bg-slate-50 hover:text-[#111827]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (!isStorefrontReady) return;
                  setMobileMenuOpen(false);
                  openStorefrontInNewTab(activeRestaurant.slug);
                }}
                disabled={!isStorefrontReady}
                className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 ${
                  isStorefrontReady
                    ? 'bg-[#FFF1E6] text-[#FF6900]'
                    : 'bg-slate-100 text-slate-400 opacity-50'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Visit Storefront</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
