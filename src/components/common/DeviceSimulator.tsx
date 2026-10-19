import React, { useState } from 'react';
import { ExternalLink, RotateCcw, Monitor } from 'lucide-react';
import { Restaurant } from '../../types';
import { StorefrontLayout } from '../storefront/StorefrontLayout';
import { StorefrontHome } from '../storefront/StorefrontHome';
import { StorefrontMenu } from '../storefront/StorefrontMenu';
import { StorefrontDeals } from '../storefront/StorefrontDeals';
import { StorefrontAbout } from '../storefront/StorefrontAbout';
import { StorefrontContact } from '../storefront/StorefrontContact';

type PreviewPage = 'home' | 'menu' | 'deals' | 'about' | 'contact';

interface DeviceSimulatorProps {
  restaurant: Restaurant;
  onOpenFullscreen?: () => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  restaurant,
  onOpenFullscreen,
}) => {
  const [activePage, setActivePage] = useState<PreviewPage>('home');
  const [key, setKey] = useState(0);

  const reloadPreview = () => setKey((k) => k + 1);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Preview Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <Monitor className="w-3.5 h-3.5 text-[#FF6900]" />
            <span>Live Desktop Preview</span>
          </span>
        </div>

        {/* Page Switcher in Preview */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          {(['home', 'menu', 'deals', 'about', 'contact'] as PreviewPage[]).map((p) => {
            if (p === 'deals' && !restaurant.showDealsPage) return null;
            return (
              <button
                key={p}
                onClick={() => setActivePage(p)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  activePage === p
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={reloadPreview}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 shadow-2xs"
            title="Refresh preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {onOpenFullscreen && (
            <button
              onClick={onOpenFullscreen}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-700 hover:text-[#FF6900] bg-white hover:bg-orange-50 rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Fullscreen</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Direct Full-Width Live Viewport (No outer device mock frames) */}
      <div key={key} className="flex-1 w-full h-full overflow-y-auto bg-[#F3F4F6]">
        <StorefrontLayout
          restaurant={restaurant}
          isPreviewMode={true}
          currentSubpage={activePage}
          onNavigatePreview={(page: string) => setActivePage(page as PreviewPage)}
        >
          {activePage === 'home' && (
            <StorefrontHome
              restaurant={restaurant}
              onNavigatePage={(page: string) => setActivePage(page as PreviewPage)}
              isPreviewMode={true}
            />
          )}
          {activePage === 'menu' && (
            <StorefrontMenu restaurant={restaurant} isPreviewMode={true} />
          )}
          {activePage === 'deals' && (
            <StorefrontDeals restaurant={restaurant} isPreviewMode={true} />
          )}
          {activePage === 'about' && (
            <StorefrontAbout restaurant={restaurant} isPreviewMode={true} />
          )}
          {activePage === 'contact' && (
            <StorefrontContact restaurant={restaurant} isPreviewMode={true} />
          )}
        </StorefrontLayout>
      </div>
    </div>
  );
};
