import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Tag,
  Palette,
  FolderOpen,
  Settings,
  LogOut,
  CreditCard,
  Star,
} from 'lucide-react';

interface IconRailProps {
  currentSubpage: string;
}

export const IconRail: React.FC<IconRailProps> = ({ currentSubpage }) => {
  const { navigate } = useRouter();
  const { orders, activeRestaurant, logout } = useDineCraft();

  const newOrdersCount = orders.filter(
    (o) => o.restaurantId === activeRestaurant.id && o.status === 'New'
  ).length;

  const group1 = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      path: '/dashboard/orders',
      badge: newOrdersCount > 0 ? newOrdersCount : undefined,
    },
    { id: 'customers', label: 'Customers', icon: Users, path: '/dashboard/customers' },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, path: '/dashboard/menu' },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, path: '/dashboard/reviews' },
  ];

  const group2 = [
    { id: 'deals', label: 'Deals & Specials', icon: Tag, path: '/dashboard/deals' },
    { id: 'website', label: 'Website Design', icon: Palette, path: '/dashboard/website' },
    { id: 'assets', label: 'Assets Media', icon: FolderOpen, path: '/dashboard/assets' },
    { id: 'subscription', label: 'Plan & Billing', icon: CreditCard, path: '/dashboard/subscription' },
  ];

  const group3 = [
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const renderButton = (item: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    badge?: number;
  }) => {
    const Icon = item.icon;
    const isActive = currentSubpage === item.id;

    return (
      <div key={item.id} className="relative group">
        <button
          type="button"
          onClick={() => navigate(item.path)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer relative active:scale-95 ${
            isActive
              ? 'bg-[#FF6900] text-white shadow-md'
              : 'text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6]'
          }`}
          aria-label={item.label}
        >
          <Icon className="w-5 h-5" />
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6900] text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
              {item.badge}
            </span>
          )}
        </button>

        {/* Tooltip on hover */}
        <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111827] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap z-50 shadow-md">
          {item.label}
        </span>
      </div>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between gap-5 py-2 shrink-0 select-none">
      {/* Upper Navigation Groups */}
      <div className="flex flex-col gap-4">
        {/* Group 1: Main */}
        <div className="bg-white rounded-full p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] flex flex-col items-center gap-2">
          {group1.map(renderButton)}
        </div>

        {/* Group 2: Growth & Media */}
        <div className="bg-white rounded-full p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] flex flex-col items-center gap-2">
          {group2.map(renderButton)}
        </div>
      </div>

      {/* Group 3: Settings & Logout */}
      <div className="bg-white rounded-full p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] flex flex-col items-center gap-2">
        {group3.map(renderButton)}

        <div className="relative group">
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111827] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap z-50 shadow-md">
            Sign Out
          </span>
        </div>
      </div>
    </aside>
  );
};
