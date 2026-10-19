import React from 'react';
import { Restaurant } from '../../types';
import { RESTAURANT_INTERIOR_IMAGE } from '../../data/mockData';
import { Heart, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

interface StorefrontAboutProps {
  restaurant: Restaurant;
  isPreviewMode?: boolean;
}

export const StorefrontAbout: React.FC<StorefrontAboutProps> = ({ restaurant }) => {
  const address = restaurant.address || restaurant.contact?.address || '100 Main Street';
  const city = restaurant.city || restaurant.contact?.city || 'Downtown';
  const openingHours = restaurant.openingHours || restaurant.contact?.openingHours || 'Daily: 11:00 AM – 10:00 PM';

  return (
    <div className="space-y-8 sm:space-y-12 py-4 sm:py-6 text-[var(--text)]">
      {/* Intro Hero Bento Card */}
      <div className="sf-card p-6 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Heritage & Passion</span>
        </div>
        <h1
          className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)] leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          About {restaurant.name}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          {restaurant.description || 'Authentic flavors, honest ingredients, and a warm neighborhood welcome.'}
        </p>
      </div>

      {/* Story & Image Bento Split Card */}
      <div className="sf-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h2
              className="text-xl sm:text-3xl font-extrabold text-[var(--text)] leading-snug tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Every Plate Reflects Our Passion for Pure Flavor and Craftsmanship
            </h2>
            <div className="text-xs sm:text-sm text-[var(--text-muted)] space-y-3 leading-relaxed">
              <p>
                {restaurant.aboutText ||
                  `${restaurant.name} was established on a simple premise: serving unforgettable food made with honest, uncompromised ingredients. From our kitchen to your table, each dish is made to order.`}
              </p>
              <p>
                We partner with local suppliers to bring in fresh produce every morning. Our kitchen combines time-honored preparation methods with modern standards of culinary safety, quality, and hospitality.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div className="sf-tile p-4 flex items-start gap-3 bg-[#F9FAFB]">
                <div className="w-9 h-9 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)]">Crafted Fresh</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-tight">
                    Cooked immediately upon receipt of order.
                  </p>
                </div>
              </div>

              <div className="sf-tile p-4 flex items-start gap-3 bg-[#F9FAFB]">
                <div className="w-9 h-9 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)]">Hygiene First</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-tight">
                    Strict kitchen sanitization and temperature control.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-[var(--sf-radius-tile,20px)] overflow-hidden shadow-sm bg-[#F3F4F6]">
              <img
                src={RESTAURANT_INTERIOR_IMAGE}
                alt="Restaurant Dining Atmosphere"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location / Schedule Bento Card */}
      <div className="sf-card p-6 sm:p-10 max-w-4xl mx-auto space-y-6 text-center">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--brand)' }}
          >
            Visit Our Kitchen
          </span>
          <h3
            className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Location & Hours of Operation
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
          <div className="sf-tile p-4 flex items-start gap-3 bg-[#F9FAFB]">
            <MapPin className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[var(--text)]">Dining Address</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{address}, {city}</p>
            </div>
          </div>

          <div className="sf-tile p-4 flex items-start gap-3 bg-[#F9FAFB]">
            <Clock className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[var(--text)]">Service Hours</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{openingHours}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
