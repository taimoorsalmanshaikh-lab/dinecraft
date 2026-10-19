import React from 'react';
import { getAvatarColor, getInitial } from '../../../lib/avatarUtils';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-xs font-semibold text-[#9CA3AF]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-transparent">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`pb-3 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] ${
                  col.className || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="space-y-1">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`h-16 group transition-all duration-150 rounded-2xl ${
                onRowClick ? 'cursor-pointer hover:bg-[#F3F4F6]' : 'hover:bg-[#F9FAFB]'
              }`}
            >
              {columns.map((col, idx) => (
                <td
                  key={col.key}
                  className={`py-3 px-3 text-xs text-[#111827] font-semibold ${
                    idx === 0 ? 'rounded-l-2xl' : ''
                  } ${idx === columns.length - 1 ? 'rounded-r-2xl' : ''} ${
                    col.className || ''
                  }`}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AvatarStackProps {
  avatars: Array<{ name: string; image?: string; color?: string }>;
  extraCount?: number;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  avatars,
  extraCount = 2,
}) => {
  return (
    <div className="flex items-center -space-x-2">
      {avatars.map((av, i) => {
        const colorClass = getAvatarColor(av.name).className;
        return (
          <div
            key={i}
            className={`w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-[11px] font-bold shadow-xs shrink-0 uppercase select-none ${
              av.image ? 'bg-slate-100' : colorClass
            }`}
            title={av.name}
          >
            {av.image ? (
              <img
                src={av.image}
                alt={av.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{getInitial(av.name)}</span>
            )}
          </div>
        );
      })}

      {extraCount > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FF6900] text-white flex items-center justify-center text-[10px] font-bold shadow-xs shrink-0">
          +{extraCount}
        </div>
      )}
    </div>
  );
};
