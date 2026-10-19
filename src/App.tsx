import React from 'react';
import { DineCraftProvider } from './context/DineCraftContext';
import { RouterProvider, useRouter } from './router/RouterContext';
import { LoginPage } from './components/auth/LoginPage';
import { OnboardingWizard } from './components/saas/OnboardingWizard';
import { DashboardLayout } from './components/saas/DashboardLayout';
import { StorefrontController } from './components/storefront/StorefrontController';

const AppContent: React.FC = () => {
  const { routeMatch } = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main View Router */}
      <div className="flex-1">
        {routeMatch.isAuth && <LoginPage initialMode={routeMatch.authType || 'login'} />}
        {routeMatch.isOnboarding && <OnboardingWizard />}
        {routeMatch.isDashboard && <DashboardLayout />}
        {routeMatch.isStorefront && <StorefrontController />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DineCraftProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </DineCraftProvider>
  );
}
