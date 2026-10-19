import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

interface HeroStatCardProps {
  label: string;
  value: string;
  badgeText?: string;
  metaText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const HeroStatCard: React.FC<HeroStatCardProps> = ({
  label,
  value,
  badgeText = '+18.4% today',
  metaText = 'vs. $380.00 yesterday',
  onActionClick,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[28px] p-6 bg-gradient-to-br from-[#FF6900] via-[#FF6900] to-[#E65F00] text-white shadow-[0_8px_24px_rgba(255,105,0,0.24)] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 min-h-[190px] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {label}
          </span>
          <div className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight tabular-nums text-white">
            {value}
          </div>
        </div>

        {onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="View stat details"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="pt-4 mt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-white/90">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white font-bold text-[11px]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>
        <span className="text-white/70 text-[11px] truncate">{metaText}</span>
      </div>
    </div>
  );
};
