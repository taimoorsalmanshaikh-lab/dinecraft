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
import { formatCurrency } from '../../lib/currency';

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

    return [];
  }, [deals, menuItems]);

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

  const [videoFailed, setVideoFailed] = useState(false);

  // Customizable hero texts & banner
  const heroHeading = restaurant.heroHeading || restaurant.content?.heroHeading || 'Good Food Brings People Together';
  const heroTagline = restaurant.heroTagline || restaurant.content?.heroTagline || restaurant.description || 'Experience delicious food crafted with passion, authentic recipes, and the freshest ingredients.';
  const heroBanner = restaurant.banner || restaurant.bannerUrl || restaurant.plateImageUrl || BURGER_HERO_IMAGE;
  const heroMediaType = restaurant.heroMediaType || restaurant.content?.heroMediaType || 'image';
  const heroVideoUrl = restaurant.heroVideoUrl || restaurant.content?.heroVideoUrl || '';
  const heroPrimaryCtaText = restaurant.heroPrimaryCtaText || restaurant.content?.heroPrimaryCtaText || 'Order Online Now';
  const heroPrimaryCtaLink = restaurant.heroPrimaryCtaLink || restaurant.content?.heroPrimaryCtaLink || `/${restaurant.slug}/menu`;
  const heroSecondaryCtaText = restaurant.heroSecondaryCtaText || restaurant.content?.heroSecondaryCtaText || 'View Hot Deals';
  const heroSecondaryCtaLink = restaurant.heroSecondaryCtaLink || restaurant.content?.heroSecondaryCtaLink || '#deals-section';

  // Single customizable promotional special offer banner
  const promoHeading = restaurant.content?.reservationBanner?.title || 'Get 20% Off Your First Online Order';
  const promoText = restaurant.content?.reservationBanner?.text || 'Order directly from our kitchen today and enjoy hot, delicious food delivered straight to your door.';
  const promoLabel = restaurant.content?.reservationBanner?.eyebrow || 'Special Limited Offer';
  const promoButtonText = restaurant.content?.reservationBanner?.buttonLabel || 'Claim Offer & Order Now';
  const promoImage = restaurant.content?.reservationBanner?.imageUrl || restaurant.banner || PIZZA_IMAGE;
  const isPromoEnabled = restaurant.content?.reservationBanner?.enabled !== false && restaurant.showDealsPage !== false;

  return (
    <div className="space-y-10 sm:space-y-16 pb-12 text-[var(--text)]">
      {/* 1. CINEMATIC HERO SECTION: Full-Viewport Video / Image Background */}
      <section className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[82vh] flex items-center bg-slate-950 shadow-md">
        {/* Background Media: Looping Video or Image */}
        {heroMediaType === 'video' && heroVideoUrl && !videoFailed ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={heroBanner}
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none"
          >
            <source src={heroVideoUrl} type="video/mp4" />
            <source src={heroVideoUrl} type="video/webm" />
            <source src={heroVideoUrl} type="video/quicktime" />
          </video>
        ) : (
          <img
            src={heroBanner}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none"
            referrerPolicy="no-referrer"
          />
        )}

        {/* High-Contrast Dual Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 backdrop-blur-[0.5px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Hero Foreground Content */}
        <div className="relative z-10 w-full max-w-4xl p-6 sm:p-12 lg:p-16 text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold w-fit shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6900]" />
            <span>Authentic Culinary Craft · Fresh Daily</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] drop-shadow-md"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {heroHeading}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl leading-relaxed font-normal drop-shadow-xs">
            {heroTagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <Link
              to={heroPrimaryCtaLink}
              className="px-7 py-3.5 rounded-full bg-[#FF6900] hover:bg-[#E65F00] text-white font-bold text-xs sm:text-sm shadow-[0_4px_24px_rgba(255,105,0,0.45)] transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{heroPrimaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {heroSecondaryCtaText && (
              <a
                href={heroSecondaryCtaLink}
                className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <BadgePercent className="w-4 h-4 text-orange-400" />
                <span>{heroSecondaryCtaText}</span>
              </a>
            )}
          </div>

          {/* Quick Info & Trust Strip */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/80 border-t border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Kitchen Open & Preparing</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-white/20" />
            <span>Doorstep Delivery & Counter Pickup</span>
            <div className="hidden sm:block h-3 w-px bg-white/20" />
            <span>Average ETA: 30–45 mins</span>
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
      {displayDeals.length > 0 && (
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
                        {formatCurrency(original, restaurant.currency || restaurant.ordering?.currency)}
                      </span>
                      <span className="text-sm font-extrabold text-[var(--text)] tabular-nums">
                        {formatCurrency(discounted, restaurant.currency || restaurant.ordering?.currency)}
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
      )}

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
