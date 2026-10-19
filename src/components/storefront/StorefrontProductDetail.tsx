import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant, MenuItem, SelectedOption, ProductReview } from '../../types';
import {
  getRestaurantMenuItems,
  getRestaurantDeals,
  getRestaurantReviews,
  addRestaurantReview,
} from '../../services/restaurantService';
import { ProductCard } from './ProductCard';
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Share2,
  Heart,
  Clock,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { BURGER_HERO_IMAGE } from '../../data/mockData';

interface StorefrontProductDetailProps {
  restaurant: Restaurant;
}

export const StorefrontProductDetail: React.FC<StorefrontProductDetailProps> = ({ restaurant }) => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { addToCart, orders, updateOrderStatus, addToast } = useDineCraft();
  const currency = restaurant.currency || '$';

  const [item, setItem] = useState<MenuItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [likedRelatedIds, setLikedRelatedIds] = useState<Record<string, boolean>>({});

  // Reviews State
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      setLoading(true);
      const [items, deals] = await Promise.all([
        getRestaurantMenuItems(restaurant.id),
        getRestaurantDeals(restaurant.id),
      ]);
      if (!isMounted) return;

      // Find by menuItem ID or deal ID
      let found = items.find((i) => i.id === itemId || i.slug === itemId);

      if (!found) {
        const foundDeal = deals.find((d) => d.id === itemId);
        if (foundDeal) {
          found = {
            id: foundDeal.id,
            restaurantId: foundDeal.restaurantId,
            name: foundDeal.title,
            description: foundDeal.description,
            longDescription: `${foundDeal.description} Hand-crafted kitchen combo bundle offering exceptional savings and the finest fresh ingredients prepared fresh to order.`,
            price: foundDeal.discountedPrice,
            compareAtPrice: foundDeal.originalPrice,
            category: 'Special Deals',
            imageUrl: foundDeal.imageUrl || foundDeal.image,
            available: foundDeal.active,
            featured: true,
            tags: ['Special Deal', 'Chef Combo', 'Limited Time'],
            ingredients: [
              'Chef Curated Combo Selection',
              'Artisanal Recipe Preparation',
              'House Made Dip & Sauce',
              'Golden Seasoned Sides',
              'Kitchen Fresh Garnish',
            ],
            ratingAvg: 4.9,
            ratingCount: 18,
          };
        }
      }

      if (found) {
        setItem(found);
        setSelectedImage(found.imageUrl || found.image || '');

        const realReviews = await getRestaurantReviews(restaurant.id, found.id);
        setReviewsList(realReviews as ProductReview[]);

        // Pre-select required options
        const initialOptions: Record<string, SelectedOption> = {};
        found.optionGroups?.forEach((group) => {
          if (group.required && group.options.length > 0) {
            initialOptions[group.name] = {
              groupName: group.name,
              optionName: group.options[0].name,
              priceDelta: group.options[0].priceDelta,
            };
          }
        });
        setSelectedOptions(initialOptions);

        // Related items from same category
        const related = items
          .filter((i) => i.id !== found?.id && (i.category === found?.category || i.featured))
          .slice(0, 4);
        setRelatedItems(related);
      }
      setLoading(false);
    }

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [restaurant.id, itemId]);

  // Order verification for review eligibility
  const orderVerification = useMemo(() => {
    if (!item) {
      return { hasOrdered: false, isDelivered: false, order: null, status: null };
    }

    let customerOrderIds: string[] = [];
    try {
      customerOrderIds = JSON.parse(localStorage.getItem('dinecraft_customer_orders') || '[]');
    } catch {
      customerOrderIds = [];
    }

    const matchingOrders = orders.filter((o) => {
      const containsItem = o.items && o.items.some(
        (it) => it.itemId === item.id || it.name.toLowerCase().includes(item.name.toLowerCase())
      );
      if (!containsItem) return false;
      return true;
    });

    if (matchingOrders.length === 0) {
      return { hasOrdered: false, isDelivered: false, order: null, status: null };
    }

    const deliveredOrder = matchingOrders.find(
      (o) => o.status.toLowerCase() === 'completed' || o.status.toLowerCase() === 'delivered'
    );

    if (deliveredOrder) {
      return { hasOrdered: true, isDelivered: true, order: deliveredOrder, status: 'Completed' };
    }

    const activeOrder = matchingOrders[0];
    return {
      hasOrdered: true,
      isDelivered: false,
      order: activeOrder,
      status: activeOrder.status,
    };
  }, [item, orders]);

  if (loading) {
    return (
      <div className="sf-card max-w-md mx-auto p-12 text-center my-12 space-y-4">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto"
          style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}
        />
        <p className="text-xs text-[var(--text-muted)] font-semibold">Loading authentic dish details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="sf-card max-w-md mx-auto p-10 text-center space-y-4 my-10 text-[var(--text)]">
        <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
        <h2 className="text-xl font-bold text-[var(--text)]">Dish Not Found</h2>
        <p className="text-xs text-[var(--text-muted)]">
          This dish may have been seasonal or removed from the restaurant menu.
        </p>
        <Link
          to={`/${restaurant.slug}/menu`}
          className="sf-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Menu</span>
        </Link>
      </div>
    );
  }

  // Calculate total price with option deltas
  const optionsDelta = Object.values(selectedOptions).reduce((acc, opt) => acc + opt.priceDelta, 0);
  const unitPrice = item.price + optionsDelta;
  const totalPrice = unitPrice * quantity;

  const handleOptionChange = (groupName: string, optionName: string, priceDelta: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: { groupName, optionName, priceDelta },
    }));
  };

  const handleAddToCart = () => {
    addToCart(
      restaurant.id,
      {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
      },
      quantity,
      Object.values(selectedOptions),
      specialInstructions
    );
    navigate(`/${restaurant.slug}/cart`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.name} | ${restaurant.name}`,
          text: item.description,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!orderVerification.isDelivered) {
      setReviewError(
        'Review rule: You can only submit a review after purchasing this dish and your order has been successfully marked as Delivered.'
      );
      return;
    }

    if (!reviewerName.trim()) {
      setReviewError('Please provide your name.');
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Please share a few words about your experience with this dish.');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const savedReview = await addRestaurantReview({
        restaurantId: restaurant.id,
        itemId: item.id,
        orderId: orderVerification.order?.id || 'ORD-VERIFIED',
        customerName: reviewerName.trim(),
        rating: ratingInput,
        comment: reviewComment.trim(),
        verifiedBuyer: orderVerification.hasOrdered || orderVerification.isDelivered,
      });

      setReviewsList((prev) => [savedReview as ProductReview, ...prev]);
      setReviewComment('');
      setReviewerName('');
      setRatingInput(5);

      addToast({
        type: 'success',
        title: 'Review Published!',
        message: 'Thank you! Your verified review is now live and saved in the database.',
      });
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setReviewError('Could not save your review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSimulateDelivery = async () => {
    if (orderVerification.order) {
      await updateOrderStatus(orderVerification.order.id, 'Completed');
      addToast({
        type: 'success',
        title: 'Order Marked Delivered',
        message: `Order #${orderVerification.order.id} is now Delivered. You can now submit your verified review!`,
      });
    }
  };

  const galleryImages = [item.imageUrl || item.image, ...(item.gallery || [])].filter(Boolean);

  const totalReviewsCount = reviewsList.length;
  const averageRating =
    totalReviewsCount > 0
      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6 sm:space-y-8 py-3 sm:py-6 text-[var(--text)]">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] overflow-x-auto whitespace-nowrap pb-1">
        <Link to={`/${restaurant.slug}`} className="hover:text-[var(--brand)] transition-colors font-semibold">
          Home
        </Link>
        <span>›</span>
        <Link to={`/${restaurant.slug}/menu`} className="hover:text-[var(--brand)] transition-colors font-semibold">
          Menu
        </Link>
        <span>›</span>
        <span className="font-semibold text-[var(--text-muted)]">{item.category}</span>
        <span>›</span>
        <span className="font-bold text-[var(--text)] truncate">{item.name}</span>
      </nav>

      {/* 2. Main Product Layout (Two Column Bento Cards: Gallery & Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Gallery Bento Card (5 cols) */}
        <div className="lg:col-span-6 sf-card p-4 sm:p-6 space-y-4">
          <div className="relative aspect-[4/3] rounded-[var(--sf-radius-tile,20px)] overflow-hidden bg-[#F3F4F6] shadow-2xs group">
            <img
              src={selectedImage || item.imageUrl || item.image || BURGER_HERO_IMAGE}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {!item.available && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                <span className="px-4 py-2 bg-black text-white font-bold text-xs rounded-full">
                  Currently Sold Out
                </span>
              </div>
            )}
            {item.tags && item.tags[0] && (
              <span className="absolute top-3 left-3 bg-[var(--brand)] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
                {item.tags[0]}
              </span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img || '')}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all shrink-0 cursor-pointer ${
                    selectedImage === img
                      ? 'ring-2 ring-[var(--brand)] scale-105 shadow-2xs'
                      : 'opacity-60 hover:opacity-100 bg-[#F3F4F6]'
                  }`}
                >
                  <img src={img} alt="Dish view" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Details, Customizations & Add to Bag (6 cols) */}
        <div className="lg:col-span-6 sf-card p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--brand)' }}
              >
                {item.category}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-black/10 text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
                  title="Share dish"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isLiked
                      ? 'text-rose-500 bg-rose-50'
                      : 'bg-[#F3F4F6] text-[var(--text-muted)] hover:text-rose-500'
                  }`}
                  title="Save to favorites"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            {copiedLink && (
              <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                Link to this dish copied to clipboard!
              </p>
            )}

            <h1
              className="text-2xl sm:text-4xl font-extrabold text-[var(--text)] leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {item.name}
            </h1>

            {/* Ratings & Quick Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
              <a
                href="#reviews-section"
                className="flex items-center gap-1 font-bold text-amber-500 hover:underline"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{averageRating}</span>
                <span className="text-[var(--text-muted)] font-normal">({totalReviewsCount} reviews)</span>
              </a>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--brand)]" />
                <span>{item.prepTimeMins || 20} mins prep</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold text-[var(--text)] tabular-nums">
                {currency}{unitPrice.toFixed(2)}
              </span>
              {item.compareAtPrice && item.compareAtPrice > item.price && (
                <>
                  <span className="text-base text-[var(--text-muted)] line-through tabular-nums">
                    {currency}{item.compareAtPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Save {currency}{(item.compareAtPrice - item.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Full Dish Description */}
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed pt-1">
              {item.longDescription || item.description}
            </p>
          </div>

          {/* Option Groups (Variants / Customizations) */}
          {item.optionGroups && item.optionGroups.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-black/5">
              {item.optionGroups.map((group) => (
                <div key={group.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text)] uppercase tracking-wide">
                      {group.name}
                    </span>
                    {group.required && (
                      <span className="text-[10px] font-bold text-[var(--brand)] bg-[var(--brand-subtle)] px-2.5 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedOptions[group.name]?.optionName === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => handleOptionChange(group.name, opt.name, opt.priceDelta)}
                          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--brand-subtle)] ring-1 ring-[var(--brand)] font-bold shadow-2xs'
                              : 'bg-[#F9FAFB] hover:bg-slate-100 text-[var(--text)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                isSelected ? 'bg-[var(--brand)] text-white' : 'border border-black/20'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <span>{opt.name}</span>
                          </div>
                          {opt.priceDelta > 0 && (
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              +{currency}{opt.priceDelta.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Kitchen Instructions */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-[var(--text)]">
              Kitchen Instructions / Allergies (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Extra sauce on side, no onions, extra crispy..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3.5 text-xs rounded-xl bg-[#F9FAFB] border border-black/5 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all resize-none text-[var(--text)]"
            />
          </div>

          {/* Quantity Stepper & Add to Bag Desktop Bar */}
          <div className="pt-4 border-t border-black/5 flex items-center gap-3">
            <div className="flex items-center rounded-full bg-[#F3F4F6] p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-white text-[var(--text)] flex items-center justify-center hover:bg-slate-50 shadow-2xs cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 text-center font-bold text-xs tabular-nums text-[var(--text)]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-white text-[var(--text)] flex items-center justify-center hover:bg-slate-50 shadow-2xs cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={!item.available}
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-6 rounded-full font-bold text-xs flex items-center justify-between transition-all shadow-xs active:scale-98 cursor-pointer ${
                item.available
                  ? 'sf-button-primary'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{item.available ? 'Add to Bag' : 'Sold Out / Unavailable'}</span>
              </div>
              <span className="tabular-nums font-extrabold text-sm">{currency}{totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. STICKY MOBILE ADD-TO-CART BENTO BAR */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-full shadow-[var(--sf-shadow)] border border-black/5 p-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-[#F3F4F6] p-0.5">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center font-bold text-xs tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-2xs"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-[var(--text)] tabular-nums">
            {currency}{totalPrice.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          disabled={!item.available}
          onClick={handleAddToCart}
          className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
            item.available ? 'sf-button-primary' : 'bg-slate-200 text-slate-400'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{item.available ? 'Add to Bag' : 'Sold Out'}</span>
        </button>
      </div>

      {/* 4. RATINGS & REVIEWS SECTION IN BENTO CARDS */}
      <section id="reviews-section" className="space-y-6 pt-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-semibold mb-1">
              <Star className="w-3.5 h-3.5 fill-[var(--brand)]" />
              <span>Customer Feedback</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[var(--text)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Ratings & Verified Reviews
            </h2>
          </div>
        </div>

        {/* Reviews Summary and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Bento Card */}
          <div className="lg:col-span-1 sf-card p-6 text-center space-y-4 h-fit">
            <div className="space-y-1">
              <div className="text-5xl font-black text-[var(--text)]">{averageRating}</div>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(Number(averageRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Based on {totalReviewsCount} verified reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1.5 pt-2 border-t border-black/5">
              {[5, 4, 3, 2, 1].map((r) => (
                <div key={r} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold text-[var(--text)]">{r}</span>
                  <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{
                        width: `${
                          (reviewsList.filter((rev) => Math.round(rev.rating) === r).length /
                            (totalReviewsCount || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-[var(--text-muted)]">
                    {reviewsList.filter((rev) => Math.round(rev.rating) === r).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List & Submission */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Submission Bento Card */}
            <div className="sf-card p-6 sm:p-8 space-y-4">
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4
                    className="font-bold text-base text-[var(--text)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Write a Customer Review
                  </h4>
                  {orderVerification.hasOrdered && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      ✓ Verified Buyer
                    </span>
                  )}
                </div>

                {reviewError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Star Rating Picker */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--text)]">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= (hoverRating || ratingInput);
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRatingInput(starVal)}
                          className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--text)]">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Michael S."
                    className="w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--text)]">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your authentic feedback about this dish..."
                    className="w-full p-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="sf-button-primary px-6 py-3 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Saving to Database...' : 'Post Customer Review'}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[var(--text)]">Customer Reviews ({reviewsList.length})</h4>
              {reviewsList.length === 0 ? (
                <div className="sf-card p-8 text-center space-y-1 bg-[#F9FAFB]">
                  <p className="text-xs font-bold text-[var(--text)]">No customer reviews yet</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Be the first diner to review this dish and help others discover great food!
                  </p>
                </div>
              ) : (
                reviewsList.map((rev) => (
                  <div key={rev.id} className="sf-card p-4 sm:p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text)]">{rev.customerName}</span>
                        {rev.verifiedBuyer && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{rev.comment}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{rev.createdAt}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. "You May Also Like" Related Items using shared ProductCard */}
      {relatedItems.length > 0 && (
        <section className="pt-6 sm:pt-10 space-y-4">
          <div>
            <h3
              className="text-xl sm:text-2xl font-extrabold text-[var(--text)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              You May Also Like
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Pair your order with these popular favorites from our kitchen.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 items-stretch">
            {relatedItems.map((rel) => (
              <ProductCard
                key={rel.id}
                item={rel}
                restaurant={restaurant}
                isLiked={!!likedRelatedIds[rel.id]}
                onToggleLike={(e, id) => {
                  e.stopPropagation();
                  setLikedRelatedIds((prev) => ({ ...prev, [id]: !prev[id] }));
                }}
                onQuickAdd={(e, itm) => {
                  e.stopPropagation();
                  addToCart(restaurant.id, itm as MenuItem);
                }}
                onOpenProduct={(id) => {
                  navigate(`/${restaurant.slug}/product/${id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
