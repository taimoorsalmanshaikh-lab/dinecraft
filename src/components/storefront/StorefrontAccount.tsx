import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant, Order, OrderStatus } from '../../types';
import { StorefrontCheckoutAuth } from './StorefrontCheckoutAuth';
import { formatCurrency } from '../../lib/currency';
import {
  User,
  ShoppingBag,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChefHat,
  Bike,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  X,
} from 'lucide-react';

interface StorefrontAccountProps {
  restaurant: Restaurant;
  initialTab?: 'orders' | 'profile';
}

export const StorefrontAccount: React.FC<StorefrontAccountProps> = ({
  restaurant,
  initialTab = 'orders',
}) => {
  const { navigate } = useRouter();
  const {
    currentUser,
    userProfile,
    customerOrders,
    updateUserProfile,
    deleteUserAccount,
    logout,
    isAuthLoading,
  } = useDineCraft();
  const currency = restaurant.currency || restaurant.ordering?.currency || 'USD';

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>(initialTab);

  // Profile Edit State
  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [addressLine, setAddressLine] = useState(userProfile?.addresses?.[0]?.line1 || '');
  const [isSaving, setIsSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Detailed order inspection modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync profile state when userProfile loads
  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.addresses?.[0]?.line1) setAddressLine(userProfile.addresses[0].line1);
    }
  }, [userProfile]);

  // If auth is still checking
  if (isAuthLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-[var(--text,#111827)]">
        <div className="w-10 h-10 border-3 border-[var(--brand,#FF6900)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[var(--text-muted,#6B7280)]">Loading account profile...</p>
      </div>
    );
  }

  // If user is not authenticated, show inline auth form
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12 space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/${restaurant.slug}`)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted,#6B7280)] hover:text-[var(--text,#111827)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {restaurant.name}</span>
        </button>

        <StorefrontCheckoutAuth
          restaurant={restaurant}
          onSuccess={() => {
            // Re-renders with authenticated user
          }}
        />
      </div>
    );
  }

  // Filter orders for this restaurant or all customer orders
  const relevantOrders = customerOrders.filter(
    (o) => !o.restaurantId || o.restaurantId === restaurant.id || o.restaurantSlug === restaurant.slug
  );
  const displayOrders = relevantOrders.length > 0 ? relevantOrders : customerOrders;

  const activeOrders = displayOrders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Cancelled' && o.status !== 'Rejected'
  );
  const pastOrders = displayOrders.filter(
    (o) => o.status === 'Completed' || o.status === 'Cancelled' || o.status === 'Rejected'
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const addresses = addressLine.trim()
        ? [{ label: 'Primary Delivery', line1: addressLine.trim(), city: restaurant.city || '' }]
        : [];

      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        addresses,
      });

      setProfileSuccessMsg('Profile updated successfully.');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setProfileErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUserAccount();
      setDeleteModalOpen(false);
      navigate(`/${restaurant.slug}`);
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setDeleteError(err.message || 'Unable to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const stepsList: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
    { status: 'New', label: 'Order Transmitted', desc: 'Received by kitchen register', icon: Clock },
    { status: 'Accepted', label: 'Accepted by Kitchen', desc: 'Approved and station assigned', icon: Check },
    { status: 'Preparing', label: 'Preparing Fresh', desc: 'Kitchen is cooking your meal', icon: ChefHat },
    { status: 'Ready', label: 'Ready / Dispatched', desc: 'Packed fresh for handover', icon: Bike },
    { status: 'Completed', label: 'Fulfilled', desc: 'Delivered or collected', icon: CheckCircle2 },
  ];

  const statusHierarchy: Record<OrderStatus, number> = {
    New: 0,
    Accepted: 1,
    Preparing: 2,
    Ready: 3,
    Completed: 4,
    Rejected: -1,
    Cancelled: -1,
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 text-[var(--text,#111827)]">
      {/* Top Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/${restaurant.slug}`)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted,#6B7280)] hover:text-[var(--text,#111827)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {restaurant.name}</span>
        </button>
      </div>

      {/* Profile Header Bento Card */}
      <div className="sf-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--brand,#FF6900)] text-white font-bold text-xl flex items-center justify-center shadow-2xs">
              {(userProfile?.name || currentUser.displayName || currentUser.email || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl sm:text-2xl font-bold text-[var(--text,#111827)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {userProfile?.name || currentUser.displayName || 'Customer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] text-[10px] font-bold uppercase tracking-wider">
                  Customer
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted,#6B7280)] mt-0.5 flex items-center gap-2">
                <span>{currentUser.email}</span>
                {userProfile?.phone && (
                  <>
                    <span>·</span>
                    <span>{userProfile.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate(`/${restaurant.slug}`);
              }}
              className="sf-button-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-black/5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[var(--brand,#FF6900)] text-white shadow-2xs'
                : 'bg-[#F9FAFB] text-[var(--text-muted,#6B7280)] hover:text-[var(--text,#111827)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>My Orders ({displayOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[var(--brand,#FF6900)] text-white shadow-2xs'
                : 'bg-[#F9FAFB] text-[var(--text-muted,#6B7280)] hover:text-[var(--text,#111827)]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Delivery Details</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MY ORDERS & REAL-TIME TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {displayOrders.length === 0 ? (
            <div className="sf-card p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] text-[var(--text-muted,#6B7280)] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text,#111827)]">No Orders Found Yet</h3>
                <p className="text-xs text-[var(--text-muted,#6B7280)] mt-1 max-w-sm mx-auto">
                  You haven’t placed any orders with this account yet. Browse our menu to try our delicious items!
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/${restaurant.slug}/menu`)}
                  className="sf-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold cursor-pointer"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Orders Section */}
              {activeOrders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text,#111827)]">
                      Active Live Orders ({activeOrders.length})
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {activeOrders.map((order) => (
                      <div
                        key={order.id}
                        className="sf-card p-5 sm:p-6 space-y-4 border border-[var(--brand,#FF6900)]/30 shadow-2xs hover:border-[var(--brand,#FF6900)] transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[var(--text,#111827)] font-mono">
                                Order #{order.id}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] text-[10px] font-bold uppercase">
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted,#6B7280)] mt-0.5 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{order.createdAt}</span>
                              <span>·</span>
                              <span className="capitalize">{order.fulfilmentType}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold text-[var(--text,#111827)]">
                              {formatCurrency(order.total, currency)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="sf-button-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
                            >
                              <span>Track Live</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Order items preview */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {order.items.map((item, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-[#F9FAFB] text-[var(--text,#111827)] text-[11px] font-medium"
                            >
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past / Completed Orders Section */}
              {pastOrders.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted,#6B7280)] px-1">
                    Previous Orders ({pastOrders.length})
                  </h2>

                  <div className="space-y-3">
                    {pastOrders.map((order) => (
                      <div key={order.id} className="sf-card p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--text,#111827)] font-mono">
                                Order #{order.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  order.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted,#6B7280)] mt-0.5">
                              {order.createdAt} · {order.fulfilmentType}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-[var(--text,#111827)]">
                              {formatCurrency(order.total, currency)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="sf-button-secondary text-xs font-semibold px-3 py-1.5 cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {order.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#F9FAFB] text-[11px] text-[var(--text-muted,#6B7280)]"
                            >
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & DELIVERY DETAILS */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="sf-card p-6 sm:p-8 space-y-6">
            <div>
              <h2
                className="text-lg font-bold text-[var(--text,#111827)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Profile & Saved Delivery Address
              </h2>
              <p className="text-xs text-[var(--text-muted,#6B7280)] mt-0.5">
                Update your contact details for faster checkout on future orders.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden text-[var(--text,#111827)] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email || ''}
                  className="w-full h-11 px-4 text-xs bg-slate-100/70 rounded-xl border border-black/5 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-[var(--text-muted,#6B7280)]">
                  Primary authentication email cannot be changed directly.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-11 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden text-[var(--text,#111827)] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Saved Delivery Address</span>
                </label>
                <textarea
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Street, Building, Apartment / Suite"
                  className="w-full p-3 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden text-[var(--text,#111827)] transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="sf-button-primary px-6 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone Bento Card: Delete Account */}
          <div className="sf-card p-6 sm:p-8 border border-rose-200/80 bg-rose-50/20 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-900">Danger Zone: Delete Customer Account</h3>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Permanently delete your profile and personal details. Past financial and tax records for completed
                  orders will be anonymized in compliance with regulations.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LIVE ORDER TRACKING & DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="sf-card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 relative shadow-xl">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F3F4F6] text-slate-500 hover:text-black flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[var(--brand,#FF6900)] uppercase tracking-wider">
                Live Order Tracking
              </span>
              <h2
                className="text-xl font-extrabold text-[var(--text,#111827)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Order #{selectedOrder.id}
              </h2>
              <p className="text-xs text-[var(--text-muted,#6B7280)] mt-0.5">
                Placed {selectedOrder.createdAt} · {selectedOrder.fulfilmentType}
              </p>
            </div>

            {/* Visual Lifecycle Stepper */}
            <div className="space-y-4 py-2 border-y border-black/5">
              <div className="relative pl-6 border-l-2 border-black/10 space-y-6 ml-2">
                {stepsList.map((st) => {
                  const stepLevel = statusHierarchy[st.status];
                  const currentLevel = statusHierarchy[selectedOrder.status] ?? 0;
                  const isPassed = currentLevel >= stepLevel;
                  const isCurrent = currentLevel === stepLevel;
                  const Icon = st.icon;

                  return (
                    <div key={st.status} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                          isPassed
                            ? 'bg-[var(--brand,#FF6900)] text-white shadow-2xs'
                            : 'bg-white border-2 border-black/15 text-slate-400'
                        }`}
                      >
                        {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              isCurrent ? 'text-[var(--brand,#FF6900)]' : isPassed ? 'text-slate-700' : 'text-slate-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-[var(--brand,#FF6900)] font-extrabold' : 'text-[var(--text,#111827)]'
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] text-[9px] font-bold uppercase">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted,#6B7280)]">
                Items Ordered
              </h4>
              <div className="divide-y divide-black/5 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <span className="text-[var(--text,#111827)] font-medium">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-[var(--text,#111827)]">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-black/5 space-y-1 text-xs">
              <div className="flex justify-between text-[var(--text-muted,#6B7280)]">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(selectedOrder.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted,#6B7280)]">
                <span>Delivery Fee</span>
                <span className="font-mono">{formatCurrency(selectedOrder.deliveryFee, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--text,#111827)] pt-1 border-t border-black/5">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(selectedOrder.total, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE ACCOUNT */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="sf-card p-6 sm:p-8 max-w-md w-full space-y-5 bg-white shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Delete Account Permanently?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete your customer account? Your personal profile, saved addresses, and
                credentials will be deleted immediately. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalOpen(false)}
                className="sf-button-secondary flex-1 py-2.5 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
