import React, { useState, useMemo } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Restaurant, MenuItem } from '../../types';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';

interface StorefrontMenuProps {
  restaurant: Restaurant;
  isPreviewMode?: boolean;
}

export const StorefrontMenu: React.FC<StorefrontMenuProps> = ({ restaurant }) => {
  const { navigate } = useRouter();
  const { getMenuItems, addToCart } = useDineCraft();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const menuItems = getMenuItems(restaurant.id);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (!item.available && item.available !== undefined) return;
    addToCart(restaurant.id, {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || item.imageUrl,
      imageUrl: item.imageUrl || item.image,
      category: item.category,
    });
  };

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean)));
    return ['all', ...cats];
  }, [menuItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Dedicated Product Page Navigation
  const handleOpenProduct = (itemId: string) => {
    navigate(`/${restaurant.slug}/product/${itemId}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 text-[var(--text)]">
      {/* Header & Title Bento Card */}
      <div className="sf-card p-6 sm:p-10 text-center max-w-4xl mx-auto space-y-3">
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--brand)' }}
        >
          Made to Order
        </span>
        <h1
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Our Full Menu
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Prepared fresh daily using authentic recipes. Click on any dish to explore full details, ingredients, and verified customer reviews.
        </p>

        {/* Search Input (48px height, pill shape, soft bg, brand focus) */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dishes, sides, beverages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-11 text-xs bg-[#F9FAFB] rounded-full border border-black/5 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs text-[var(--text)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs: Segmented Pill Group like Dashboard Toggle */}
      <div className="flex items-center justify-center overflow-x-auto py-1 scrollbar-none">
        <div className="inline-flex p-1.5 bg-white rounded-full shadow-[var(--sf-shadow)] gap-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize cursor-pointer ${
                  active
                    ? 'bg-[var(--brand)] text-[var(--brand-contrast,#ffffff)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Product Grid with Shared ProductCard */}
      {filteredItems.length === 0 ? (
        <div className="sf-card text-center py-12 p-6 max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-sm font-bold text-[var(--text)]">No items found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
            {searchQuery
              ? `No menu items match "${searchQuery}". Try a different keyword.`
              : 'There are no items currently listed in this category.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="sf-button-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 items-stretch">
          {filteredItems.map((item) => {
            const isLiked = !!likedIds[item.id];
            return (
              <ProductCard
                key={item.id}
                item={item}
                restaurant={restaurant}
                isLiked={isLiked}
                onToggleLike={toggleLike}
                onQuickAdd={handleQuickAdd}
                onOpenProduct={handleOpenProduct}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
