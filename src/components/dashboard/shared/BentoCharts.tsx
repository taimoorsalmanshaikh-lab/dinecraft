import React, { useState } from 'react';

interface BarDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
  tooltip?: string;
}

interface BentoBarChartProps {
  data: BarDataPoint[];
  height?: number;
}

export const BentoBarChart: React.FC<BentoBarChartProps> = ({
  data,
  height = 180,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const chartHeight = height - 36;
  const barWidth = 24;

  return (
    <div className="w-full select-none">
      <svg
        viewBox={`0 0 ${data.length * 52} ${height}`}
        className="w-full overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          {/* Diagonal hatch pattern in --brand-hatch (#FFD2A8) */}
          <pattern
            id="brandHatch"
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="#FFD2A8"
              strokeWidth="2.5"
            />
          </pattern>
        </defs>

        {/* Dashed horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((pct, i) => (
          <line
            key={i}
            x1="0"
            y1={chartHeight * pct}
            x2={data.length * 52}
            y2={chartHeight * pct}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}

        {data.map((item, idx) => {
          const barH = (item.value / maxValue) * (chartHeight - 32);
          const x = idx * 52 + 14;
          const y = chartHeight - barH;
          const isHighest = item.highlight || item.value === maxValue;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Background pill track */}
              <rect
                x={x}
                y={8}
                width={barWidth}
                height={chartHeight - 8}
                rx={barWidth / 2}
                fill="#F3F4F6"
              />

              {/* Data bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, barWidth)}
                rx={barWidth / 2}
                fill={isHighest || isHovered ? '#C2410C' : 'url(#brandHatch)'}
                className="transition-all duration-200"
              />

              {/* Floating tooltip bubble above active/highest bar */}
              {(isHighest || isHovered) && (
                <g className="animate-in fade-in zoom-in-95 duration-150">
                  <rect
                    x={x + barWidth / 2 - 28}
                    y={y - 28}
                    width="56"
                    height="20"
                    rx="10"
                    fill="#111827"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 14}
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {item.tooltip || `+${Math.round((item.value / maxValue) * 20)}%`}
                  </text>
                </g>
              )}

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={height - 8}
                fill="#9CA3AF"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export interface AreaDataPoint {
  label: string;
  value: number;
  ordersCount?: number;
  fullDate?: string;
}

interface BentoAreaChartProps {
  data: AreaDataPoint[];
  height?: number;
  currencyPrefix?: string;
}

export const BentoAreaChart: React.FC<BentoAreaChartProps> = ({
  data,
  height = 180,
  currencyPrefix = '$',
}) => {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  // Real data for revenue or orders without fake factor multipliers
  const processedData = data.map((d) => ({
    ...d,
    val: metric === 'revenue' ? Number(d.value || 0) : Number(d.ordersCount !== undefined ? d.ordersCount : 0),
  }));

  const maxVal = Math.max(...processedData.map((d) => d.val), metric === 'revenue' ? 50 : 5);
  const chartHeight = height - 40;

  const totalRevenue = data.reduce((acc, d) => acc + (d.value || 0), 0);
  const totalOrders = data.reduce(
    (acc, d) => acc + (d.ordersCount !== undefined ? d.ordersCount : 0),
    0
  );

  // Build SVG path
  const points = processedData.map((d, idx) => {
    const divisor = processedData.length > 1 ? processedData.length - 1 : 1;
    const x = (idx / divisor) * 340;
    const y = maxVal > 0 ? chartHeight - (d.val / maxVal) * (chartHeight - 30) : chartHeight - 10;
    return { x, y: isNaN(y) ? chartHeight - 10 : y, original: d };
  });

  // Smooth bezier curve
  let curveD = points.length > 0 ? `M ${points[0].x} ${points[0].y}` : `M 0 ${chartHeight}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    curveD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  const lastPoint = points.length > 0 ? points[points.length - 1] : { x: 340, y: chartHeight };
  const firstPoint = points.length > 0 ? points[0] : { x: 0, y: chartHeight };
  const fillD = `${curveD} L ${lastPoint.x} ${chartHeight} L ${firstPoint.x} ${chartHeight} Z`;

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Header Row: Total value on left, pill toggle on right */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-2xl sm:text-3xl font-black text-[#111827] tabular-nums">
            {metric === 'revenue'
              ? `${currencyPrefix}${totalRevenue.toFixed(2)}`
              : `${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'}`}
          </span>
          <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">
            {metric === 'revenue' ? 'Past 7 days gross revenue' : 'Past 7 days completed orders'}
          </p>
        </div>

        {/* Real toggle between Revenue & Orders */}
        <div className="bg-[#F3F4F6] p-1 rounded-full inline-flex items-center gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-[#FF6900] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Revenue
          </button>
          <button
            type="button"
            onClick={() => setMetric('orders')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              metric === 'orders'
                ? 'bg-[#FF6900] text-white shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* SVG Area Chart */}
      <div className="w-full">
        <svg
          viewBox={`0 0 340 ${height - 30}`}
          className="w-full overflow-visible"
          style={{ maxHeight: height - 30 }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6900" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF6900" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill */}
          <path d={fillD} fill="url(#areaGradient)" />

          {/* Stroke curve */}
          <path
            d={curveD}
            fill="none"
            stroke="#FF6900"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data point dots on hover/ends */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === points.length - 1 ? 4.5 : 3}
              fill={idx === points.length - 1 ? '#FF6900' : '#FFFFFF'}
              stroke="#FF6900"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* X labels */}
        <div className="flex justify-between text-[11px] font-semibold text-[#9CA3AF] mt-1 pt-1 border-t border-slate-100">
          <span>{data[0]?.label}</span>
          <span>{data[Math.floor(data.length / 2)]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
};
