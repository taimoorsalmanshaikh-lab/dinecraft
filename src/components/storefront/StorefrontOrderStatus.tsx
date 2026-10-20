import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant, OrderStatus, Order } from '../../types';
import { subscribeToOrder } from '../../services/restaurantService';
import { formatCurrency } from '../../lib/currency';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Check,
  AlertTriangle,
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  ArrowRight,
} from 'lucide-react';

interface StorefrontOrderStatusProps {
  restaurant: Restaurant;
  orderId?: string;
  isPreviewMode?: boolean;
}

export const StorefrontOrderStatus: React.FC<StorefrontOrderStatusProps> = ({
  restaurant,
  orderId: propOrderId,
}) => {
  const { navigate } = useRouter();
  const { orders, customerOrders } = useDineCraft();
  const [liveOrder, setLiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveOrderId =
    propOrderId ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('orderId') ||
        localStorage.getItem('dinecraft_last_order_id') ||
        ''
      : '');

  // Subscribe to real-time status updates via Supabase
  useEffect(() => {
    if (!effectiveOrderId) {
      setIsLoading(false);
      return;
    }

    const unsub = subscribeToOrder(effectiveOrderId, (updated) => {
      if (updated) {
        setLiveOrder(updated);
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [effectiveOrderId]);

  const order =
    liveOrder ||
    orders.find((o) => o.id === effectiveOrderId) ||
    customerOrders.find((o) => o.id === effectiveOrderId) ||
    (orders.length > 0 ? orders[0] : null);

  const isPickup = order?.fulfilmentType === 'pickup';

  const steps: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
    { status: 'New', label: 'Order Transmitted', desc: 'Received by kitchen register', icon: Clock },
    { status: 'Accepted', label: 'Accepted by Kitchen', desc: 'Order approved & assigned to station', icon: Check },
    { status: 'Preparing', label: 'Preparing Fresh', desc: 'Kitchen is cooking your meal', icon: ChefHat },
    {
      status: 'Ready',
      label: isPickup ? 'Ready for Counter Pickup' : 'Ready / Out for Delivery',
      desc: isPickup
        ? 'Your order is hot and waiting at the collection counter'
        : 'Courier dispatched with your sealed package',
      icon: isPickup ? Store : Bike,
    },
    {
      status: 'Completed',
      label: isPickup ? 'Collected & Enjoyed' : 'Delivered & Enjoyed',
      desc: 'Order handed over successfully',
      icon: CheckCircle2,
    },
  ];

  const currency = restaurant.currency || restaurant.ordering?.currency || 'USD';

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
  const isRejected = order?.status === 'Rejected' || order?.status === 'Cancelled';

  if (isLoading && !order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-[var(--text)]">
        <div className="w-10 h-10 border-3 border-[var(--brand,#FF6900)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">Connecting to kitchen register...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-12 space-y-6 text-[var(--text)]">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/${restaurant.slug}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {restaurant.name}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/${restaurant.slug}/orders`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline cursor-pointer"
        >
          <span>View All My Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Status Bento Card */}
      <div className="sf-card p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-wider">
                Live Kitchen Real-Time Status
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] mt-0.5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Order #{order?.id || effectiveOrderId || 'ACTIVE'}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Placed {order?.createdAt || 'Recently'} · Customer: {order?.customerName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                order?.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : isRejected
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-[var(--brand-subtle)] text-[var(--brand)]'
              }`}
            >
              {order?.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Rejection / Cancellation Notice */}
        {isRejected ? (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 flex items-start gap-3 border border-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold">This order was {order?.status?.toLowerCase()}</h4>
              <p className="text-xs text-rose-700">
                {order?.rejectionReason
                  ? `Reason: ${order.rejectionReason}`
                  : `Please contact the kitchen directly at ${
                      restaurant.phone || restaurant.contact?.phone || '+1 (555) 019-2831'
                    } for questions or assistance.`}
              </p>
            </div>
          </div>
        ) : (
          /* Live Progress Timeline */
          <div className="space-y-6">
            <div className="relative pl-6 sm:pl-8 border-l-2 border-black/10 space-y-8 ml-3 sm:ml-4">
              {steps.map((st) => {
                const stepLevel = normalizeStatusLevel(st.status);
                const isPassed = currentLevel >= stepLevel;
                const isCurrent = currentLevel === stepLevel;
                const IconComponent = st.icon;

                return (
                  <div key={st.status} className="relative">
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                        isPassed
                          ? 'bg-[var(--brand)] text-[var(--brand-contrast,#ffffff)] shadow-2xs ring-4 ring-[var(--brand-subtle)]'
                          : 'bg-white border-2 border-black/15 text-slate-400'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <IconComponent
                            className={`w-4 h-4 ${
                              isCurrent
                                ? 'text-[var(--brand)]'
                                : isPassed
                                ? 'text-slate-700'
                                : 'text-slate-400'
                            }`}
                          />
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-[var(--brand)] font-extrabold'
                                : isPassed
                                ? 'text-[var(--text)]'
                                : 'text-slate-400'
                            }`}
                          >
                            {st.label}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 pl-6">{st.desc}</p>
                      </div>

                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-[10px] font-bold uppercase shrink-0">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details Bento Tile */}
        <div className="p-5 rounded-2xl bg-[#F9FAFB] space-y-4 border border-black/5">
          <h3
            className="text-xs font-bold text-[var(--text)] uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Order Summary & Details
          </h3>

          <div className="space-y-2 text-xs text-[var(--text-muted)]">
            <div className="flex justify-between">
              <span>Customer</span>
              <span className="font-semibold text-[var(--text)]">{order?.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Contact</span>
              <span className="font-semibold text-[var(--text)]">{order?.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Fulfillment</span>
              <span className="font-semibold text-[var(--text)] capitalize">
                {order?.fulfilmentType || 'Delivery'}
              </span>
            </div>
            {order?.deliveryAddress && (
              <div className="flex justify-between">
                <span>Address</span>
                <span className="font-semibold text-[var(--text)] text-right max-w-xs truncate">
                  {order?.deliveryAddress}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-black/5 flex justify-between font-bold text-sm text-[var(--text)]">
              <span>Total Paid / Due</span>
              <span className="tabular-nums font-mono">{formatCurrency(order?.total || 0, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
