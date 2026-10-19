import React, { useState, useEffect } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { getRestaurantCustomers, RestaurantCustomerSummary } from '../../services/restaurantService';
import { Order } from '../../types';
import { getAvatarColor, getInitial } from '../../lib/avatarUtils';
import {
  Users,
  Search,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  UserCheck,
  MapPin,
} from 'lucide-react';

export const CustomersManager: React.FC = () => {
  const { activeRestaurant } = useDineCraft();
  const [customers, setCustomers] = useState<RestaurantCustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with_orders' | 'registered_only'>('all');

  // Customer inspection drawer / modal
  const [selectedCustomer, setSelectedCustomer] = useState<RestaurantCustomerSummary | null>(null);

  const fetchCustomers = async () => {
    if (!activeRestaurant?.id) return;
    setIsLoading(true);
    try {
      const data = await getRestaurantCustomers(activeRestaurant.id);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [activeRestaurant?.id]);

  // Derived statistics
  const totalCustomers = customers.length;
  const activeOrderingCustomers = customers.filter((c) => c.totalOrders > 0).length;
  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOrdersPlaced = customers.reduce((acc, c) => acc + c.totalOrders, 0);
  const avgOrderValue = totalOrdersPlaced > 0 ? totalRevenue / totalOrdersPlaced : 0;

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterType === 'with_orders') return c.totalOrders > 0;
    if (filterType === 'registered_only') return c.totalOrders === 0;
    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Bento Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/5 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Customers
            </p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1 tabular-nums">
              {totalCustomers}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>{activeOrderingCustomers} ordered</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1E6] text-[#FF6900] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/5 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Customer Orders
            </p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1 tabular-nums">
              {totalOrdersPlaced}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Across all items
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/5 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Customer Revenue
            </p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1 tabular-nums">
              ${totalRevenue.toFixed(2)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Gross sales
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-black/5 shadow-[0_1px_3px_rgba(16,24,40,0.04)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Avg Order Value
            </p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1 tabular-nums">
              ${avgOrderValue.toFixed(2)}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Per ticket
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Customers Table Bento Card */}
      <div className="rounded-[28px] bg-white border border-black/5 p-5 sm:p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)] space-y-4">
        {/* Search & Filter Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, email, or phone..."
              className="w-full h-10 pl-9 pr-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/5 focus:border-[#FF6900] focus:ring-2 focus:ring-[#FF6900]/20 focus:outline-hidden text-[#111827] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F9FAFB] rounded-xl self-start sm:self-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'all' ? 'bg-white text-[#111827] shadow-xs' : 'text-slate-500 hover:text-black'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('with_orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'with_orders' ? 'bg-white text-[#111827] shadow-xs' : 'text-slate-500 hover:text-black'
              }`}
            >
              Active ({activeOrderingCustomers})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('registered_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'registered_only' ? 'bg-white text-[#111827] shadow-xs' : 'text-slate-500 hover:text-black'
              }`}
            >
              New Signups ({customers.length - activeOrderingCustomers})
            </button>
          </div>
        </div>

        {/* Customer Listing */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#FF6900] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">No customers match your search</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery
                  ? 'Try adjusting your search terms.'
                  : 'Customers who create an account or order from your storefront will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Total Orders</th>
                  <th className="py-3 px-3">Total Spent</th>
                  <th className="py-3 px-3">Last Active</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs border border-white ${
                            getAvatarColor(c.name).className
                          }`}
                        >
                          {getInitial(c.name)}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827] group-hover:text-[#FF6900] transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ID: {c.id.substring(0, 10)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <p className="text-slate-600 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.email}</span>
                        </p>
                        {c.phone && (
                          <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.phone}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#111827] tabular-nums">
                        {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-[#111827] tabular-nums">
                        ${c.totalSpent.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {c.lastOrderDate ? (
                        <span>{new Date(c.lastOrderDate).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-slate-400">Registered</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#FF6900] hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <span>History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS & ORDER HISTORY MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-[28px] bg-white border border-black/10 p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F3F4F6] text-slate-500 hover:text-black flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Customer Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-black/5">
              <div
                className={`w-14 h-14 rounded-2xl font-black text-xl flex items-center justify-center shrink-0 uppercase shadow-xs border-2 border-white ${
                  getAvatarColor(selectedCustomer.name).className
                }`}
              >
                {getInitial(selectedCustomer.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCustomer.email}</p>
                {selectedCustomer.phone && (
                  <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                )}
                {selectedCustomer.address && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedCustomer.address}</span>
                  </p>
                )}
              </div>
            </div>


            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                <p className="text-lg font-extrabold text-[#111827] mt-0.5 tabular-nums">
                  {selectedCustomer.totalOrders}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Lifetime Spend</span>
                <p className="text-lg font-extrabold text-[#FF6900] mt-0.5 tabular-nums">
                  ${selectedCustomer.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Order History ({selectedCustomer.orders.length})
              </h4>

              {selectedCustomer.orders.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#F9FAFB] text-center text-xs text-slate-500">
                  Customer has registered but has not placed an order yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-black/5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#111827]">Order #{order.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#FFF1E6] text-[#FF6900]'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{order.createdAt}</span>
                        <span className="font-mono font-bold text-[#111827]">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
