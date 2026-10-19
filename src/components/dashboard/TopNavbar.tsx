import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  Globe,
  ExternalLink,
  ChevronDown,
  Check,
  Search,
  Store,
  Share2,
} from 'lucide-react';

import { buildStorefrontUrl } from '../../lib/subdomain';

interface TopNavbarProps {
  currentSubpage: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ currentSubpage }) => {
  const { navigate } = useRouter();
  const { restaurants, activeRestaurant, setActiveRestaurantId, session } = useDineCraft();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const navSegments = [
    { id: 'overview', label: 'Overview', path: '/dashboard' },
    { id: 'orders', label: 'Orders', path: '/dashboard/orders' },
    { id: 'menu', label: 'Menu', path: '/dashboard/menu' },
    { id: 'reviews', label: 'Reviews', path: '/dashboard/reviews' },
    { id: 'website', label: 'Design', path: '/dashboard/website' },
  ];

  const handleCopyLink = () => {
    const url = buildStorefrontUrl(activeRestaurant.subdomain || activeRestaurant.slug);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 select-none">
      {/* Floating White Pill Bar */}
      <div className="w-full bg-white rounded-full px-4 sm:px-6 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] flex items-center justify-between gap-4">
        {/* Left: Brand logo & name */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#FFF1E6] flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
              {activeRestaurant.logo || '🍽️'}
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-[#111827] tracking-tight block leading-tight">
                {activeRestaurant.name}
              </span>
              <span className="text-[10px] text-[#9CA3AF] font-semibold tracking-wider uppercase">
                Owner Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Center: Segmented nav pill (active item = white pill with soft shadow, others muted) */}
        <div className="hidden md:flex items-center bg-[#F3F4F6] p-1 rounded-full text-xs font-semibold">
          {navSegments.map((seg) => {
            const isActive = currentSubpage === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => navigate(seg.path)}
                className={`px-4 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_4px_12px_rgba(16,24,40,0.04)] font-bold'
                    : 'text-[#9CA3AF] hover:text-[#111827]'
                }`}
              >
                {seg.label}
              </button>
            );
          })}
        </div>

        {/* Right side: Circular icon buttons and avatar with dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Share Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              copiedLink
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-[#F3F4F6] hover:bg-[#FFF1E6] text-[#4B5563] hover:text-[#FF6900]'
            }`}
            title="Copy Public Storefront Link"
            aria-label="Copy Storefront Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* View Live Storefront Button */}
          <button
            type="button"
            onClick={() => window.open(buildStorefrontUrl(activeRestaurant.subdomain || activeRestaurant.slug), '_blank')}
            className="w-9 h-9 sm:w-auto sm:px-3.5 sm:py-1.5 rounded-full bg-[#FFF1E6] hover:bg-[#FFD2A8]/50 text-[#C2410C] flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95"
            title="Open Live Website"
          >
            <Globe className="w-4 h-4 text-[#FF6900]" />
            <span className="hidden sm:inline">Storefront</span>
            <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
          </button>

          {/* Restaurant Switcher & Owner Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 p-1 sm:pl-2.5 sm:pr-2 bg-[#F3F4F6] hover:bg-slate-200/60 rounded-full transition-all cursor-pointer"
              aria-label="Account and restaurant options"
            >
              <div className="w-7 h-7 rounded-full bg-[#FF6900] text-white font-black text-xs flex items-center justify-center shadow-xs">
                {(session.user?.name || activeRestaurant.name || 'O').charAt(0)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-[0_8px_32px_rgba(16,24,40,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                      setShowDropdown(false);
                      navigate(`/${activeRestaurant.slug}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-2xl text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] flex items-center gap-2"
                  >
                    <Store className="w-3.5 h-3.5 text-[#FF6900]" />
                    <span>View Public Storefront</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
