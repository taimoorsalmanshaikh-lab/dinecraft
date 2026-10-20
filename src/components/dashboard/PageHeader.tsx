import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Calendar, Plus, Globe, Tag, Sparkles } from 'lucide-react';
import { openStorefrontInNewTab } from '../../lib/subdomain';

interface PageHeaderProps {
  currentSubpage: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ currentSubpage }) => {
  const { navigate } = useRouter();
  const { session, activeRestaurant } = useDineCraft();

  const ownerName = session.user?.name || 'Owner';

  // Format today's date neatly
  const todayStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const isStorefrontReady = Boolean(activeRestaurant?.slug && activeRestaurant.websiteStatus === 'published');

  const getActionConfig = () => {
    switch (currentSubpage) {
      case 'menu':
        return {
          label: 'Add Menu Item',
          icon: <Plus className="w-4 h-4" />,
          disabled: false,
          title: undefined,
          onClick: () => {
            const btn = document.getElementById('open-add-dish-btn');
            if (btn) btn.click();
            else navigate('/dashboard/menu');
          },
        };
      case 'deals':
        return {
          label: 'Create New Deal',
          icon: <Tag className="w-4 h-4" />,
          disabled: false,
          title: undefined,
          onClick: () => {
            const btn = document.getElementById('open-add-deal-btn');
            if (btn) btn.click();
            else navigate('/dashboard/deals');
          },
        };
      case 'orders':
        return {
          label: 'View Storefront',
          icon: <Globe className="w-4 h-4" />,
          disabled: !isStorefrontReady,
          title: !isStorefrontReady ? 'Publish your store first' : undefined,
          onClick: () => {
            if (!isStorefrontReady) return;
            openStorefrontInNewTab(activeRestaurant.slug);
          },
        };
      case 'website':
        return {
          label: 'Live Preview',
          icon: <Sparkles className="w-4 h-4" />,
          disabled: !isStorefrontReady,
          title: !isStorefrontReady ? 'Publish your store first' : undefined,
          onClick: () => {
            if (!isStorefrontReady) return;
            openStorefrontInNewTab(activeRestaurant.slug);
          },
        };
      case 'reviews':
        return {
          label: 'Public Reviews',
          icon: <Globe className="w-4 h-4" />,
          disabled: !isStorefrontReady,
          title: !isStorefrontReady ? 'Publish your store first' : undefined,
          onClick: () => {
            if (!isStorefrontReady) return;
            openStorefrontInNewTab(activeRestaurant.slug, 'reviews');
          },
        };
      case 'overview':
      default:
        return {
          label: 'Add Menu Item',
          icon: <Plus className="w-4 h-4" />,
          disabled: false,
          title: undefined,
          onClick: () => navigate('/dashboard/menu'),
        };
    }
  };

  const action = getActionConfig();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 sm:py-4 select-none">
      {/* Big Greeting: "Welcome back, Owner Name" */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111827] tracking-tight leading-tight">
          Welcome back,{' '}
          <span className="font-medium text-[#9CA3AF]">{ownerName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF] font-medium mt-0.5">
          Here is what is happening with <span className="font-semibold text-[#4B5563]">{activeRestaurant.name}</span> today.
        </p>
      </div>

      {/* Right controls: Date-range pill + primary pill button */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date Range Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04)] text-xs font-semibold text-[#4B5563]">
          <Calendar className="w-3.5 h-3.5 text-[#FF6900]" />
          <span>Today · {todayStr}</span>
        </div>

        {/* Primary Pill Button */}
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          title={action.title}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-[0_1px_2px_rgba(255,105,0,0.2),0_4px_12px_rgba(255,105,0,0.24)] transition-all ${
            action.disabled
              ? 'bg-[#FF6900]/50 opacity-50 cursor-not-allowed'
              : 'bg-[#FF6900] hover:bg-[#E65F00] cursor-pointer active:scale-98'
          }`}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      </div>
    </div>
  );
};
