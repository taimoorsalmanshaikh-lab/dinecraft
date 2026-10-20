import { Order } from '../types';

/**
 * Validates whether an order's status qualifies for revenue recognition.
 *
 * Eligible statuses:
 * - Accepted
 * - Cooking / Preparing
 * - Ready
 * - Completed / Confirmed
 *
 * Strictly excluded:
 * - Cancelled / Canceled
 * - Rejected
 */
export function isEligibleRevenueStatus(status?: string | null): boolean {
  if (!status || typeof status !== 'string') {
    return false;
  }
  const s = status.trim().toLowerCase();

  // Excluded statuses
  if (s === 'cancelled' || s === 'canceled' || s === 'rejected') {
    return false;
  }

  // Included statuses
  return (
    s === 'accepted' ||
    s === 'cooking' ||
    s === 'preparing' ||
    s === 'ready' ||
    s === 'completed' ||
    s === 'confirmed'
  );
}

export const isRevenueOrder = (order?: Order | null): boolean => {
  if (!order || typeof order.total !== 'number' || isNaN(order.total)) {
    return false;
  }
  return isEligibleRevenueStatus(order.status);
};

export interface DateRange {
  start?: Date | string | null;
  end?: Date | string | null;
}

/**
 * ONE CENTRALIZED REVENUE FUNCTION
 *
 * Calculates revenue using real order records and consistent status/date filtering.
 * All dashboard revenue cards, summaries, and performance charts must use this function.
 *
 * @param orders Array of actual Order records
 * @param dateRange Optional start and end boundaries
 * @returns Consistent numeric revenue value
 */
export function calculateRevenue(
  orders: Order[] = [],
  dateRange?: DateRange
): number {
  if (!Array.isArray(orders) || orders.length === 0) {
    return 0;
  }

  const seenIds = new Set<string>();
  let totalRevenue = 0;

  const startDate = dateRange?.start ? new Date(dateRange.start) : null;
  const endDate = dateRange?.end ? new Date(dateRange.end) : null;

  for (const order of orders) {
    if (!order || !order.id || seenIds.has(order.id)) {
      continue;
    }
    seenIds.add(order.id);

    if (!isEligibleRevenueStatus(order.status)) {
      continue;
    }

    if (startDate || endDate) {
      if (!order.createdAt) continue;
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) continue;

      if (startDate && orderDate < startDate) {
        continue;
      }
      if (endDate && orderDate > endDate) {
        continue;
      }
    }

    const orderAmount = typeof order.total === 'number' ? order.total : Number(order.total || 0);
    if (!isNaN(orderAmount) && orderAmount > 0) {
      totalRevenue += orderAmount;
    }
  }

  return Number(totalRevenue.toFixed(2));
}

export interface DayRevenuePoint {
  label: string; // 'Mon', 'Tue', etc.
  fullDate: string; // 'Oct 19'
  dateKey: string; // '2026-10-19'
  value: number; // rounded to 2 decimals
  ordersCount: number;
}

export interface MonthlyOrdersPoint {
  label: string; // 'May', 'Jun', 'Jul', etc.
  value: number; // orders count
  revenue: number;
  highlight?: boolean;
}

export interface RevenueMetrics {
  todaysRevenue: number;
  todaysRevenueFormatted: string;
  todaysOrderCount: number;

  yesterdaysRevenue: number;
  yesterdaysRevenueFormatted: string;
  yesterdaysOrderCount: number;

  weeklyRevenue: number;
  weeklyRevenueFormatted: string;
  weeklyOrderCount: number;

  totalRevenue: number;
  totalRevenueFormatted: string;
  totalValidOrdersCount: number;

  weeklyPerformance: DayRevenuePoint[];
  monthlyOrdersTrend: MonthlyOrdersPoint[];

  growthVsYesterdayPercent: string;
}

/**
 * Computes all dashboard revenue metrics using calculateRevenue.
 * Guarantees that Today's Revenue, Weekly Revenue, and Weekly Performance match 100%.
 */
