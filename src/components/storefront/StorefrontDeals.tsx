import React, { useState, useEffect } from 'react';
import { Restaurant, Deal } from '../../types';
import { getRestaurantDeals } from '../../services/restaurantService';
import { Tag, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface StorefrontDealsProps {
  restaurant: Restaurant;
  isPreviewMode?: boolean;
  onOpenCart?: () => void;
}

export const StorefrontDeals: React.FC<StorefrontDealsProps> = ({
  restaurant,
  onOpenCart,
}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDeals() {
      try {
        const loaded = await getRestaurantDeals(restaurant.id);
        if (isMounted) {
          setDeals(loaded.filter((d) => d.active));
        }
      } catch (err) {
        console.error('Failed to load deals:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDeals();
    return () => {
      isMounted = false;
    };
  }, [restaurant.id]);

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 text-[var(--text)]">
      {/* Header Bento Card */}
      <div className="sf-card p-6 sm:p-10 text-center max-w-4xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Special Combinations</span>
        </div>
        <h1
          className="text-2xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Limited-Time Deals & Combos
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          Curated chef specials, bundled combo offers, and exclusive seasonal dining savings.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="aspect-[4/3] sf-card animate-pulse"
            />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="sf-card p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <h3
            className="text-base font-bold text-[var(--text)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            No active deals today
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
            Check back soon for upcoming limited-time combo offers and chef discounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((deal) => (
            <ProductCard
              key={deal.id}
              item={deal}
              restaurant={restaurant}
              onOpenCart={onOpenCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};
