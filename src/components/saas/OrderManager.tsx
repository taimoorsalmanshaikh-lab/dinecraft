import React, { useState, useMemo } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { Order, OrderStatus } from '../../types';
import { getAvatarColor, getInitial } from '../../lib/avatarUtils';
import { formatCurrency } from '../../lib/currency';
import { BentoCard } from '../dashboard/shared/BentoCard';
import { DataTable } from '../dashboard/shared/DataTable';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

export const OrderManager: React.FC = () => {
  const { activeRestaurant, getOrders, updateOrderStatus } = useDineCraft();
  const rawOrders = getOrders(activeRestaurant.id);
  const currency = activeRestaurant.ordering?.currency || activeRestaurant.currency || '$';

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const statusList: Array<OrderStatus | 'all'> = [
    'all',
    'New',
    'Accepted',
    'Preparing',
    'Ready',
    'Completed',
    'Rejected',
  ];

  const orders = useMemo(() => {
    const seen = new Set<string>();
    const trimmed = searchQuery.trim().toLowerCase();
    const cleanId = trimmed.replace(/^#+/, '').trim();
    const cleanDigits = trimmed.replace(/[^0-9]/g, '');

    return rawOrders.filter((o) => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);

      const orderIdLower = (o.id || '').toLowerCase();
      const orderIdWithHash = `#${orderIdLower}`;
      const orderNumStr = String(o.orderNumber || '');

      // Check if searching for a unique Order ID
      const matchesId =
        (cleanId.length > 0 && (orderIdLower === cleanId || orderIdLower.includes(cleanId))) ||
        (trimmed.length > 0 && (orderIdWithHash === trimmed || orderIdWithHash.includes(trimmed))) ||
        (orderNumStr.length > 0 && (cleanId === orderNumStr || cleanDigits === orderNumStr));

      // Direct ID search bypasses status filter so admin immediately finds the order
      const isDirectIdSearch = cleanId.length >= 3 && (cleanId.startsWith('ord') || orderIdLower.includes(cleanId));
      const matchesStatus =
        selectedStatus === 'all' || o.status === selectedStatus || isDirectIdSearch;

      if (!matchesStatus) return false;
      if (!trimmed) return true;

      // Other search fields
      const matchesName = Boolean(o.customerName && o.customerName.toLowerCase().includes(trimmed));
      const customerPhoneDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
      const matchesPhone = Boolean(
        o.customerPhone &&
          (o.customerPhone.includes(trimmed) ||
            (cleanDigits.length >= 3 && customerPhoneDigits.includes(cleanDigits)))
      );
      const matchesEmail = Boolean(o.customerEmail && o.customerEmail.toLowerCase().includes(trimmed));

      return matchesId || matchesName || matchesPhone || matchesEmail;
    });
  }, [rawOrders, selectedStatus, searchQuery]);

  const activeOrdersCount = rawOrders.filter((o) =>
    ['New', 'Accepted', 'Preparing'].includes(o.status)
  ).length;

  const orderColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs border border-white ${
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
      key: 'id',
      header: 'Unique Order ID',
      render: (order: Order) => (
        <div className="flex items-center gap-1.5 group/id">
          <span className="font-mono text-xs font-bold text-[#111827] bg-[#F3F4F6] px-2 py-0.5 rounded-md border border-slate-200/60 select-all tracking-tight">
            #{order.id}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(order.id);
              setCopiedOrderId(order.id);
              setTimeout(() => setCopiedOrderId(null), 2000);
            }}
            title="Copy Order ID"
            className="p-1 text-slate-400 hover:text-[#FF6900] transition-colors cursor-pointer"
          >
            {copiedOrderId === order.id ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Ordered Dishes',
      render: (order: Order) => (
        <span className="text-xs text-[#4B5563] truncate block max-w-[220px]">
          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'fulfilment',
      header: 'Type',
      render: (order: Order) => (
        <span className="text-xs font-semibold text-[#4B5563] capitalize">
          {order.fulfilmentType}
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
        } else if (order.status === 'Ready') {
          dotColor = 'bg-[#FF6900]';
          textColor = 'text-[#C2410C]';
        } else if (order.status === 'Rejected') {
          dotColor = 'bg-rose-500';
          textColor = 'text-rose-700';
        }

        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${textColor}`}>
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span>{order.status}</span>
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Total Due',
      render: (order: Order) => (
        <span className="text-xs font-black text-[#111827] tabular-nums">
          {formatCurrency(order.total, currency)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Manage',
      className: 'text-right',
      render: (order: Order) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {order.status === 'New' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'Accepted')}
              className="px-3.5 py-1 bg-[#111827] hover:bg-[#FF6900] text-white rounded-full text-[11px] font-bold transition-all cursor-pointer"
            >
              Accept
            </button>
          )}
          {order.status === 'Accepted' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'Preparing')}
              className="px-3.5 py-1 bg-[#FF6900] hover:bg-[#E65F00] text-white rounded-full text-[11px] font-bold transition-all cursor-pointer"
            >
              Cook
            </button>
          )}
          {order.status === 'Preparing' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'Ready')}
              className="px-3.5 py-1 bg-[#C2410C] hover:bg-[#E65F00] text-white rounded-full text-[11px] font-bold transition-all cursor-pointer"
            >
              Ready
            </button>
          )}
          {order.status === 'Ready' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'Completed')}
              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          )}
          {order.status === 'Completed' && (
            <span className="text-emerald-700 font-bold text-[11px]">Fulfilled ✓</span>
          )}
          {order.status === 'Rejected' && (
            <span className="text-rose-600 font-bold text-[11px]">Cancelled</span>
          )}
        </div>
      ),
    },
  ];

  const emptyMessage = searchQuery.trim()
    ? `No orders found matching "${searchQuery.trim()}". Please verify the customer's Order ID or contact details.`
    : selectedStatus !== 'all'
    ? `No orders currently in "${selectedStatus}" status.`
    : 'No orders placed yet. Place a test order from your storefront!';

  return (
    <div className="space-y-5">
      {/* Search and Status Filter Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="bg-white rounded-full p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] flex items-center gap-1 overflow-x-auto scrollbar-none">
          {statusList.map((st) => {
            const isActive = selectedStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#FF6900] text-white shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                }`}
              >
                {st === 'all' ? `All Orders (${rawOrders.length})` : st}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px] sm:min-w-[340px]">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (e.g. #ORD-1024), customer name, or phone..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs font-semibold text-[#111827] placeholder:text-[#9CA3AF] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] border-none focus:ring-2 focus:ring-[#FF6900] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Bento Orders Table Card */}
      <BentoCard
        title={`Live Kitchen Orders (${orders.length})`}
        subtitle={`${activeOrdersCount} orders currently in preparation or awaiting kitchen response`}
        headerAction={
          <span className="px-3 py-1 rounded-full bg-[#FFF1E6] text-[#FF6900] text-xs font-bold">
            {activeOrdersCount} Active
          </span>
        }
      >
        <DataTable<Order>
          columns={orderColumns}
          data={orders}
          keyExtractor={(o) => o.id}
          onRowClick={(order) => setSelectedOrder(order)}
          emptyMessage={emptyMessage}
        />
      </BentoCard>

      {/* Right-Side Slide-Over for Order Detail with Status Timeline */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-[0_16px_48px_rgba(16,24,40,0.18)] z-10 flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[#FF6900] uppercase tracking-wider">
                    Order Details & Storefront Reference
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-xl font-black text-[#111827] font-mono">
                      #{selectedOrder.id}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.id);
                        setCopiedOrderId(selectedOrder.id);
                        setTimeout(() => setCopiedOrderId(null), 2000);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#FF6900] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copy Unique Order Reference"
                    >
                      {copiedOrderId === selectedOrder.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">
                    Placed: {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-slate-200 text-[#4B5563] flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Box */}
              <div className="rounded-[20px] bg-[#F9FAFB] p-4 my-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#9CA3AF] font-medium">Customer:</span>
                  <span className="font-bold text-[#111827]">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9CA3AF] font-medium">Contact:</span>
                  <span className="font-semibold text-[#111827]">{selectedOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9CA3AF] font-medium">Fulfilment:</span>
                  <span className="font-bold text-[#FF6900] capitalize">{selectedOrder.fulfilmentType}</span>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6900] shrink-0 mt-0.5" />
                    <span className="text-[#4B5563] font-medium">{selectedOrder.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="py-2">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">
                  Status Timeline
                </h4>
                <div className="space-y-2">
                  {(['New', 'Accepted', 'Preparing', 'Ready', 'Completed'] as OrderStatus[]).map((st, i) => {
                    const statuses = ['New', 'Accepted', 'Preparing', 'Ready', 'Completed'];
                    const currentIdx = statuses.indexOf(selectedOrder.status);
                    const isDone = i <= currentIdx;
                    const isCurrent = selectedOrder.status === st;

                    return (
                      <div key={st} className="flex items-center gap-3 text-xs">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isDone
                              ? 'bg-[#FF6900] text-white shadow-xs'
                              : 'bg-slate-100 text-[#9CA3AF]'
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span className={`font-semibold ${isCurrent ? 'text-[#FF6900] font-bold' : isDone ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Itemized Order */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                  Items ({selectedOrder.items.reduce((s, it) => s + it.quantity, 0)})
                </h4>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#111827]">{it.quantity}× {it.name}</span>
                      <span className="font-black text-[#111827] tabular-nums">
                        {formatCurrency(it.price * it.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-semibold">
                      {formatCurrency(selectedOrder.subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>Delivery Fee</span>
                    <span className="tabular-nums font-semibold">
                      {formatCurrency(selectedOrder.deliveryFee, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#111827] pt-2 border-t border-slate-200">
                    <span>Total Due (COD)</span>
                    <span className="tabular-nums font-bold">
                      {formatCurrency(selectedOrder.total, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Transition Pills at bottom */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase block mb-2">
                Update Order Stage
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['New', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Rejected'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, st);
                      setSelectedOrder({ ...selectedOrder, status: st });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedOrder.status === st
                        ? 'bg-[#FF6900] text-white shadow-xs'
                        : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
