import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { StorefrontLayout } from './StorefrontLayout';
import { StorefrontHome } from './StorefrontHome';
import { StorefrontMenu } from './StorefrontMenu';
import { StorefrontDeals } from './StorefrontDeals';
import { StorefrontAbout } from './StorefrontAbout';
import { StorefrontContact } from './StorefrontContact';
import { StorefrontCart } from './StorefrontCart';
import { StorefrontCheckout } from './StorefrontCheckout';
import { StorefrontConfirmation } from './StorefrontConfirmation';
import { StorefrontOrderStatus } from './StorefrontOrderStatus';
import { StorefrontProductDetail } from './StorefrontProductDetail';
import { StorefrontOrders } from './StorefrontOrders';
import { StorefrontReviews } from './StorefrontReviews';
import { AlertCircle, ArrowLeft, Store, Utensils } from 'lucide-react';
import { DEFAULT_RESTAURANT } from '../../data/mockData';

export const StorefrontController: React.FC = () => {
  const { routeMatch, navigate } = useRouter();
  const { getRestaurantBySlug, fetchRestaurantBySlug, restaurants, activeRestaurant, currentUser } = useDineCraft();

  const slug = routeMatch.restaurantSlug || '';
  const [asyncResto, setAsyncResto] = React.useState<any>(null);
  const [isFetching, setIsFetching] = React.useState(false);

  let restaurant = getRestaurantBySlug(slug) || asyncResto;

  React.useEffect(() => {
    if (!restaurant && slug) {
      setIsFetching(true);
      fetchRestaurantBySlug(slug)
        .then((found) => {
          if (found) setAsyncResto(found);
        })
        .finally(() => setIsFetching(false));
    }
  }, [slug, restaurant, fetchRestaurantBySlug]);

  if (!restaurant && (slug.toLowerCase() === 'my-restaurant' || !slug)) {
    restaurant = activeRestaurant || DEFAULT_RESTAURANT;
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[var(--canvas,#E9EAEE)] flex items-center justify-center p-4">
        <div className="sf-card p-8 max-w-sm w-full text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[var(--brand,#FF6900)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[var(--body,#4B5563)]">Loading restaurant storefront...</p>
        </div>
      </div>
    );
  }

  // Check if restaurant is draft and viewer is not the owner
  if (restaurant && restaurant.websiteStatus === 'draft' && restaurant.ownerId && (!currentUser || currentUser.uid !== restaurant.ownerId)) {
    return (
      <div className="min-h-screen bg-[var(--canvas,#E9EAEE)] flex items-center justify-center p-4 text-[var(--heading,#111827)]">
        <div className="sf-card p-8 sm:p-10 max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--heading,#111827)]">Storefront Unpublished</h2>
            <p className="text-xs text-[var(--body,#4B5563)] mt-1.5 leading-relaxed">
              This restaurant website is currently saved in draft mode and is not yet publicly live.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="sf-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[var(--canvas,#E9EAEE)] flex items-center justify-center p-4 text-[var(--heading,#111827)]">
        <div className="sf-card p-8 sm:p-10 max-w-md w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-[var(--brand-soft,#FFF1E6)] text-[var(--brand,#FF6900)] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--heading,#111827)]">Restaurant Not Found</h2>
            <p className="text-xs text-[var(--body,#4B5563)] mt-1 leading-relaxed">
              No restaurant with the slug <span className="font-mono font-bold text-[var(--heading,#111827)]">"{slug}"</span> exists in your dataset.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-left">
            <p className="text-[11px] font-bold text-[var(--muted,#9CA3AF)] uppercase tracking-wide">
              Explore available restaurants:
            </p>
            {restaurants.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`/${r.slug}`)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F9FAFB] hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[var(--brand,#FF6900)]" />
                  <span className="text-[var(--heading,#111827)]">{r.name}</span>
                </div>
                <span className="text-[10px] text-[var(--muted,#9CA3AF)] font-mono">/{r.slug}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-black/5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate('/my-restaurant')}
              className="sf-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Open My Restaurant Storefront</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="sf-button-secondary w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to DineCraft Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subpage = routeMatch.storefrontSubpage || 'home';

  return (
    <StorefrontLayout restaurant={restaurant}>
      {subpage === 'home' && <StorefrontHome restaurant={restaurant} />}
      {subpage === 'menu' && <StorefrontMenu restaurant={restaurant} />}
      {subpage === 'deals' && <StorefrontDeals restaurant={restaurant} />}
      {subpage === 'about' && <StorefrontAbout restaurant={restaurant} />}
      {subpage === 'contact' && <StorefrontContact restaurant={restaurant} />}
      {subpage === 'cart' && <StorefrontCart restaurant={restaurant} />}
      {subpage === 'checkout' && <StorefrontCheckout restaurant={restaurant} />}
      {subpage === 'product' && <StorefrontProductDetail restaurant={restaurant} />}
      {subpage === 'order-confirmation' && (
        <StorefrontConfirmation restaurant={restaurant} orderId={routeMatch.orderId} />
      )}
      {subpage === 'order-status' && (
        <StorefrontOrderStatus restaurant={restaurant} orderId={routeMatch.orderId} />
      )}
      {(subpage === 'orders' || subpage === 'account') && (
        <StorefrontOrders restaurant={restaurant} />
      )}
      {subpage === 'reviews' && <StorefrontReviews restaurant={restaurant} />}
    </StorefrontLayout>
  );
};


