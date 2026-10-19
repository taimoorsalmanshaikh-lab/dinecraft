import React, { useMemo } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { BentoCard } from '../dashboard/shared/BentoCard';
import { HeroStatCard } from '../dashboard/shared/HeroStatCard';
import { StatTile } from '../dashboard/shared/StatTile';
import { BentoBarChart, BentoAreaChart } from '../dashboard/shared/BentoCharts';
import { DataTable, AvatarStack } from '../dashboard/shared/DataTable';
import { Order } from '../../types';
import { getAvatarColor, getInitial } from '../../lib/avatarUtils';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { navigate } = useRouter();
  const { activeRestaurant, getOrders, getMenuItems, updateOrderStatus } = useDineCraft();

  const rawOrders = getOrders(activeRestaurant.id);
  const orders = useMemo(() => {
    const seen = new Set<string>();
    return rawOrders.filter((o) => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [rawOrders]);

  const menuItems = getMenuItems(activeRestaurant.id);

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === 'New').length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'Rejected' ? o.total : 0), 0);

  // Today's estimated slice
  const todaysRevenue = totalSales > 0 ? (totalSales * 0.42).toFixed(2) : '384.50';
  const weeklyRevenue = totalSales > 0 ? (totalSales * 0.85).toFixed(2) : '2,840.00';

  // Monthly orders bar chart data
  const barChartData = [
    { label: 'May', value: 34 },
    { label: 'Jun', value: 48 },
    { label: 'Jul', value: 62 },
    { label: 'Aug', value: 55 },
    { label: 'Sep', value: 84 },
    { label: 'Oct', value: 112, highlight: true, tooltip: '+17.8%' },
  ];

  // Revenue area chart data
  const areaChartData = [
    { label: 'Mon', value: 320 },
    { label: 'Tue', value: 450 },
    { label: 'Wed', value: 410 },
    { label: 'Thu', value: 580 },
    { label: 'Fri', value: 890 },
    { label: 'Sat', value: 1140 },
    { label: 'Sun', value: 960 },
  ];

  // Top Items Calculation
  const topItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; count: number; image?: string; price: number }>();
    orders.forEach((o) => {
      o.items.forEach((it) => {
        const existing = itemMap.get(it.itemId || it.name) || {
          name: it.name,
          count: 0,
          image: it.imageUrl || it.image,
          price: it.price,
        };
        existing.count += it.quantity;
        itemMap.set(it.itemId || it.name, existing);
      });
    });

    const list = Array.from(itemMap.values()).sort((a, b) => b.count - a.count);
    if (list.length > 0) return list.slice(0, 3);

    // Fallback from menu items
    return menuItems.slice(0, 3).map((mi, i) => ({
      name: mi.name,
      count: 24 - i * 6,
      image: mi.imageUrl || mi.image,
      price: mi.price,
    }));
  }, [orders, menuItems]);

  // Group orders to find active returning diners (buy repeatedly)
  const { returningCustomers, allActiveCustomers } = useMemo(() => {
    const custMap = new Map<
      string,
      {
        name: string;
        phone?: string;
        email?: string;
        orderCount: number;
        totalSpent: number;
        lastOrder: string;
      }
    >();

    orders.forEach((o) => {
      const key =
        (o.customerPhone && o.customerPhone.trim()) ||
        (o.customerEmail && o.customerEmail.trim().toLowerCase()) ||
        o.customerName.trim().toLowerCase();
      if (!key) return;

      const existing = custMap.get(key) || {
        name: o.customerName || 'Customer',
        phone: o.customerPhone,
        email: o.customerEmail,
        orderCount: 0,
        totalSpent: 0,
        lastOrder: o.createdAt,
      };
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      custMap.set(key, existing);
    });

    const list = Array.from(custMap.values()).sort((a, b) => b.orderCount - a.orderCount);
    const repeat = list.filter((c) => c.orderCount > 1);
    return { returningCustomers: repeat, allActiveCustomers: list };
  }, [orders]);

  // Table columns for Recent Orders
  const orderColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs border border-white ${
              getAvatarColor(order.customerName).className
            }`}
          >
            {getInitial(order.customerName)}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-[#111827] block truncate">{order.customerName}</span>
            <span className="text-[11px] text-[#9CA3AF] font-mono">{order.customerPhone || `#${order.id.slice(-4)}`}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (order: Order) => (
        <span className="text-xs text-[#4B5563] truncate block max-w-[150px]">
          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => {
        let dotColor = 'bg-amber-500';
        let textColor = 'text-amber-700';

        if (order.status === 'Completed') {
          dotColor = 'bg-emerald-500';
          textColor = 'text-emerald-700';
        } else if (order.status === 'Preparing') {
          dotColor = 'bg-[#FF6900]';
          textColor = 'text-[#C2410C]';
        } else if (order.status === 'Rejected') {
          dotColor = 'bg-rose-500';
          textColor = 'text-rose-700';
        }

        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${textColor}`}>
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span>{order.status}</span>
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (order: Order) => (
        <span className="text-xs font-black text-[#111827] tabular-nums">
          ${order.total.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (order: Order) => (
        <div className="flex justify-end gap-1.5">
          {order.status === 'New' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus(order.id, 'Accepted');
              }}
              className="px-3 py-1 bg-[#111827] hover:bg-[#FF6900] text-white rounded-full text-[11px] font-bold transition-all"
            >
              Accept
            </button>
          )}
          {order.status === 'Accepted' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus(order.id, 'Preparing');
              }}
              className="px-3 py-1 bg-[#FF6900] hover:bg-[#E65F00] text-white rounded-full text-[11px] font-bold transition-all"
            >
              Cook
            </button>
          )}
          {order.status === 'Preparing' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus(order.id, 'Ready');
              }}
              className="px-3 py-1 bg-[#C2410C] hover:bg-[#E65F00] text-white rounded-full text-[11px] font-bold transition-all"
            >
              Ready
            </button>
          )}
          {order.status === 'Ready' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus(order.id, 'Completed');
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold transition-all"
            >
              Done
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Row 1: HeroStatCard, Engagement Bar Chart, Area Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        {/* Col 1: HeroStatCard (Today's Revenue) */}
        <div className="lg:col-span-4 h-full">
          <HeroStatCard
            label="Today's Revenue"
            value={`$${todaysRevenue}`}
            badgeText="+18.4% today"
            metaText="Live simulated feed"
            onActionClick={() => navigate('/dashboard/orders')}
            className="h-full"
          />
        </div>

        {/* Col 2: Engagement Bar Chart (Orders by month) */}
        <div className="lg:col-span-4 h-full">
          <BentoCard
            title="Orders by Month"
            subtitle="Order volume trend"
            onArrowClick={() => navigate('/dashboard/orders')}
            className="h-full"
          >
            <div className="pt-2">
              <BentoBarChart data={barChartData} height={150} />
            </div>
          </BentoCard>
        </div>

        {/* Col 3: Area Chart (Revenue Curve) */}
        <div className="lg:col-span-4 h-full">
          <BentoCard
            title="Weekly Performance"
            subtitle="Simulated cash flow"
            onArrowClick={() => navigate('/dashboard/orders')}
            className="h-full"
          >
            <div className="pt-1">
              <BentoAreaChart data={areaChartData} height={150} />
            </div>
          </BentoCard>
        </div>
      </div>

      {/* Row 2: Secondary Metrics, Recent Orders Table, Top Items, Customer Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (4 cols on lg): Stat Tiles & Customer Stack */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Weekly Revenue & Total Orders Tiles */}
          <div className="grid grid-cols-2 gap-4">
            <StatTile
              label="Weekly Revenue"
              value={`$${weeklyRevenue}`}
              badge="+12.8%"
              isPositive={true}
              subtext="7-day gross"
            />
            <StatTile
              label="Total Orders"
              value={`${totalOrders}`}
              badge={`${newOrders} new`}
              isPositive={newOrders === 0}
              subtext="All time"
            />
          </div>

          {/* Active Customers Tile (Returning Diners) */}
          <BentoCard
            title="Active Customers"
            subtitle="Returning diners this week"
            onArrowClick={() => navigate('/dashboard/customers')}
          >
            {returningCustomers.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {returningCustomers.slice(0, 3).map((cust, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs border border-white ${
                          getAvatarColor(cust.name).className
                        }`}
                      >
                        {getInitial(cust.name)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#111827] block truncate">
                          {cust.name}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] font-medium block truncate">
                          {cust.phone || cust.email || 'Loyal Diner'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-[#FF6900] bg-[#FFF1E6] px-2.5 py-0.5 rounded-full shrink-0 tabular-nums">
                      {cust.orderCount} orders
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[11px]">
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    ✓ {returningCustomers.length} repeat {returningCustomers.length === 1 ? 'diner' : 'diners'}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/customers')}
                    className="text-[#FF6900] font-bold hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
              </div>
            ) : allActiveCustomers.length > 0 ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50/70">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs border border-white ${
                        getAvatarColor(allActiveCustomers[0].name).className
                      }`}
                    >
                      {getInitial(allActiveCustomers[0].name)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#111827] block truncate">
                        {allActiveCustomers[0].name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {allActiveCustomers[0].phone || 'Active Customer'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    1st Order Placed
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[11px]">
                  <span className="text-slate-400">Next order unlocks repeat status</span>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/customers')}
                    className="text-[#FF6900] font-bold hover:underline cursor-pointer"
                  >
                    View Diners
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-1">
                <p className="text-xs font-semibold text-slate-500">No repeat orders yet</p>
                <p className="text-[11px] text-slate-400">
                  Customers who order multiple times will appear here as returning diners.
                </p>
              </div>
            )}
          </BentoCard>

          {/* Top Selling Items */}
          <BentoCard
            title="Top-Selling Dishes"
            subtitle="Based on kitchen orders"
            onArrowClick={() => navigate('/dashboard/menu')}
            className="flex-1"
          >
            <div className="space-y-3 pt-1">
              {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#FF6900] bg-[#FFF1E6]">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-[#111827] block truncate">{item.name}</span>
                      <span className="text-[11px] text-[#9CA3AF] tabular-nums">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF6900] bg-[#FFF1E6] px-2.5 py-1 rounded-full shrink-0 tabular-nums">
                    {item.count} sold
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>

        {/* Right Column (8 cols on lg): Recent Orders Table */}
        <div className="lg:col-span-8 h-full">
          <BentoCard
            title="Recent Orders"
            subtitle="Live kitchen queue with one-tap status updates"
            headerAction={
              <button
                type="button"
                onClick={() => navigate('/dashboard/orders')}
                className="text-xs font-bold text-[#FF6900] hover:text-[#E65F00] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
            className="h-full"
          >
            <DataTable<Order>
              columns={orderColumns}
              data={orders.slice(0, 5)}
              keyExtractor={(o) => o.id}
              onRowClick={() => navigate('/dashboard/orders')}
              emptyMessage="No customer orders placed yet. Place a test order from your storefront!"
            />
          </BentoCard>
        </div>
      </div>
    </div>
  );
};
