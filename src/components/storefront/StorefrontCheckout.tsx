import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant } from '../../types';
import {
  Bike,
  Store,
  Banknote,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BURGER_HERO_IMAGE } from '../../data/mockData';

interface StorefrontCheckoutProps {
  restaurant: Restaurant;
  isPreviewMode?: boolean;
}

type CheckoutStep = 1 | 2 | 3 | 4;

export const StorefrontCheckout: React.FC<StorefrontCheckoutProps> = ({ restaurant }) => {
  const { navigate } = useRouter();
  const { getCart, getCartSubtotal, createOrder, currentUser, userProfile, logout } = useDineCraft();

  const cart = getCart(restaurant.id);
  const subtotal = getCartSubtotal(restaurant.id);

  const currency = restaurant.currency || '$';
  const isFreeDeliveryEligible =
    Boolean(restaurant.freeDelivery) ||
    restaurant.deliveryFee === 0 ||
    (Boolean(restaurant.freeDeliveryThreshold && restaurant.freeDeliveryThreshold > 0) &&
      subtotal >= (restaurant.freeDeliveryThreshold || 0));

  const deliveryEnabled = restaurant.deliveryEnabled ?? restaurant.ordering?.deliveryEnabled ?? true;
  const pickupEnabled = restaurant.pickupEnabled ?? restaurant.ordering?.pickupEnabled ?? true;
  const configuredDeliveryFee = Number(restaurant.deliveryFee ?? restaurant.ordering?.deliveryFee ?? 0);
  const deliveryFeeConfig = isFreeDeliveryEligible ? 0 : configuredDeliveryFee;
  const minOrderAmount = restaurant.minimumOrder ?? restaurant.ordering?.minimumOrder ?? 0;

  // Checkout Flow Step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Form State
  const [fulfilmentType, setFulfilmentType] = useState<'delivery' | 'pickup'>(
    deliveryEnabled ? 'delivery' : 'pickup'
  );
  const [customerName, setCustomerName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.addresses?.[0]?.line1 || '');
  const [deliveryCity, setDeliveryCity] = useState(restaurant.city || '');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Auto-fill from user profile when user logs in
  useEffect(() => {
    if (currentUser) {
      if (!customerName && (userProfile?.name || currentUser.displayName)) {
        setCustomerName(userProfile?.name || currentUser.displayName || '');
      }
      if (!customerEmail && currentUser.email) {
        setCustomerEmail(currentUser.email);
      }
      if (!customerPhone && userProfile?.phone) {
        setCustomerPhone(userProfile.phone);
      }
      if (!deliveryAddress && userProfile?.addresses?.[0]?.line1) {
        setDeliveryAddress(userProfile.addresses[0].line1);
      }
    }
  }, [currentUser, userProfile]);

  const deliveryFee = fulfilmentType === 'delivery' && deliveryEnabled ? deliveryFeeConfig : 0;
  const total = subtotal + deliveryFee;

  // Validation per step
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'Please enter your full name';
    }
    if (!customerPhone.trim()) {
      errs.customerPhone = 'Please provide a valid contact number';
    } else if (customerPhone.replace(/[^0-9]/g, '').length < 7) {
      errs.customerPhone = 'Contact number must contain at least 7 digits';
    }
    if (fulfilmentType === 'delivery' && !deliveryAddress.trim()) {
      errs.deliveryAddress = 'Street delivery address is required for doorstep delivery';
    }
    if (subtotal < minOrderAmount) {
      errs.subtotal = `Order subtotal must meet minimum $${minOrderAmount.toFixed(2)}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (subtotal < minOrderAmount) {
      setErrors({ subtotal: `Order subtotal must meet minimum $${minOrderAmount.toFixed(2)}` });
      return;
    }
    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    if (!validateStep2()) return;
    setErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep3 = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async () => {
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder({
        restaurantId: restaurant.id,
        restaurantSlug: restaurant.slug,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: fulfilmentType === 'delivery' ? `${deliveryAddress.trim()}, ${deliveryCity.trim()}` : 'Pickup Counter',
        fulfilmentType,
        items: cart.map((ci) => ({
          itemId: ci.id,
          name: ci.name,
          price: ci.price,
          quantity: ci.quantity,
          imageUrl: ci.imageUrl || ci.image,
          image: ci.image || ci.imageUrl,
          selectedOptions: ci.selectedOptions,
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod: 'Cash on Delivery',
        notes: notes.trim(),
        status: 'New',
      });

      // Save customer order details locally for review eligibility & My Orders
      try {
        const stored = JSON.parse(localStorage.getItem('dinecraft_customer_orders') || '[]');
        if (!stored.includes(order.id)) {
          stored.push(order.id);
          localStorage.setItem('dinecraft_customer_orders', JSON.stringify(stored));
        }
        localStorage.setItem('dinecraft_last_order_id', order.id);
        if (customerPhone) {
          localStorage.setItem('dinecraft_customer_phone', customerPhone.trim());
        }
        if (customerName) {
          localStorage.setItem('dinecraft_customer_name', customerName.trim());
        }
      } catch {
        // safe fallback
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // safe fallback
      }

      navigate(`/${restaurant.slug}/order-confirmation/${order.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setErrors({ form: 'An error occurred while creating your order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="sf-card max-w-md mx-auto p-8 sm:p-12 text-center my-10 space-y-4 text-[var(--text)]">
        <h2
          className="text-2xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Your bag is empty
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Add items to your order before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/${restaurant.slug}/menu`)}
          className="sf-button-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Browse Menu</span>
        </button>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: 'Order Type' },
    { num: 2, label: 'Contact & Address' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Review' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-6 text-[var(--text)]">
      {/* Top Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep((s) => (s - 1) as CheckoutStep);
            } else {
              navigate(`/${restaurant.slug}/menu`);
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep > 1 ? 'Back to previous step' : 'Back to menu'}</span>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="sf-card p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {stepsList.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-[var(--brand)] text-[var(--brand-contrast,#ffffff)]'
                        : isCurrent
                        ? 'border-2 border-[var(--brand)] text-[var(--brand)] bg-white'
                        : 'border border-black/10 text-slate-400 bg-slate-50'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs whitespace-nowrap ${
                      isCurrent
                        ? 'text-[var(--text)] font-bold'
                        : isCompleted
                        ? 'text-slate-700 font-semibold'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      currentStep > step.num ? 'bg-[var(--brand)]' : 'bg-black/10'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Single-Column Flow with Sticky Desktop Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Flow Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {errors.form && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* STEP 1: ORDER TYPE */}
          {currentStep === 1 && (
            <div className="sf-card p-6 sm:p-8 space-y-5 animate-fadeIn">
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold text-[var(--text)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Step 1: Choose Order Type
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Select doorstep delivery or pick up directly from our kitchen counter.
                </p>
              </div>

              {errors.subtotal && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.subtotal}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Delivery Option */}
                <button
                  type="button"
                  disabled={!deliveryEnabled}
                  onClick={() => setFulfilmentType('delivery')}
                  className={`p-4 rounded-[var(--sf-radius-tile,20px)] text-left transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs ${
                    fulfilmentType === 'delivery'
                      ? 'bg-[var(--brand-subtle)] ring-2 ring-[var(--brand)]'
                      : 'bg-[#F9FAFB] hover:bg-slate-100'
                  } ${!deliveryEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--brand)] shadow-2xs">
                      <Bike className="w-5 h-5" />
                    </div>
                    {fulfilmentType === 'delivery' && (
                      <Check className="w-4 h-4 text-[var(--brand)] stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">Doorstep Delivery</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Fee: ${deliveryFeeConfig.toFixed(2)} · ETA 30–45 mins
                    </p>
                  </div>
                </button>

                {/* Pickup Option */}
                <button
                  type="button"
                  disabled={!pickupEnabled}
                  onClick={() => setFulfilmentType('pickup')}
                  className={`p-4 rounded-[var(--sf-radius-tile,20px)] text-left transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs ${
                    fulfilmentType === 'pickup'
                      ? 'bg-[var(--brand-subtle)] ring-2 ring-[var(--brand)]'
                      : 'bg-[#F9FAFB] hover:bg-slate-100'
                  } ${!pickupEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--brand)] shadow-2xs">
                      <Store className="w-5 h-5" />
                    </div>
                    {fulfilmentType === 'pickup' && (
                      <Check className="w-4 h-4 text-[var(--brand)] stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">Counter Pickup</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      No delivery fee · Ready in 15–20 mins
                    </p>
                  </div>
                </button>
              </div>

              {/* Delivery ETA & Address Highlight */}
              <div className="p-3.5 bg-[#F9FAFB] rounded-xl text-xs text-[var(--text-muted)] flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  {fulfilmentType === 'delivery'
                    ? `Estimated arrival: 30–45 minutes at your location.`
                    : `Kitchen address: ${restaurant.address || 'Main Branch'}, ${restaurant.city || 'Downtown'}.`}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="sf-button-primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Contact Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT & ADDRESS */}
          {currentStep === 2 && (
            <div className="sf-card p-6 sm:p-8 space-y-5 animate-fadeIn">
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold text-[var(--text)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Step 2: Contact & Address
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Provide your contact details so our kitchen and courier can reach you.
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
                    }}
                    placeholder="e.g. Michael Chen"
                    className={`w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border ${
                      errors.customerName
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-black/5 focus:border-[var(--brand)]'
                    } text-[var(--text)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs`}
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.customerName}</p>
                  )}
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: '' }));
                      }}
                      placeholder="e.g. +1 (555) 019-2831"
                      className={`w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border ${
                        errors.customerPhone
                          ? 'border-rose-400 bg-rose-50/20'
                          : 'border-black/5 focus:border-[var(--brand)]'
                      } text-[var(--text)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs`}
                    />
                    {errors.customerPhone && (
                      <p className="text-[11px] text-rose-600 font-medium">{errors.customerPhone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text)]">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="For digital receipt"
                      className="w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Delivery Address fields */}
                {fulfilmentType === 'delivery' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Delivery Address *</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          if (errors.deliveryAddress) setErrors((prev) => ({ ...prev, deliveryAddress: '' }));
                        }}
                        placeholder="Street, Building, Apartment / Suite"
                        className={`w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border ${
                          errors.deliveryAddress
                            ? 'border-rose-400 bg-rose-50/20'
                            : 'border-black/5 focus:border-[var(--brand)]'
                        } text-[var(--text)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs`}
                      />
                      {errors.deliveryAddress && (
                        <p className="text-[11px] text-rose-600 font-medium">{errors.deliveryAddress}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text)]">
                        City / Area
                      </label>
                      <input
                        type="text"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        placeholder="City"
                        className="w-full h-12 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>
                  </>
                )}

                {/* Kitchen / Delivery Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    Order Instructions / Kitchen Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ring doorbell, leave at front desk, cutlery requested..."
                    rows={2}
                    className="w-full p-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 text-[var(--text)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-hidden transition-all shadow-2xs resize-none"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="sf-button-secondary px-5 py-3 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="sf-button-primary flex-1 py-3.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}



          {/* STEP 3: PAYMENT */}
          {currentStep === 3 && (
            <div className="sf-card p-6 sm:p-8 space-y-5 animate-fadeIn">
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold text-[var(--text)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Step 3: Payment Method
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Safe and hassle-free payment on arrival.
                </p>
              </div>

              {/* Cash on Delivery / Pay on Pickup card */}
              <div className="p-4 rounded-[var(--sf-radius-tile,20px)] bg-[var(--brand-subtle)] ring-1 ring-[var(--brand)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--brand)] shadow-2xs">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text)]">
                        {fulfilmentType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter Pickup'}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Cash or local card reader upon order handover
                      </p>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-[var(--brand)] stroke-[3]" />
                </div>

                <div className="p-3 bg-white/90 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No advance charge required</span>
                  </div>
                  <p>
                    Inspect your sealed food package upon arrival before making payment to the courier or cashier.
                  </p>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="sf-button-secondary px-5 py-3 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  className="sf-button-primary flex-1 py-3.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Review Final Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PLACE ORDER */}
          {currentStep === 4 && (
            <div className="sf-card p-6 sm:p-8 space-y-5 animate-fadeIn">
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold text-[var(--text)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Step 4: Review & Confirm Order
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Please verify your order details before submitting to the kitchen.
                </p>
              </div>

              {/* Order Details Recap */}
              <div className="p-4 bg-[#F9FAFB] rounded-[var(--sf-radius-tile,16px)] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="font-semibold text-[var(--text-muted)]">Fulfillment</span>
                  <span className="font-bold text-[var(--text)] capitalize flex items-center gap-1">
                    {fulfilmentType === 'delivery' ? <Bike className="w-3.5 h-3.5 text-[var(--brand)]" /> : <Store className="w-3.5 h-3.5 text-[var(--brand)]" />}
                    <span>{fulfilmentType}</span>
                  </span>
                </div>

                <div className="flex items-start justify-between pb-2 border-b border-black/5">
                  <span className="font-semibold text-[var(--text-muted)]">Recipient</span>
                  <span className="font-medium text-[var(--text)] text-right">
                    {customerName} · {customerPhone}
                  </span>
                </div>

                {fulfilmentType === 'delivery' && (
                  <div className="flex items-start justify-between pb-2 border-b border-black/5">
                    <span className="font-semibold text-[var(--text-muted)]">Delivery Address</span>
                    <span className="font-medium text-[var(--text)] text-right max-w-xs">
                      {deliveryAddress}, {deliveryCity}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-muted)]">Payment</span>
                  <span className="font-medium text-[var(--text)]">
                    Cash on Delivery
                  </span>
                </div>
              </div>

              {/* Itemized List Recap */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Order Items ({cart.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((ci) => (
                    <div
                      key={ci.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-black/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--text)]">
                          {ci.quantity}x
                        </span>
                        <span className="text-[var(--text)] font-medium truncate max-w-[200px]">
                          {ci.name}
                        </span>
                      </div>
                      <span className="font-mono text-[var(--text)] font-semibold tabular-nums">
                        ${(ci.price * ci.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="sf-button-secondary px-5 py-3 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitOrder}
                  className="sf-button-primary flex-1 py-3.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Place Order · ${total.toFixed(2)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Order Summary Bento Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mobile Collapsible Header */}
          <div className="lg:hidden sf-card p-4">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-[var(--text)] cursor-pointer"
            >
              <span>Order Summary ({cart.length} items)</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums font-mono">${total.toFixed(2)}</span>
                {mobileSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
          </div>

          {/* Summary Box (Always visible on desktop, toggleable on mobile) */}
          <div
            className={`sf-card p-6 sm:p-8 space-y-4 lg:sticky lg:top-24 ${
              mobileSummaryOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <h3
              className="text-base font-bold text-[var(--text)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Order Breakdown
            </h3>

            {/* Items strip */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto divide-y divide-black/5">
              {cart.map((item) => {
                const img = item.imageUrl || item.image || BURGER_HERO_IMAGE;
                return (
                  <div key={item.id} className="pt-2 flex items-center gap-3">
                    <img
                      src={img}
                      alt={item.name}
                      className="w-12 h-10 rounded-xl object-cover bg-[#F3F4F6] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-[var(--text)] truncate">{item.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-[var(--text)] tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cost Breakdown */}
            <div className="pt-3 border-t border-black/5 space-y-2.5 text-xs text-[var(--text-muted)]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--text)] tabular-nums">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-[var(--text)] tabular-nums">
                  {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Estimated ETA</span>
                <span className="font-mono">
                  {fulfilmentType === 'delivery' ? '30–45 mins' : '15–20 mins'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-sm font-bold text-[var(--text)]">
                <span>Total Due</span>
                <span className="tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Restaurant guarantee */}
            <div className="p-3 bg-[#F9FAFB] rounded-xl text-[11px] text-[var(--text-muted)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Prepared fresh upon order confirmation.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
