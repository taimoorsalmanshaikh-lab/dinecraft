import React from 'react';

interface SegmentedToggleProps<T extends string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={`bg-[#F3F4F6] p-1 rounded-full inline-flex items-center gap-1 text-xs font-semibold ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#FF6900] text-white shadow-xs font-bold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}) => {
  let baseStyle =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed';

  if (variant === 'primary') {
    baseStyle += ' bg-[#FF6900] hover:bg-[#E65F00] text-white shadow-xs';
  } else if (variant === 'secondary') {
    baseStyle +=
      ' bg-white hover:bg-slate-50 text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_12px_rgba(16,24,40,0.04)]';
  } else if (variant === 'soft') {
    baseStyle += ' bg-[#FFF1E6] hover:bg-[#FFD2A8]/50 text-[#C2410C] font-bold';
  } else {
    baseStyle += ' bg-transparent hover:bg-[#F3F4F6] text-[#4B5563]';
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  active?: boolean;
  tooltip?: string;
  badge?: number | string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  active = false,
  tooltip,
  badge,
  className = '',
  ...props
}) => {
  return (
    <div className="relative group inline-flex">
      <button
        type="button"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
          active
            ? 'bg-[#FF6900] text-white shadow-sm'
            : 'bg-white hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
        } ${className}`}
        {...props}
      >
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6900] text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white">
            {badge}
          </span>
        )}
      </button>

      {tooltip && (
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111827] text-white text-[10px] font-semibold py-1 px-2 rounded-md whitespace-nowrap z-50 shadow-md">
          {tooltip}
        </span>
      )}
    </div>
  );
};
