import React from 'react';
import { Heart, Plus, Tag } from 'lucide-react';
import { Deal, MenuItem, Restaurant } from '../../types';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';

interface ProductCardProps {
  item: Deal | MenuItem;
  restaurant: Restaurant;
  onOpenCart?: () => void;
  isLiked?: boolean;
  onToggleLike?: (e: React.MouseEvent, id: string) => void;
  onQuickAdd?: (e: React.MouseEvent, item: any) => void;
  onOpenProduct?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  restaurant,
  onOpenCart,
  isLiked = false,
  onToggleLike,
  onQuickAdd,
  onOpenProduct,
}) => {
  const { navigate } = useRouter();
  const { addToCart } = useDineCraft();

  const isDeal = 'originalPrice' in item;
  const deal = isDeal ? (item as Deal) : null;
  const menuItem = !isDeal ? (item as MenuItem) : null;

  const title = deal ? deal.title : menuItem?.name || '';
  const description = deal ? deal.description : menuItem?.description || 'Prepared fresh daily to order.';
  const image = deal ? (deal.imageUrl || deal.image || '') : (menuItem?.imageUrl || menuItem?.image || '');
  const price = deal ? deal.discountedPrice : menuItem?.price || 0;
  const originalPrice = deal ? deal.originalPrice : menuItem?.compareAtPrice;
  const isAvailable = deal ? deal.active !== false : menuItem?.available !== false;
  const currency = restaurant.currency || '$';

  const handleClickCard = () => {
    if (onOpenProduct) {
      onOpenProduct(item.id);
    } else {
      navigate(`/${restaurant.slug}/product/${item.id}`);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleLike) {
      onToggleLike(e, item.id);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;

    if (onQuickAdd) {
      onQuickAdd(e, item);
      return;
    }

    if (deal) {
      addToCart(restaurant.id, {
        id: deal.id,
        name: `${deal.title} (Deal)`,
        price: deal.discountedPrice,
        image: deal.imageUrl || deal.image,
        imageUrl: deal.imageUrl || deal.image,
        category: 'Special Deals',
      });
    } else if (menuItem) {
      addToCart(restaurant.id, {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image || menuItem.imageUrl,
        imageUrl: menuItem.imageUrl || menuItem.image,
        category: menuItem.category,
      });
    }

    if (onOpenCart) {
      onOpenCart();
    }
  };

  return (
    <div
      onClick={handleClickCard}
      className="group h-full sf-card sf-card-hover p-3 flex flex-col justify-between cursor-pointer select-none text-[var(--text)] transition-all"
    >
      <div className="flex-1 flex flex-col">
        {/* Dish/Deal Image (20px radius, 4:3 ratio) */}
        <div className="relative aspect-[4/3] w-full rounded-[var(--sf-radius-tile,20px)] overflow-hidden bg-[#F3F4F6] shrink-0">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center text-[var(--text-muted)] text-xs">
              No image
            </div>
          )}

          {/* Badges */}
          {deal && (
            <span className="absolute top-2.5 left-2.5 bg-[var(--brand)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Deal</span>
            </span>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-2xs cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
            />
          </button>

          {/* Sold out overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center rounded-[var(--sf-radius-tile,20px)]">
              <span className="text-[11px] font-bold text-white bg-black/80 px-2.5 py-1 rounded-full">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="pt-3 pb-2 px-1 flex-1 flex flex-col">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors line-clamp-1 leading-snug">
            {title}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed mt-1 flex-1">
            {description}
          </p>
        </div>
      </div>

      {/* Price & Circular Brand '+' Button */}
      <div className="pt-2 px-1 flex items-center justify-between border-t border-black/5 mt-auto">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--text)] tabular-nums">
            {currency}{price.toFixed(2)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] line-through tabular-nums">
              {currency}{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!isAvailable}
          onClick={handleAddClick}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer ${
            isAvailable
              ? 'bg-[var(--brand)] text-[var(--brand-contrast,#ffffff)] hover:scale-105 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          aria-label={isAvailable ? `Add ${title} to bag` : 'Sold out'}
        >
          <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
