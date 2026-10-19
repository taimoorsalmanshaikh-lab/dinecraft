import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  Menu,
  ExternalLink,
  ChevronDown,
  Check,
  Globe,
  Share2,
} from 'lucide-react';

interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
  title: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenMobileMenu,
  title,
  subtitle,
}) => {
  const { navigate } = useRouter();
  const { restaurants, activeRestaurant, setActiveRestaurantId, updateRestaurant, addToast } = useDineCraft();
  const [showRestoDropdown, setShowRestoDropdown] = useState(false);

  const togglePublish = () => {
    const newStatus = activeRestaurant.websiteStatus === 'published' ? 'draft' : 'published';
    updateRestaurant({
      ...activeRestaurant,
      websiteStatus: newStatus,
    });
    addToast({
      type: newStatus === 'published' ? 'success' : 'info',
      title: newStatus === 'published' ? 'Website Published!' : 'Website Set to Draft',
      message: newStatus === 'published'
        ? `Your storefront is live at /${activeRestaurant.slug}`
        : 'Customers cannot place orders while in draft mode.',
    });
  };

  const copyStorefrontLink = () => {
    const url = `${window.location.origin}/#/${activeRestaurant.slug}`;
    navigator.clipboard.writeText(url);
    addToast({
      type: 'success',
      title: 'Storefront Link Copied',
      message: `Direct link to ${activeRestaurant.name} copied to clipboard!`,
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger (mobile) + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{activeRestaurant.name}</span>
              <span aria-hidden="true">/</span>
              <span className="truncate">{title}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight truncate mt-0.5">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Restaurant Switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowRestoDropdown(!showRestoDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-slate-700"
            >
              <span>{activeRestaurant.logo}</span>
              <span className="max-w-[130px] truncate">{activeRestaurant.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRestoDropdown && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Restaurant
                </div>
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRestaurantId(r.id);
                      setShowRestoDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      r.id === activeRestaurant.id ? 'font-semibold text-orange-600 bg-orange-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{r.logo}</span>
                      <span className="truncate">{r.name}</span>
                    </div>
                    {r.id === activeRestaurant.id && (
                      <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share/Copy link */}
          <button
            onClick={copyStorefrontLink}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Copy public storefront link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Quick Publish Toggle */}
          <button
            onClick={togglePublish}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeRestaurant.websiteStatus === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeRestaurant.websiteStatus === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{activeRestaurant.websiteStatus === 'published' ? 'Live on Web' : 'Draft Mode'}</span>
          </button>

          {/* View Website Button */}
          <button
            onClick={() => navigate(`/${activeRestaurant.slug}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">View Storefront</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </div>
    </header>
  );
};
