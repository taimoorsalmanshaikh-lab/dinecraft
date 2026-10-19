import React, { useState, useEffect, useMemo } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  getRestaurantReviews,
  deleteRestaurantReview,
  RealReviewItem,
} from '../../services/restaurantService';
import { getAvatarColor, getInitial } from '../../lib/avatarUtils';
import {
  Star,
  Search,
  Trash2,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Award,
  Filter,
  UtensilsCrossed,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from '../../router/RouterContext';

export const ReviewsManager: React.FC = () => {
  const { activeRestaurant, menuItems, addToast } = useDineCraft();
  const { navigate } = useRouter();

  const [reviews, setReviews] = useState<RealReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReviews = async () => {
    if (!activeRestaurant.id) return;
    setIsLoading(true);
    try {
      const data = await getRestaurantReviews(activeRestaurant.id);
      setReviews(data);
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [activeRestaurant.id]);

  // Map of dish id to dish name for easy display
  const dishNameMap = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((m) => {
      map.set(m.id, m.name);
    });
    return map;
  }, [menuItems]);

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: 5.0,
        verifiedCount: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = Number((sum / total).toFixed(1));
    const verified = reviews.filter((r) => r.verifiedBuyer).length;

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      dist[star] = (dist[star] || 0) + 1;
    });

    return {
      total,
      average: avg,
      verifiedCount: verified,
      distribution: dist,
    };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Rating filter
      if (ratingFilter !== 'all' && Math.round(r.rating) !== parseInt(ratingFilter, 10)) {
        return false;
      }

      // Item filter
      if (itemFilter !== 'all') {
        if (itemFilter === 'store') {
          if (r.itemId) return false;
        } else if (r.itemId !== itemFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.customerName || '').toLowerCase().includes(q);
        const matchesEmail = (r.customerEmail || '').toLowerCase().includes(q);
        const matchesComment = (r.comment || '').toLowerCase().includes(q);
        const matchesDish = r.itemId ? (dishNameMap.get(r.itemId) || '').toLowerCase().includes(q) : false;
        return matchesName || matchesEmail || matchesComment || matchesDish;
      }

      return true;
    });
  }, [reviews, ratingFilter, itemFilter, searchQuery, dishNameMap]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteRestaurantReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      addToast({
        type: 'success',
        title: 'Review Removed',
        message: 'The review has been deleted from your store database.',
      });
      setDeleteConfirmId(null);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete review.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Customer Feedback & Dish Ratings</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Reviews ({reviews.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Monitor real ratings left by diners on specific menu items and overall store experience. Real-time feedback helps improve kitchen quality.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadReviews}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/${activeRestaurant.slug}/reviews`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6900] hover:bg-[#e05d00] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <span>Public Reviews Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Scorecard (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Rating */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{stats.average}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(stats.average)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviews</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Verified customer submissions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: 5-Star Dominance */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">5-Star Reviews</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-600">{stats.distribution[5]}</span>
              <span className="text-xs text-slate-400">
                ({stats.total > 0 ? Math.round((stats.distribution[5] / stats.total) * 100) : 100}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Top satisfaction level</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Verified Diners */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Buyers</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.verifiedCount}</p>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Purchased food on your store</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:border-[#FF6900] focus:bg-white focus:outline-hidden transition-all"
          />
        </div>

        {/* Rating Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Stars:
          </span>
          {(['all', '5', '4', '3', '2', '1'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRatingFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'All Ratings' : `${r} ★`}
            </button>
          ))}
        </div>

        {/* Dish Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
            Dish:
          </label>
          <select
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#FF6900] cursor-pointer"
          >
            <option value="all">All Dishes & Store Reviews</option>
            <option value="store">Store Experience Only</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Review List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80">
          <div className="w-10 h-10 border-3 border-[#FF6900] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600">Loading customer reviews from database...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80 space-y-3">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#FF6900] flex items-center justify-center mx-auto">
            <Star className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Reviews Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || ratingFilter !== 'all' || itemFilter !== 'all'
              ? 'No reviews match your search or filter criteria. Try resetting the filters.'
              : 'When customers place orders and leave star reviews on your dishes or website, they will appear here in real-time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const initial = getInitial(rev.customerName);
            const avatarColor = getAvatarColor(rev.customerName);
            const dishName = rev.itemId ? dishNameMap.get(rev.itemId) : null;

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                {/* Left: Customer Info & Review Body */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Dynamic Avatar with Initial */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0"
                    style={{ backgroundColor: avatarColor.bg }}
                  >
                    {initial}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{rev.customerName}</h4>
                      {rev.customerEmail && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({rev.customerEmail})
                        </span>
                      )}
                      {rev.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Diner</span>
                        </span>
                      )}
                      {dishName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10px] font-bold">
                          <UtensilsCrossed className="w-3 h-3 text-[#FF6900]" />
                          <span>Dish: {dishName}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          <span>Overall Store Experience</span>
                        </span>
                      )}
                    </div>

                    {/* Star Rating & Date */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{rev.rating}.0</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-slate-700 leading-relaxed pt-1 whitespace-pre-wrap">
                      "{rev.comment}"
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(rev.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete review"
                    aria-label="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Review?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This review will be permanently deleted from your restaurant database.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
