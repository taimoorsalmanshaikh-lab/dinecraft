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
    { id: 'customers', label: 'Customers', icon: Users, path: '/dashboard/customers' },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, path: '/dashboard/menu' },
    { id: 'reviews', label: 'Reviews', icon: Star, path: '/dashboard/reviews' },
    { id: 'website', label: 'Design', icon: Palette, path: '/dashboard/website' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden select-none">
      <nav className="bg-white/95 backdrop-blur-md rounded-full px-3 py-2 shadow-[0_8px_32px_rgba(16,24,40,0.12)] border border-white/60 flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSubpage === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-full relative transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#FF6900] font-bold'
                  : 'text-[#9CA3AF] hover:text-[#111827]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#FFF1E6] text-[#FF6900]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-[#FF6900] text-white font-bold text-[8px] flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
