import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant } from '../../types';
import {
  CheckCircle2,
  Clock,
  Printer,
  ArrowRight,
  ChefHat,
  Bike,
  Check,
  Copy,
} from 'lucide-react';

import { subscribeToOrder } from '../../services/restaurantService';
import { Order, OrderStatus } from '../../types';

interface StorefrontConfirmationProps {
  restaurant: Restaurant;
  orderId?: string;
  isPreviewMode?: boolean;
}

export const StorefrontConfirmation: React.FC<StorefrontConfirmationProps> = ({
  restaurant,
  orderId: propOrderId,
}) => {
  const { navigate } = useRouter();
  const { orders } = useDineCraft();
  const [liveOrder, setLiveOrder] = useState<Order | null>(null);

  const [copiedRef, setCopiedRef] = useState(false);

  const effectiveOrderId =
    propOrderId ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('orderId') ||
        localStorage.getItem('dinecraft_last_order_id') ||
        ''
      : '');

  useEffect(() => {
    if (!effectiveOrderId) return;
    const unsub = subscribeToOrder(effectiveOrderId, (updated) => {
      if (updated) setLiveOrder(updated);
    });
    return () => unsub();
  }, [effectiveOrderId]);

  const order =
    liveOrder ||
    orders.find((o) => o.id === effectiveOrderId) ||
    orders[0];

  const normalizeStatusLevel = (status?: string): number => {
    if (!status) return 0;
    const s = status.toLowerCase().trim();
    if (s === 'new' || s === 'pending') return 0;
    if (s === 'accepted' || s === 'confirmed') return 1;
    if (s === 'preparing' || s === 'cooking') return 2;
    if (s === 'ready' || s === 'out_for_delivery' || s === 'dispatched') return 3;
    if (s === 'completed' || s === 'delivered' || s === 'fulfilled') return 4;
    if (s === 'rejected' || s === 'cancelled') return -1;
    return 0;
  };

  const currentLevel = order ? normalizeStatusLevel(order.status) : 0;

  const timelineSteps = [
    {
      title: 'Order Received',
      desc: 'Sent to kitchen',
      status: currentLevel > 0 ? 'completed' : 'active',
    },
    {
      title: 'Kitchen Confirmed',
      desc: 'Order accepted & queued',
      status: currentLevel > 1 ? 'completed' : currentLevel === 1 ? 'active' : 'pending',
    },
    {
      title: 'Cooking & Packing',
      desc: 'Freshly assembled',
      status: currentLevel > 2 ? 'completed' : currentLevel === 2 ? 'active' : 'pending',
    },
    {
      title: order?.fulfilmentType === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery',
      desc: order?.fulfilmentType === 'pickup' ? 'Ready at collection counter' : 'En route to you',
      status: currentLevel > 3 ? 'completed' : currentLevel === 3 ? 'active' : 'pending',
    },
    {
      title: 'Order Completed',
      desc: 'Enjoy your meal',
      status: currentLevel >= 4 ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-16 text-[var(--text)]">
      {/* Centered Bento Card with Check Icon */}
      <div className="sf-card p-6 sm:p-12 text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Order Confirmed
          </span>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Thank You, {order?.customerName || 'Valued Guest'}!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Your order has been received by <span className="font-semibold text-[var(--text)]">{restaurant.name}</span>.
          </p>
        </div>

        {/* Order Reference Box (Tile) */}
        <div className="sf-tile p-4 bg-[#F9FAFB] flex flex-wrap items-center justify-around gap-4 text-xs">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Reference ID</p>
            <p className="text-sm font-black text-[var(--text)] font-mono mt-0.5">{order?.id || 'ORD-DEMO'}</p>
          </div>
          <div className="h-6 w-px bg-black/10 hidden sm:block" />
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Fulfillment</p>
            <p className="font-semibold text-[var(--text)] capitalize mt-0.5">{order?.fulfilmentType || 'Delivery'}</p>
          </div>
          <div className="h-6 w-px bg-black/10 hidden sm:block" />
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Estimated Arrival</p>
            <p className="font-semibold text-[var(--text)] mt-0.5 font-mono">
              {order?.fulfilmentType === 'pickup' ? '15–20 mins' : '30–45 mins'}
            </p>
          </div>
        </div>

        {/* Simple Clean Order Timeline */}
        <div className="text-left space-y-3 pt-2">
          <h3
            className="text-xs font-bold text-[var(--text)] uppercase tracking-wider text-center sm:text-left"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Order Progress
          </h3>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-black/10 space-y-6 my-4 ml-3 sm:ml-4">
            {timelineSteps.map((step) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <div key={step.title} className="relative">
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : isActive
                        ? 'bg-[var(--brand)] text-[var(--brand-contrast,#ffffff)] ring-4 ring-[var(--brand-subtle)]'
                        : 'bg-white border-2 border-black/15 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : isActive ? (
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isActive
                          ? 'text-[var(--brand)]'
                          : isCompleted
                          ? 'text-[var(--text)]'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/${restaurant.slug}/order-status/${order?.id || 'demo'}`)}
            className="sf-button-primary w-full sm:w-auto px-6 py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Live Order Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate(`/${restaurant.slug}/orders`)}
            className="sf-button-secondary w-full sm:w-auto px-5 py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>My Orders</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="sf-button-secondary w-full sm:w-auto px-5 py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
