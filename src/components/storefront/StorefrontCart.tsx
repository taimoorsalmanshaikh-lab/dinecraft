import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant } from '../../types';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { BURGER_HERO_IMAGE } from '../../data/mockData';

interface StorefrontCartProps {
  restaurant: Restaurant;
  isPreviewMode?: boolean;
}

export const StorefrontCart: React.FC<StorefrontCartProps> = ({ restaurant }) => {
  const { navigate } = useRouter();
  const {
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartSubtotal,
    getMenuItems,
  } = useDineCraft();

  const cart = getCart(restaurant.id);
  const menuItems = getMenuItems(restaurant.id);
  const subtotal = getCartSubtotal(restaurant.id);
  const currency = restaurant.currency || '$';
  const deliveryEnabled = restaurant.deliveryEnabled ?? restaurant.ordering?.deliveryEnabled ?? true;
  const isFreeDelivery =
    Boolean(restaurant.freeDelivery) ||
    restaurant.deliveryFee === 0 ||
    (Boolean(restaurant.freeDeliveryThreshold && restaurant.freeDeliveryThreshold > 0) &&
      subtotal >= (restaurant.freeDeliveryThreshold || 0));

  const configuredDeliveryFee = Number(restaurant.deliveryFee ?? restaurant.ordering?.deliveryFee ?? 0);
  const deliveryFee = deliveryEnabled && !isFreeDelivery ? configuredDeliveryFee : 0;
  const minimumOrder = restaurant.minimumOrder ?? restaurant.ordering?.minimumOrder ?? 0;
  const total = subtotal + deliveryFee;

  // Check if any cart item is unavailable
  const unavailableItems = cart.filter((ci) => {
    const rawDish = menuItems.find((m) => m.id === ci.menuItemId || m.id === ci.id.split('_')[0]);
    return rawDish && rawDish.available === false;
  });

  const hasUnavailableItems = unavailableItems.length > 0;
  const isBelowMinimum = subtotal < minimumOrder;

  const handleContinueShopping = () => {
    navigate(`/${restaurant.slug}/menu`);
  };

  const handleProceedToCheckout = () => {
    if (hasUnavailableItems || isBelowMinimum) return;
    navigate(`/${restaurant.slug}/checkout`);
  };

  if (cart.length === 0) {
    return (
      <div className="sf-card max-w-md mx-auto p-8 sm:p-12 text-center my-8 space-y-4 text-[var(--text)]">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2
          className="text-xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Your bag is empty
        </h2>
        <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
          Looks like you haven't added anything to your order yet. Explore our delicious menu and find your favorite dishes.
        </p>
        <button
          type="button"
          onClick={handleContinueShopping}
          className="sf-button-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
        >
          <span>Explore Menu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-6 text-[var(--text)]">
      {/* Title Bento Card */}
      <div className="sf-card p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h1
            className="text-xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Review Your Order
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Ordering from <span className="font-semibold text-[var(--text)]">{restaurant.name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => clearCart(restaurant.id)}
          className="text-xs text-[var(--text-muted)] hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-full hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear bag</span>
        </button>
      </div>

      {/* Unavailable Items Warning Alert */}
      {hasUnavailableItems && (
        <div className="sf-tile p-4 bg-rose-50 border-l-4 border-rose-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-900">Some items are currently unavailable</h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              One or more items in your bag are sold out. Please remove them to proceed with checkout.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Items List Column */}
        <div className="lg:col-span-7 space-y-3">
          {cart.map((item) => {
            const rawDish = menuItems.find((m) => m.id === item.menuItemId || m.id === item.id.split('_')[0]);
            const isItemUnavailable = rawDish && rawDish.available === false;
            const itemImage = item.imageUrl || item.image || rawDish?.imageUrl || rawDish?.image || BURGER_HERO_IMAGE;

            return (
              <div
                key={item.id}
                className={`sf-tile p-4 flex items-center gap-3 sm:gap-4 transition-all ${
                  isItemUnavailable ? 'border-2 border-rose-300 bg-rose-50/30' : ''
                }`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--sf-radius-tile,14px)] overflow-hidden bg-[#F3F4F6] shrink-0 relative">
                  <img
                    src={itemImage}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isItemUnavailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white uppercase px-1.5 py-0.5 rounded">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                      {item.name}
                    </h3>
                    {isItemUnavailable && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 tabular-nums">
                    {currency}{item.price.toFixed(2)} each
                  </p>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {item.selectedOptions.map((o) => o.optionName).join(', ')}
                    </p>
                  )}
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                  <div className="flex items-center rounded-full bg-[#F3F4F6] p-0.5">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(restaurant.id, item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text)] hover:bg-white shadow-2xs transition-all cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-[var(--text)] tabular-nums min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(restaurant.id, item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text)] hover:bg-white shadow-2xs transition-all cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-[var(--text)] tabular-nums min-w-[55px] text-right">
                    {currency}{(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(restaurant.id, item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleContinueShopping}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Add more dishes from the menu</span>
            </button>
          </div>
        </div>

        {/* Order Summary Column (Sticky Bento Card) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="sf-card p-6 sm:p-8 space-y-4">
            <h3
              className="text-base font-bold text-[var(--text)] pb-3 border-b border-black/5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--text)] tabular-nums">{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-[var(--text)] tabular-nums">
                  {deliveryFee > 0 ? `${currency}${deliveryFee.toFixed(2)}` : 'Free'}
                </span>
              </div>

              {minimumOrder > 0 && isBelowMinimum && (
                <div className="pt-2 pb-1">
                  <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-800">
                    Minimum order is {currency}{minimumOrder.toFixed(2)}. Add {currency}{(minimumOrder - subtotal).toFixed(2)} more to checkout.
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-black/5 flex justify-between text-base font-bold text-[var(--text)]">
                <span>Total</span>
                <span className="tabular-nums">{currency}{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={hasUnavailableItems || isBelowMinimum}
              onClick={handleProceedToCheckout}
              className={`w-full py-3.5 px-4 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                hasUnavailableItems || isBelowMinimum
                  ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                  : 'sf-button-primary'
              }`}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
