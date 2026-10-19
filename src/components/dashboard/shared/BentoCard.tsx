import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface BentoCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  onArrowClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  headerAction,
  onArrowClick,
  className = '',
  children,
}) => {
  return (
    <div
      className={`bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(16,24,40,0.04),0_12px_32px_rgba(16,24,40,0.08)] flex flex-col justify-between ${className}`}
    >
      {(title || subtitle || headerAction || onArrowClick) && (
        <div className="flex items-start justify-between gap-3 mb-5 shrink-0">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerAction}
            {onArrowClick && (
              <button
                type="button"
                onClick={onArrowClick}
                className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-[#FFF1E6] hover:text-[#FF6900] text-[#4B5563] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                aria-label="Open card action"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};
