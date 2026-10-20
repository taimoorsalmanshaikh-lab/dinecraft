import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { Restaurant, Order, OrderStatus } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapOrderFromRow } from '../../services/restaurantService';
import { formatCurrency } from '../../lib/currency';
import {
  Clock,
  ChefHat,
  Bike,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Store,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface StorefrontOrdersProps {
  restaurant: Restaurant;
}

export const StorefrontOrders: React.FC<StorefrontOrdersProps> = ({ restaurant }) => {
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currency = restaurant.currency || restaurant.ordering?.currency || 'USD';

  const fetchCustomerOrders = async () => {
    try {
      const storedIds: string[] = JSON.parse(
        localStorage.getItem('dinecraft_customer_orders') || '[]'
      );
      const lastId = localStorage.getItem('dinecraft_last_order_id');
      const storedPhone = localStorage.getItem('dinecraft_customer_phone');

      const allIds = Array.from(new Set([...storedIds, ...(lastId ? [lastId] : [])])).filter(
        Boolean
      );

      let fetchedOrders: Order[] = [];

      // 1. Fetch by known order IDs
      if (allIds.length > 0) {
        const { data: idOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .in('id', allIds)
          .order('created_at', { ascending: false });

        if (idOrders) {
          fetchedOrders = idOrders.map(mapOrderFromRow);
        }
      }

      // 2. Fetch by stored phone if available
      if (storedPhone && storedPhone.trim()) {
        const { data: phoneOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .eq('customer_phone', storedPhone.trim())
          .order('created_at', { ascending: false });

        if (phoneOrders) {
          const mapped: Order[] = (phoneOrders as any[]).map(mapOrderFromRow);
          const seen = new Set(fetchedOrders.map((o) => o.id));
          for (const ord of mapped) {
            if (!seen.has(ord.id)) {
              seen.add(ord.id);
              fetchedOrders.push(ord);
            }
          }
        }
      }

      // Sort newest first
      fetchedOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(fetchedOrders);
    } catch (err) {
      console.warn('Error fetching customer orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();

    // Set up live sync channel
    const channel = supabase
      .channel(`customer_orders_${restaurant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          fetchCustomerOrders();
        }
      )
      .subscribe();

    // 3s polling fallback for 100% sync reliability
    const interval = setInterval(fetchCustomerOrders, 3000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  const getStatusBadge = (status: OrderStatus) => {
    const s = (status || '').toLowerCase().trim();

    if (s === 'new' || s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Order Received</span>
        </span>
      );
    }

    if (s === 'accepted' || s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Accepted by Kitchen</span>
        </span>
      );
    }

    if (s === 'preparing' || s === 'cooking') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] border border-[var(--brand,#FF6900)]/20">
          <span className="w-2 h-2 rounded-full bg-[var(--brand,#FF6900)] animate-pulse" />
          <span>Cooking Fresh 👨‍🍳</span>
        </span>
      );
    }

    if (s === 'ready' || s === 'out_for_delivery' || s === 'dispatched') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span>Out for Delivery / Ready 🛵</span>
        </span>
      );
    }

    if (s === 'completed' || s === 'delivered' || s === 'fulfilled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Delivered / Enjoyed ✓</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        <span>Cancelled</span>
      </span>
    );
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-[var(--text)]">
        <div className="w-10 h-10 border-3 border-[var(--brand,#FF6900)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] flex items-center justify-center mx-auto shadow-2xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2
            className="text-2xl font-extrabold text-[var(--text)] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            No Orders Placed Yet
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto">
            When you place an order with <span className="font-semibold text-[var(--text)]">{restaurant.name}</span>, you can track its live kitchen preparation and status right here.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate(`/${restaurant.slug}/menu`)}
            className="sf-button-primary px-6 py-3 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Explore Menu & Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/5">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            My Orders
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Live kitchen status and order history for <span className="font-semibold text-[var(--text)]">{restaurant.name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchCustomerOrders()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/${restaurant.slug}/order-status/${order.id}`)}
            className="sf-card p-5 sm:p-6 space-y-4 hover:shadow-md transition-all cursor-pointer group border border-black/5 hover:border-[var(--brand)]/40"
          >
            {/* Top Row: ID, Time, Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div>
                <span className="font-mono font-black text-sm text-[var(--text)]">
                  #{order.id}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(order.createdAt).toLocaleDateString()}</span>
                </p>
              </div>

              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* Middle: Items List */}
            <div className="space-y-1.5">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text)] font-semibold truncate max-w-[280px] sm:max-w-md">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-mono text-[var(--text-muted)] tabular-nums">
                    {formatCurrency(it.price * it.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Row: Fulfillment, Total, Live Tracker CTA */}
            <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-slate-100">
                  {order.fulfilmentType}
                </span>
                <span className="font-black text-sm text-[var(--text)] tabular-nums">
                  Total: {formatCurrency(order.total, currency)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${restaurant.slug}/order-status/${order.id}`);
                }}
                className="sf-button-primary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 group-hover:brightness-95 cursor-pointer shadow-2xs"
              >
                <span>Live Tracking</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