export function calculateRevenueMetrics(orders: Order[] = []): RevenueMetrics {
  const seenIds = new Set<string>();
  const validOrders = orders.filter((o) => {
    if (!o || !o.id || seenIds.has(o.id)) return false;
    seenIds.add(o.id);
    return isEligibleRevenueStatus(o.status);
  });

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const startOfToday = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0);
  const endOfToday = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999);

  const startOfYesterday = new Date(todayYear, todayMonth, todayDate - 1, 0, 0, 0, 0);
  const endOfYesterday = new Date(todayYear, todayMonth, todayDate - 1, 23, 59, 59, 999);

  // 1. Today's Revenue calculated via shared function
  const todaysRevenue = calculateRevenue(validOrders, { start: startOfToday, end: endOfToday });
  const todaysOrderCount = validOrders.filter((ord) => {
    if (!ord.createdAt) return false;
    const d = new Date(ord.createdAt);
    return !isNaN(d.getTime()) && d >= startOfToday && d <= endOfToday;
  }).length;

  // 2. Yesterday's Revenue calculated via shared function
  const yesterdaysRevenue = calculateRevenue(validOrders, { start: startOfYesterday, end: endOfYesterday });
  const yesterdaysOrderCount = validOrders.filter((ord) => {
    if (!ord.createdAt) return false;
    const d = new Date(ord.createdAt);
    return !isNaN(d.getTime()) && d >= startOfYesterday && d <= endOfYesterday;
  }).length;

  // 3. Weekly Performance: 7 consecutive days ending today
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const weeklyPerformance: DayRevenuePoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayYear, todayMonth, todayDate - i, 0, 0, 0, 0);
    const dayEnd = new Date(todayYear, todayMonth, todayDate - i, 23, 59, 59, 999);

    const dayValue = calculateRevenue(validOrders, { start: dayStart, end: dayEnd });
    const dayOrdersCount = validOrders.filter((ord) => {
      if (!ord.createdAt) return false;
      const d = new Date(ord.createdAt);
      return !isNaN(d.getTime()) && d >= dayStart && d <= dayEnd;
    }).length;

    weeklyPerformance.push({
      label: dayNames[dayStart.getDay()],
      fullDate: `${monthNames[dayStart.getMonth()]} ${dayStart.getDate()}`,
      dateKey: `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, '0')}-${String(
        dayStart.getDate()
      ).padStart(2, '0')}`,
      value: dayValue,
      ordersCount: dayOrdersCount,
    });
  }

  // 4. Weekly Revenue is the exact sum of the 7-day period
  const startOfWeek = new Date(todayYear, todayMonth, todayDate - 6, 0, 0, 0, 0);
  const weeklyRevenue = calculateRevenue(validOrders, { start: startOfWeek, end: endOfToday });
  const weeklyOrderCount = weeklyPerformance.reduce((sum, day) => sum + day.ordersCount, 0);

  // 5. Total All-Time Revenue
  const totalRevenue = calculateRevenue(validOrders);
  const totalValidOrdersCount = validOrders.length;

  // Comparison vs yesterday for badge (truthful state, no fake data)
  let growthVsYesterdayPercent = 'Real-time feed';
  if (yesterdaysRevenue > 0) {
    const diff = ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100;
    const sign = diff >= 0 ? '+' : '';
    growthVsYesterdayPercent = `${sign}${diff.toFixed(1)}% vs yesterday`;
  } else if (todaysRevenue > 0) {
    growthVsYesterdayPercent = '+100% vs yesterday';
  } else {
    growthVsYesterdayPercent = todaysOrderCount === 0 ? 'No orders yet today' : `${todaysOrderCount} orders today`;
  }

  // 6. Monthly orders trend (last 6 calendar months from real orders)
  const monthlyOrdersTrend: MonthlyOrdersPoint[] = [];
  for (let m = 5; m >= 0; m--) {
    const monthStart = new Date(todayYear, todayMonth - m, 1, 0, 0, 0, 0);
    const monthEnd = new Date(todayYear, todayMonth - m + 1, 0, 23, 59, 59, 999);

    const mRevenue = calculateRevenue(validOrders, { start: monthStart, end: monthEnd });
    const mOrders = validOrders.filter((ord) => {
      if (!ord.createdAt) return false;
      const d = new Date(ord.createdAt);
      return !isNaN(d.getTime()) && d >= monthStart && d <= monthEnd;
    });

    monthlyOrdersTrend.push({
      label: monthNames[monthStart.getMonth()],
      value: mOrders.length,
      revenue: mRevenue,
      highlight: m === 0,
    });
  }

  return {
    todaysRevenue,
    todaysRevenueFormatted: todaysRevenue.toFixed(2),
    todaysOrderCount,

    yesterdaysRevenue,
    yesterdaysRevenueFormatted: yesterdaysRevenue.toFixed(2),
    yesterdaysOrderCount,

    weeklyRevenue,
    weeklyRevenueFormatted: weeklyRevenue.toFixed(2),
    weeklyOrderCount,

    totalRevenue,
    totalRevenueFormatted: totalRevenue.toFixed(2),
    totalValidOrdersCount,

    weeklyPerformance,
    monthlyOrdersTrend,

    growthVsYesterdayPercent,
  };
}
