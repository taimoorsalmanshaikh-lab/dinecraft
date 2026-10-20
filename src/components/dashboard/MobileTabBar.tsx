import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Palette,
  Settings,
  Star,
  FolderOpen,
  Tag,
} from 'lucide-react';

interface MobileTabBarProps {
  currentSubpage: string;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ currentSubpage }) => {
  const { navigate } = useRouter();
  const { orders, activeRestaurant } = useDineCraft();

  const newOrdersCount = orders.filter(
    (o) => o.restaurantId === activeRestaurant.id && o.status === 'New'
  ).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      path: '/dashboard/orders',
      badge: newOrdersCount > 0 ? newOrdersCount : undefined,
    },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, path: '/dashboard/menu' },
    { id: 'assets', label: 'Assets', icon: FolderOpen, path: '/dashboard/assets' },
    { id: 'deals', label: 'Deals', icon: Tag, path: '/dashboard/deals' },
    { id: 'reviews', label: 'Reviews', icon: Star, path: '/dashboard/reviews' },
    { id: 'website', label: 'Design', icon: Palette, path: '/dashboard/website' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/dashboard/customers' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="fixed bottom-3 inset-x-2 sm:inset-x-4 z-40 lg:hidden select-none">
      <nav className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full px-2 py-1.5 shadow-[0_8px_32px_rgba(16,24,40,0.15)] border border-slate-200/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSubpage === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl sm:rounded-full whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#FF6900] text-white shadow-xs font-bold'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-100/80 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-rose-500 text-white font-bold text-[8px] flex items-center justify-center ring-1 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
