import React from 'react';

interface StatTileProps {
  label: string;
  value: string;
  badge?: string;
  isPositive?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  badge,
  isPositive = true,
  subtext,
  icon,
}) => {
  return (
    <div className="rounded-[20px] bg-[#F9FAFB] p-4 sm:p-5 flex flex-col justify-between transition-all hover:bg-[#F3F4F6]/80">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-[#9CA3AF] truncate">
          {label}
        </span>
        {icon && <div className="text-[#FF6900]">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xl sm:text-2xl font-black text-[#111827] tabular-nums tracking-tight">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-[#FFF1E6] text-[#FF6900]'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-[11px] text-[#9CA3AF] mt-1 truncate">
          {subtext}
        </span>
      )}
    </div>
  );
};
