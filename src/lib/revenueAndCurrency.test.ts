import { calculateRevenue, calculateRevenueMetrics, isEligibleRevenueStatus } from './revenueUtils';
import { formatCurrency, getCurrencySymbol, SUPPORTED_CURRENCIES } from './currency';
import { Order } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

console.log('=== RUNNING REVENUE & CURRENCY UNIT TESTS ===\n');

// 1. REVENUE STATUS ELIGIBILITY
assert(isEligibleRevenueStatus('Accepted'), 'Accepted status is eligible');
assert(isEligibleRevenueStatus('accepted'), 'accepted status (lowercase) is eligible');
assert(isEligibleRevenueStatus('Cooking'), 'Cooking status is eligible');
assert(isEligibleRevenueStatus('cooking'), 'cooking status (lowercase) is eligible');
assert(isEligibleRevenueStatus('Completed'), 'Completed status is eligible');
assert(isEligibleRevenueStatus('completed'), 'completed status (lowercase) is eligible');
assert(!isEligibleRevenueStatus('Cancelled'), 'Cancelled status is excluded');
assert(!isEligibleRevenueStatus('cancelled'), 'cancelled status is excluded');
assert(!isEligibleRevenueStatus('rejected'), 'rejected status is excluded');
assert(!isEligibleRevenueStatus('pending'), 'pending status is excluded');
assert(!isEligibleRevenueStatus('new'), 'new status is excluded');
assert(!isEligibleRevenueStatus(undefined as any), 'undefined status is excluded');

// Mock order generator
const now = new Date();
const todayIso = now.toISOString();

const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayIso = yesterday.toISOString();

const mockOrders: Order[] = [
  {
    id: 'ord-1',
    restaurantId: 'resto-1',
    customerName: 'Alice',
    customerPhone: '1234567890',
    fulfilmentType: 'delivery',
    paymentMethod: 'Cash on Delivery',
    items: [],
    subtotal: 50,
    deliveryFee: 5,
    total: 55,
    status: 'Completed',
    createdAt: todayIso,
    updatedAt: todayIso,
  },
  {
    id: 'ord-2',
    restaurantId: 'resto-1',
    customerName: 'Bob',
    customerPhone: '1234567891',
    fulfilmentType: 'pickup',
    paymentMethod: 'Cash on Delivery',
    items: [],
    subtotal: 30,
    deliveryFee: 0,
    total: 30,
    status: 'Preparing',
    createdAt: todayIso,
    updatedAt: todayIso,
  },
  {
    id: 'ord-3',
    restaurantId: 'resto-1',
    customerName: 'Charlie',
    customerPhone: '1234567892',
    fulfilmentType: 'delivery',
    paymentMethod: 'Cash on Delivery',
    items: [],
    subtotal: 100,
    deliveryFee: 10,
    total: 110,
    status: 'Cancelled', // EXCLUDED!
    createdAt: todayIso,
    updatedAt: todayIso,
  },
  {
    id: 'ord-4',
    restaurantId: 'resto-1',
    customerName: 'David',
    customerPhone: '1234567893',
    fulfilmentType: 'pickup',
    paymentMethod: 'Cash on Delivery',
    items: [],
    subtotal: 40,
    deliveryFee: 0,
    total: 40,
    status: 'Accepted',
    createdAt: yesterdayIso,
    updatedAt: yesterdayIso,
  },
];

// 2. CALCULATE REVENUE TODAY
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

const todayRev = calculateRevenue(mockOrders, { start: startOfToday, end: endOfToday });
assert(todayRev === 85, `Today revenue is 55 + 30 = 85 (actual: ${todayRev})`);

// 3. CALCULATE REVENUE ALL / WEEKLY
const totalRev = calculateRevenue(mockOrders);
assert(totalRev === 125, `All-time revenue is 55 + 30 + 40 = 125 (actual: ${totalRev})`);

// 4. PREVENTS DUPLICATE ORDERS
const duplicateOrders = [...mockOrders, mockOrders[0]];
const dedupedRev = calculateRevenue(duplicateOrders, { start: startOfToday, end: endOfToday });
assert(dedupedRev === 85, `Deduplicates orders by ID (actual: ${dedupedRev})`);

// 5. EMPTY AND INVALID HANDLING
assert(calculateRevenue([], { start: startOfToday, end: endOfToday }) === 0, 'Empty order list returns 0');
assert(calculateRevenue(null as any) === 0, 'Null order list returns 0');

// 6. METRICS COMPUTATION
const metrics = calculateRevenueMetrics(mockOrders);
assert(metrics.todaysRevenue === 85, `Metrics todaysRevenue is 85 (actual: ${metrics.todaysRevenue})`);
assert(metrics.todaysOrderCount === 2, `Metrics todaysOrderCount is 2 (actual: ${metrics.todaysOrderCount})`);
assert(metrics.weeklyRevenue === 125, `Metrics weeklyRevenue includes both today and yesterday (actual: ${metrics.weeklyRevenue})`);
assert(metrics.weeklyPerformance.length === 7, 'Weekly performance contains exactly 7 days');

// 7. CURRENCY FORMATTING
assert(getCurrencySymbol('USD') === '$', 'USD symbol is $');
assert(getCurrencySymbol('EUR') === '€', 'EUR symbol is €');
assert(getCurrencySymbol('GBP') === '£', 'GBP symbol is £');
assert(getCurrencySymbol('PKR') === 'Rs.', 'PKR symbol is Rs.');
assert(formatCurrency(25.5, 'USD') === '$25.50', 'USD formats as $25.50');
assert(formatCurrency(100, 'EUR') === '€100.00', 'EUR formats as €100.00');
assert(formatCurrency(49.99, 'GBP') === '£49.99', 'GBP formats as £49.99');
assert(formatCurrency(1500, 'PKR') === 'Rs. 1,500.00', 'PKR formats as Rs. 1,500.00');
assert(formatCurrency(20, 'CAD') === 'CAD 20.00', 'CAD formats as CAD 20.00');
assert(formatCurrency(0, 'USD') === '$0.00', '0 formats as $0.00');
assert(formatCurrency(-5, 'USD') === '-$5.00', 'Negative amount formats as -$5.00');

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
