import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { UtensilsCrossed, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { navigate } = useRouter();
  const { activeRestaurant, session } = useDineCraft();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-orange-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand wordmark (single line text element) */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm group-hover:bg-orange-700 transition-colors">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                DineCraft
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-orange-600 transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </button>
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-orange-600 transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-orange-600 transition-colors whitespace-nowrap shrink-0"
            >
              Pricing
            </button>
            {activeRestaurant && activeRestaurant.id !== 'new_restaurant' && (
              <button
                onClick={() => navigate(`/${activeRestaurant.slug}`)}
                className="hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <span>Live Storefront</span>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-semibold px-1.5 py-0.5 rounded">Live</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary CTA action + Auth link */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {session.isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Log In
              </button>
            )}

            <button
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <span>Build Your Restaurant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            Features
          </button>
          <button
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
              setTimeout(() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-orange-600"
          >
            Pricing
          </button>
          {activeRestaurant && activeRestaurant.id !== 'new_restaurant' && (
            <button
              onClick={() => {
                navigate(`/${activeRestaurant.slug}`);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-orange-600"
            >
              Live Storefront ({activeRestaurant.name})
            </button>
          )}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                navigate(session.isLoggedIn ? '/dashboard' : '/login');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg"
            >
              {session.isLoggedIn ? 'Dashboard' : 'Log In'}
            </button>
            <button
              onClick={() => {
                navigate('/onboarding');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm"
            >
              Build Your Restaurant Website
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
