import React, { useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { TopNavbar } from '../dashboard/TopNavbar';
import { IconRail } from '../dashboard/IconRail';
import { PageHeader } from '../dashboard/PageHeader';
import { MobileTabBar } from '../dashboard/MobileTabBar';
import { DashboardOverview } from './DashboardOverview';
import { MenuManager } from './MenuManager';
import { DealsManager } from './DealsManager';
import { WebsiteCustomizer } from './WebsiteCustomizer';
import { OrderManager } from './OrderManager';
import { RestaurantSettings } from './RestaurantSettings';
import { SubscriptionView } from './SubscriptionView';
import { AssetsManager } from './AssetsManager';
import { CustomersManager } from './CustomersManager';
import { ReviewsManager } from './ReviewsManager';

export const DashboardLayout: React.FC = () => {
  const { routeMatch, navigate } = useRouter();
  const { currentUser, isAuthLoading } = useDineCraft();
  const subpage = routeMatch.dashboardSubpage || 'overview';

  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white shadow-xs text-sm font-medium text-[#17212B]">
          <span className="w-4 h-4 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans antialiased text-[#4B5563]">
      {/* Sticky Top Navbar Bar (Stays pinned when page scrolls) */}
      <div className="sticky top-0 z-40 bg-[#F3F4F6]/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 border-b border-black/5 shrink-0">
        <TopNavbar currentSubpage={subpage} />
      </div>

      {/* Main Body with Fixed/Sticky Icon Rail on Left and Dynamic Workspace on Right */}
      <div className="flex-1 flex px-3 sm:px-6 lg:px-8 gap-4 lg:gap-6 min-h-0">
        {/* Sticky Desktop Icon Rail (Does not scroll with content) */}
        <div className="hidden lg:flex flex-col sticky top-[69px] h-[calc(100vh-69px)] shrink-0 overflow-y-auto py-3 scrollbar-none select-none">
          <IconRail currentSubpage={subpage} />
        </div>

        {/* Scrollable Workspace */}
        <main className="flex-1 flex flex-col min-w-0 py-3 pb-24 lg:pb-8 overflow-y-auto">
          {/* Header Greeting & Contextual Action */}
          <PageHeader currentSubpage={subpage} />

          {/* Subpage Views in Bento Style */}
          <div className="mt-4 flex-1">
            {subpage === 'overview' && <DashboardOverview />}
            {subpage === 'orders' && <OrderManager />}
            {subpage === 'customers' && <CustomersManager />}
            {subpage === 'menu' && <MenuManager />}
            {subpage === 'reviews' && <ReviewsManager />}
            {subpage === 'deals' && <DealsManager />}
            {subpage === 'website' && <WebsiteCustomizer />}
            {subpage === 'assets' && <AssetsManager />}
            {subpage === 'settings' && <RestaurantSettings />}
            {subpage === 'subscription' && <SubscriptionView />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar currentSubpage={subpage} />
    </div>
  );
};
