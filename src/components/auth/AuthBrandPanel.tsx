import React from 'react';
import { ChefHat, ShoppingBag, LayoutGrid, TrendingUp } from 'lucide-react';
import burgerImage from '../../assets/images/login_gourmet_burger_1792220312008.jpg';

interface AuthBrandPanelProps {
  className?: string;
}

export const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between p-8 sm:p-10 lg:p-12 text-white overflow-hidden select-none ${className}`}
    >
      {/* Background Image with High Quality Dark Scrim */}
      <img
        src={burgerImage}
        alt="Gourmet restaurant smash burger and fries"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] transition-transform duration-1000 ease-out"
      />

      {/* Atmospheric Overlays for perfect legibility & zero glare */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/90 via-[#0B0F14]/50 to-[#0B0F14]/40" />
      <div className="absolute inset-0 bg-[#FF6B00]/10 mix-blend-multiply pointer-events-none" />

      {/* Top Header: Brand Logo & Wordmark */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold tracking-tight text-white">Dine</span>
          <span className="text-2xl font-bold tracking-tight text-[#FF6B00]">Craft</span>
        </div>
      </div>

      {/* Middle Center: Inspiring Core Value Proposition */}
      <div className="relative z-10 my-auto py-10 max-w-lg">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
          Great Food <br />
          <span className="text-[#FF6B00]">Brings People Together</span>
        </h1>
        <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-200 leading-relaxed max-w-md">
          Manage your restaurant, take orders, and grow your business — all in one place.
        </p>
      </div>

      {/* Bottom Footer: Three Compact Benefit Highlights */}
      <div className="relative z-10 pt-6 border-t border-white/15">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center text-[#FF6B00] shrink-0 border border-white/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white leading-tight truncate">Easy Ordering</p>
              <p className="text-[10px] text-slate-300 hidden sm:block truncate">Instant customer checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center text-[#FF6B00] shrink-0 border border-white/10">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white leading-tight truncate">Table Management</p>
              <p className="text-[10px] text-slate-300 hidden sm:block truncate">Floor & dine-in sync</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center text-[#FF6B00] shrink-0 border border-white/10">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white leading-tight truncate">Real-Time Analytics</p>
              <p className="text-[10px] text-slate-300 hidden sm:block truncate">Live sales tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
