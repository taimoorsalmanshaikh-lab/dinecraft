import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tag,
  Palette,
  Settings,
  CreditCard,
  ExternalLink,
  ChevronRight,
  LogOut,
  X,
  FolderOpen,
} from 'lucide-react';
import { openStorefrontInNewTab } from '../../lib/subdomain';

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { currentPath, navigate, routeMatch } = useRouter();
  const { activeRestaurant, orders, session, logout } = useDineCraft();

  const newOrdersCount = orders.filter(
    (o) => o.restaurantId === activeRestaurant.id && o.status === 'New'
  ).length;

  const currentSubpage = routeMatch.dashboardSubpage || 'overview';

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'orders',
      label: 'Live Orders',
      icon: ShoppingBag,
      path: '/dashboard/orders',
      badge: newOrdersCount > 0 ? `${newOrdersCount} new` : undefined,
      badgeColor: 'bg-orange-500 text-white',
    },
    {
      id: 'menu',
      label: 'Menu Items',
      icon: UtensilsCrossed,
      path: '/dashboard/menu',
    },
    {
      id: 'deals',
      label: 'Deals & Offers',
      icon: Tag,
      path: '/dashboard/deals',
    },
    {
      id: 'website',
      label: 'Website Design',
      icon: Palette,
      path: '/dashboard/website',
      highlight: true,
    },
    {
      id: 'assets',
      label: 'Assets Library',
      icon: FolderOpen,
      path: '/dashboard/assets',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      path: '/dashboard/subscription',
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 select-none">
      {/* Brand & Restaurant Profile Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-xl shrink-0">
            {activeRestaurant.logo || '🍽️'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-900 truncate leading-snug">
              {activeRestaurant.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${activeRestaurant.websiteStatus === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[11px] font-medium text-slate-500 capitalize">
                {activeRestaurant.websiteStatus}
              </span>
            </div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSubpage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'
                }`}>
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />
              )}
            </button>
          );
        })}

        {/* View Storefront Link */}
        <div className="pt-3 mt-3 border-t border-slate-100">
          <button
            onClick={() => {
              openStorefrontInNewTab(activeRestaurant.slug);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-orange-700 bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <ExternalLink className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="truncate">View Public Website</span>
            </div>
            <span className="text-[10px] text-orange-500 font-mono">/{activeRestaurant.slug}</span>
          </button>
        </div>
      </nav>

      {/* User / Session Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {session.user?.name || 'Restaurant Owner'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {session.user?.email || 'Logged In'}
            </p>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden md:block shrink-0">{content}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
