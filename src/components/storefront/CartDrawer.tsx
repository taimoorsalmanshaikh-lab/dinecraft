import React from 'react';
import { Restaurant } from '../../types';
import { StorefrontCart } from './StorefrontCart';
import { X, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ restaurant, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-over Drawer with Bento Rounded Left Edge */}
      <div className="relative w-full max-w-lg bg-[var(--sf-surface,#F3F4F6)] h-full shadow-2xl flex flex-col rounded-l-[28px] sm:rounded-l-[32px] overflow-hidden z-10 animate-slideInRight">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2
                className="font-bold text-sm sm:text-base text-[var(--text)] leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Your Dining Bag
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                {restaurant.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-black/10 text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <StorefrontCart restaurant={restaurant} />
        </div>
      </div>
    </div>
  );
};
