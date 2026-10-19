import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant, MenuItem, Deal } from '../../types';
import { getRestaurantMenuItems, getRestaurantDeals } from '../../services/restaurantService';
import {
  ArrowRight,
  Plus,
  Truck,
  Leaf,
  Headphones,
  AlertCircle,
  Tag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  BadgePercent,
} from 'lucide-react';
import {
  BURGER_HERO_IMAGE,
  PIZZA_IMAGE,
  BIRYANI_IMAGE,
  RESTAURANT_INTERIOR_IMAGE,
} from '../../data/mockData';
import { ProductCard } from './ProductCard';

interface StorefrontHomeProps {
  restaurant: Restaurant;
  onNavigatePage?: (page: string) => void;
  isPreviewMode?: boolean;
}

export const StorefrontHome: React.FC<StorefrontHomeProps> = ({
  restaurant,
}) => {
  const navigate = useNavigate();
  const { addToCart } = useDineCraft();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [carouselCanScrollLeft, setCarouselCanScrollLeft] = useState(false);
  const [carouselCanScrollRight, setCarouselCanScrollRight] = useState(true);

  const dealsCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [items, d] = await Promise.all([
        getRestaurantMenuItems(restaurant.id),
        getRestaurantDeals(restaurant.id),
      ]);
      if (isMounted) {
        setMenuItems(items);
        setDeals(d.filter((item) => item.active));
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [restaurant.id]);

  // Dynamic Categories from available items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean)));
    return ['all', ...cats];
  }, [menuItems]);

  // Fallback / Featured Deals if no custom deals are set yet
  const displayDeals = useMemo(() => {
    if (deals.length > 0) {
      return deals;
    }

    const discountedItems = menuItems.filter((i) => i.compareAtPrice && i.compareAtPrice > i.price);
    if (discountedItems.length > 0) {
      return discountedItems.map((di) => ({
        id: di.id,
        restaurantId: di.restaurantId,
        title: di.name,
        description: di.description || 'Special kitchen promotion combo with premium ingredients.',
        image: di.imageUrl || di.image || BURGER_HERO_IMAGE,
        imageUrl: di.imageUrl || di.image || BURGER_HERO_IMAGE,
        originalPrice: di.compareAtPrice || di.price + 5,
        discountedPrice: di.price,
        active: true,
      }));
    }

    return [
      {
        id: 'deal_combo_1',
        restaurantId: restaurant.id,
        title: 'Ultimate Duo Burger & Loaded Fries Combo',
        description: 'Double Angus beef patties, crisp seasoned waffle fries, and signature dipping sauces.',
        image: BURGER_HERO_IMAGE,
        imageUrl: BURGER_HERO_IMAGE,
        originalPrice: 24.99,
        discountedPrice: 17.99,
        active: true,
      },
      {
        id: 'deal_combo_2',
        restaurantId: restaurant.id,
        title: 'Artisan Wood-Fired Pizza & Garlic Bites Feast',
        description: '14-inch stone oven pizza paired with herb-butter garlic knots and refreshing beverages.',
        image: PIZZA_IMAGE,
        imageUrl: PIZZA_IMAGE,
        originalPrice: 29.5,
        discountedPrice: 21.0,
        active: true,
      },
      {
        id: 'deal_combo_3',
        restaurantId: restaurant.id,
        title: 'Royal Biryani Platter & Kebab Box',
        description: 'Fragrant basmati rice cooked with saffron, slow-cooked tender meat, and seekh kebabs.',
        image: BIRYANI_IMAGE,
        imageUrl: BIRYANI_IMAGE,
        originalPrice: 32.0,
        discountedPrice: 23.5,
        active: true,
      },
      {
        id: 'deal_combo_4',
        restaurantId: restaurant.id,
        title: 'Chef Special Evening Dinner Platter',
        description: 'Generous sharing combo with grilled skewers, artisanal sides, and garden salad.',
        image: RESTAURANT_INTERIOR_IMAGE,
        imageUrl: RESTAURANT_INTERIOR_IMAGE,
        originalPrice: 38.0,
        discountedPrice: 27.99,
        active: true,
      },
    ];
  }, [deals, menuItems, restaurant.id]);

  // Update scroll arrow state on carousel scroll
  const handleCarouselScroll = () => {
    if (!dealsCarouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = dealsCarouselRef.current;
    setCarouselCanScrollLeft(scrollLeft > 10);
    setCarouselCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollDealsCarousel = (direction: 'left' | 'right') => {
    if (!dealsCarouselRef.current) return;
    const offset = direction === 'left' ? -340 : 340;
    dealsCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Filtered Items for Menu section
  const menuFilteredItems = useMemo(() => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter((i) => i.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
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

  const handleQuickAddDeal = (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation();
    addToCart(restaurant.id, {
      id: deal.id,
      name: `${deal.title} (Deal)`,
      price: deal.discountedPrice,
      image: deal.imageUrl || deal.image,
      imageUrl: deal.imageUrl || deal.image,
      category: 'Special Deals',
    });
  };

  const handleOpenProduct = (id: string) => {
    navigate(`/${restaurant.slug}/product/${id}`);
  };

  // Customizable hero texts & banner
  const heroHeading = restaurant.heroHeading || restaurant.content?.heroHeading || 'Good Food Brings People Together';
  const heroTagline = restaurant.heroTagline || restaurant.content?.heroTagline || restaurant.description || 'Experience delicious food crafted with passion, authentic recipes, and the freshest ingredients.';
  const heroBanner = restaurant.banner || restaurant.bannerUrl || restaurant.plateImageUrl || BURGER_HERO_IMAGE;

  // Single customizable promotional special offer banner
  const promoHeading = restaurant.content?.reservationBanner?.title || 'Get 20% Off Your First Online Order';
  const promoText = restaurant.content?.reservationBanner?.text || 'Order directly from our kitchen today and enjoy hot, delicious food delivered straight to your door.';
  const promoLabel = restaurant.content?.reservationBanner?.eyebrow || 'Special Limited Offer';
  const promoButtonText = restaurant.content?.reservationBanner?.buttonLabel || 'Claim Offer & Order Now';
  const promoImage = restaurant.content?.reservationBanner?.imageUrl || restaurant.banner || PIZZA_IMAGE;
  const isPromoEnabled = restaurant.content?.reservationBanner?.enabled !== false && restaurant.showDealsPage !== false;

  return (
    <div className="space-y-10 sm:space-y-16 pb-12 text-[var(--text)]">
      {/* 1. HERO SECTION: Large Rounded Bento Card */}
      <section className="sf-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentic Flavors · Fresh Daily</span>
            </div>

            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] tracking-tight leading-[1.15]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {heroHeading}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {heroTagline}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
              <Link
                to={`/${restaurant.slug}/menu`}
                className="sf-button-primary inline-flex items-center gap-2 px-6 py-3"
              >
                <span>Order Online Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#deals-section"
                className="sf-button-secondary inline-flex items-center gap-2 px-5 py-3"
              >
                <BadgePercent className="w-4 h-4 text-[var(--brand)]" />
                <span>View Hot Deals</span>
              </a>
            </div>
          </div>

          {/* Right Banner Image Bento Tile */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-[var(--sf-radius-tile,20px)] overflow-hidden shadow-sm bg-[#F3F4F6] group">
              <img
                src={heroBanner}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">{restaurant.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Fast Delivery · Kitchen Fresh</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                  Open Now
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICE HIGHLIGHTS (Bento Tiles with Uniform Spacing) */}
      <section className="grid grid-cols-3 gap-3 sm:gap-5 items-stretch">
        <div className="sf-tile p-4 sm:p-5 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center mb-2 shrink-0">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight line-clamp-1">Fast Delivery</h3>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5 leading-tight line-clamp-2">
            Hot and fresh dishes delivered quickly.
          </p>
        </div>

        <div className="sf-tile p-4 sm:p-5 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center mb-2 shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight line-clamp-1">Fresh</h3>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5 leading-tight line-clamp-2">
            Wholesome ingredients prepared daily.
          </p>
        </div>

        <div className="sf-tile p-4 sm:p-5 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center mb-2 shrink-0">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight line-clamp-1">Support</h3>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5 leading-tight line-clamp-2">
            Prompt assistance whenever you need.
          </p>
        </div>
      </section>

      {/* 3. DEALS SECTION (Bento Style Carousel) */}
      <section id="deals-section" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-semibold mb-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Limited Time Specials</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[var(--text)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Deals & Special Combos
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Chef-curated combos with instant basket savings.
            </p>
          </div>

          {/* Carousel Navigation Buttons & View All Link */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-2xs">
              <button
                type="button"
                onClick={() => scrollDealsCarousel('left')}
                disabled={!carouselCanScrollLeft}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer hover:bg-black/10"
                aria-label="Previous Deal"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollDealsCarousel('right')}
                disabled={!carouselCanScrollRight}
                className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[var(--text)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer hover:bg-black/10"
                aria-label="Next Deal"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to={`/${restaurant.slug}/deals`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:underline ml-2"
            >
              <span>See All Deals ({displayDeals.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={dealsCarouselRef}
            onScroll={handleCarouselScroll}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {displayDeals.filter(d => d.id !== restaurant.content?.specialOfferDealId).map((deal) => {
              const original = deal.originalPrice || 0;
              const discounted = deal.discountedPrice || 0;
              const savings = original > discounted ? original - discounted : 0;
              const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;
              const dealImage = deal.imageUrl || deal.image || heroBanner;

              return (
                <div
                  key={deal.id}
                  onClick={() => handleOpenProduct(deal.id)}
                  className="snap-start shrink-0 w-[270px] sm:w-[300px] md:w-[320px] sf-card sf-card-hover p-3 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex-1 flex flex-col">
                    {/* Deal Image with 20px radius */}
                    <div className="relative aspect-[4/3] rounded-[var(--sf-radius-tile,20px)] overflow-hidden bg-[#F3F4F6] shrink-0">
                      <img
                        src={dealImage}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                      {savings > 0 && (
                        <div className="absolute top-2.5 left-2.5 bg-[var(--brand)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>SAVE {savingsPercent}%</span>
                        </div>
                      )}
                    </div>

                    {/* Deal Details */}
                    <div className="pt-3 pb-2 px-1 space-y-1 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors line-clamp-1">
                        {deal.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {deal.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="pt-2 px-1 flex items-center justify-between border-t border-black/5 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--text-muted)] line-through tabular-nums">
                        ${original.toFixed(2)}
                      </span>
                      <span className="text-sm font-extrabold text-[var(--text)] tabular-nums">
                        ${discounted.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAddDeal(e, deal)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--brand)] text-[var(--brand-contrast,#ffffff)] flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
                      aria-label="Add deal to cart"
                    >
                      <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PROMOTIONAL OFFER BANNER: Large Rounded Bento Card */}
      {isPromoEnabled && (
        (() => {
          const specialOfferDeal = deals.find(d => d.id === restaurant.content?.specialOfferDealId);
          const bannerTitle = specialOfferDeal ? specialOfferDeal.title : promoHeading;
          const bannerText = specialOfferDeal ? specialOfferDeal.description : promoText;
          const bannerImage = specialOfferDeal ? (specialOfferDeal.imageUrl || specialOfferDeal.image || '') : promoImage;
          const bannerCta = specialOfferDeal ? 'Order Deal Now' : promoButtonText;

          return (
            <section className="sf-card p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark,#E65F00)] text-white relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{specialOfferDeal ? 'Special Deal Offer' : promoLabel}</span>
                  </div>

                  <h2
                    className="text-2xl sm:text-4xl font-extrabold leading-tight text-white"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {bannerTitle}
                  </h2>

                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl">
                    {bannerText}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {specialOfferDeal ? (
                       <button
                         onClick={() => handleOpenProduct(specialOfferDeal.id)}
                         className="sf-button-secondary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
                         style={{ color: 'var(--brand)' }}
                       >
                         <span>{bannerCta}</span>
                         <ArrowRight className="w-4 h-4" />
                       </button>
                    ) : (
                      <Link
                        to={`/${restaurant.slug}/menu`}
                        className="sf-button-secondary inline-flex items-center gap-2 px-6 py-3"
                        style={{ color: 'var(--brand)' }}
                      >
                        <span>{bannerCta}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    <a
                      href="#deals-section"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      <span>Browse All Specials</span>
                    </a>
                  </div>
                </div>

                {bannerImage && (
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-sm aspect-[4/3] rounded-[var(--sf-radius-tile,20px)] overflow-hidden shadow-lg border border-white/20 bg-black/10">
                      <img
                        src={bannerImage}
                        alt="Promotional Deal"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })()
      )}

      {/* 5. MENU SECTION WITH CATEGORY FILTERS & PRODUCT GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--brand)' }}
          >
            Fresh From Our Kitchen
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Explore Our Menu
          </h2>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Handcrafted with authentic culinary passion. Click on any dish to view ingredients and details.
          </p>
        </div>

        {/* Category Filter Tabs: Segmented Pill Group */}
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
                  {cat === 'all' ? 'All Dishes' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Product Grid */}
        {menuFilteredItems.length === 0 ? (
          <div className="sf-card text-center py-10 p-6 max-w-md mx-auto space-y-2">
            <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-1" />
            <p className="text-xs font-semibold text-[var(--text)]">No items in this category.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-[var(--brand)] hover:underline cursor-pointer"
            >
              Show all dishes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 items-stretch">
            {menuFilteredItems.map((item) => {
              const isLiked = likedIds[item.id];
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
      </section>
    </div>
  );
};
