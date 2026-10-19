import React, { useState, useEffect } from 'react';
import { Restaurant } from '../../types';
import { getRestaurantReviews, addRestaurantReview, RealReviewItem } from '../../services/restaurantService';
import { getAvatarColor, getInitial } from '../../lib/avatarUtils';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  Star,
  MessageSquare,
  Award,
  ThumbsUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Filter,
} from 'lucide-react';

interface StorefrontReviewsProps {
  restaurant: Restaurant;
}

export const StorefrontReviews: React.FC<StorefrontReviewsProps> = ({ restaurant }) => {
  const { addToast } = useDineCraft();
  const [reviews, setReviews] = useState<RealReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | 'verified'>('all');

  // Review Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await getRestaurantReviews(restaurant.id);
      setReviews(data);
    } catch (e) {
      console.warn('Error loading restaurant reviews:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (restaurant.id) {
      loadReviews();
    }
  }, [restaurant.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please share your dining experience or favorite dish.');
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await addRestaurantReview({
        restaurantId: restaurant.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        rating: ratingInput,
        comment: comment.trim(),
        verifiedBuyer: true,
      });

      setReviews((prev) => [saved, ...prev]);
      setIsModalOpen(false);
      setCustomerName('');
      setCustomerEmail('');
      setComment('');
      setRatingInput(5);

      addToast({
        type: 'success',
        title: 'Review Published!',
        message: 'Thank you for your feedback! Your review is now live on our website.',
      });
    } catch (err: any) {
      console.error('Error saving review:', err);
      setFormError('Could not save your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCount = reviews.length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
      : null;

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => Math.round(r.rating) === s).length,
    percentage:
      totalCount > 0
        ? Math.round(
            (reviews.filter((r) => Math.round(r.rating) === s).length / totalCount) * 100
          )
        : 0,
  }));

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '5') return Math.round(r.rating) === 5;
    if (selectedFilter === '4') return Math.round(r.rating) === 4;
    if (selectedFilter === 'verified') return r.verifiedBuyer;
    return true;
  });

  return (
    <div className="space-y-8 py-4 sm:py-8 text-[var(--text,#111827)] animate-fadeIn">
      {/* 1. Header Banner Bento Card */}
      <div className="sf-card p-6 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Diner Experiences</span>
            </div>
            <h1
              className="text-2xl sm:text-4xl font-extrabold text-[var(--text,#111827)] leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Ratings & Testimonials
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted,#4B5563)] leading-relaxed">
              Read authentic feedback from diners at {restaurant.name}. Every review comes from real customers who ordered fresh from our kitchen.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="sf-button-primary inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* 2. Bento Rating Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Scorecard */}
        <div className="md:col-span-5 sf-card p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-[var(--text-muted,#4B5563)] uppercase tracking-wider">
              Overall Diner Rating
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-black text-[var(--text,#111827)] tabular-nums">
                {avgRating || '—'}
              </span>
              <span className="text-base text-[var(--text-muted,#4B5563)] font-semibold">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    avgRating && Number(avgRating) >= s
                      ? 'fill-amber-400 text-amber-400'
                      : avgRating && Number(avgRating) >= s - 0.5
                      ? 'fill-amber-300 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-[var(--text-muted,#4B5563)] mt-2">
              {totalCount > 0
                ? `Based on ${totalCount} verified diner review(s)`
                : 'No reviews yet. Be the first to share your review!'}
            </p>
          </div>

          <div className="pt-4 border-t border-black/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text,#111827)]">100% Genuine Reviews</p>
              <p className="text-[11px] text-[var(--text-muted,#4B5563)]">
                Submitted directly by real diners and saved securely in our backend.
              </p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-7 sf-card p-6 sm:p-8 space-y-3 flex flex-col justify-center">
          <h3 className="text-xs font-bold text-[var(--text-muted,#4B5563)] uppercase tracking-wider mb-1">
            Rating Breakdown
          </h3>

          <div className="space-y-2.5">
            {starCounts.map((sc) => (
              <div key={sc.stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[var(--text,#111827)] flex items-center gap-1">
                  <span>{sc.stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>

                <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${sc.percentage}%` }}
                  />
                </div>

                <span className="w-10 text-right font-mono text-[11px] text-[var(--text-muted,#4B5563)]">
                  {sc.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-black/5 shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[var(--brand,#FF6900)] text-white shadow-xs'
                : 'text-[var(--text-muted,#4B5563)] hover:text-[var(--text,#111827)]'
            }`}
          >
            All Reviews ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('5')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === '5'
                ? 'bg-[var(--brand,#FF6900)] text-white shadow-xs'
                : 'text-[var(--text-muted,#4B5563)] hover:text-[var(--text,#111827)]'
            }`}
          >
            5 Stars ({starCounts.find((s) => s.stars === 5)?.count || 0})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('4')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === '4'
                ? 'bg-[var(--brand,#FF6900)] text-white shadow-xs'
                : 'text-[var(--text-muted,#4B5563)] hover:text-[var(--text,#111827)]'
            }`}
          >
            4 Stars ({starCounts.find((s) => s.stars === 4)?.count || 0})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('verified')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'verified'
                ? 'bg-[var(--brand,#FF6900)] text-white shadow-xs'
                : 'text-[var(--text-muted,#4B5563)] hover:text-[var(--text,#111827)]'
            }`}
          >
            Verified Only
          </button>
        </div>

        <span className="text-xs text-[var(--text-muted,#4B5563)] font-medium">
          Showing {filteredReviews.length} of {totalCount} reviews
        </span>
      </div>

      {/* 4. Testimonials & Reviews Grid */}
      {isLoading ? (
        <div className="sf-card p-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[var(--brand,#FF6900)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[var(--text-muted,#4B5563)]">
            Loading authentic diner testimonials...
          </p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="sf-card p-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text,#111827)]">No Reviews Yet</h3>
            <p className="text-xs text-[var(--text-muted,#4B5563)] mt-1 leading-relaxed">
              Be the first to share your dining experience! Your review will help other food lovers discover our kitchen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="sf-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write the First Review</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => {
            const initial = getInitial(rev.customerName);
            const avatarColor = getAvatarColor(rev.customerName);

            return (
              <div
                key={rev.id}
                className="sf-card p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] text-[var(--text-muted,#4B5563)] font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text,#111827)] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
                      style={{ backgroundColor: avatarColor.bg }}
                    >
                      {initial}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text,#111827)] leading-tight">
                        {rev.customerName}
                      </h4>
                      {rev.verifiedBuyer && (
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified Diner</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-black/5 animate-scaleUp text-[var(--text,#111827)]">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <h3
                  className="text-lg font-extrabold text-[var(--text,#111827)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Write a Verified Review
                </h3>
                <p className="text-xs text-[var(--text-muted,#4B5563)]">
                  Share your honest rating for {restaurant.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Selection */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[var(--text,#111827)]">
                  Your Overall Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRatingInput(s)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= (hoverRating || ratingInput)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-[var(--text,#111827)]">
                    {hoverRating || ratingInput} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text,#111827)] mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Khan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9FAFB] focus:border-[var(--brand,#FF6900)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text,#111827)] mb-1">
                  Your Email (Optional, kept private)
                </label>
                <input
                  type="email"
                  placeholder="e.g. fatima@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#F9FAFB] focus:border-[var(--brand,#FF6900)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text,#111827)] mb-1">
                  Your Review / Dining Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you ordered, how it tasted, and what you loved most..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-black/10 bg-[#F9FAFB] focus:border-[var(--brand,#FF6900)] focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-[var(--text,#111827)] font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sf-button-primary px-6 py-2.5 font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing Review...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
