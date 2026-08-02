import type { AllData } from '@/types';

export function computeDashboardKPIs(data: AllData) {
  const { flights, passengers, baggage, securityScreenings, maintenanceLogs, retailTransactions, staffShifts } = data;

  const totalFlights = flights.length;
  const onTimeFlights = flights.filter((f) => f.delay_minutes === 0).length;
  const delayedFlights = flights.filter((f) => f.delay_minutes > 0).length;
  const onTimeRate = totalFlights ? (onTimeFlights / totalFlights) * 100 : 0;
  const avgDelay = delayedFlights
    ? flights.reduce((sum, f) => sum + (f.delay_minutes > 0 ? f.delay_minutes : 0), 0) / delayedFlights
    : 0;
  const totalFlightRevenue = flights.reduce((sum, f) => sum + f.revenue_inr, 0);
  const avgLoadFactor = totalFlights ? flights.reduce((sum, f) => sum + f.load_factor_pct, 0) / totalFlights : 0;
  const internationalPct = totalFlights ? (flights.filter((f) => f.is_international).length / totalFlights) * 100 : 0;

  const totalPassengers = passengers.length;
  const businessPax = passengers.filter((p) => p.cabin_class === 'Business').length;
  const frequentFlyers = passengers.filter((p) => p.is_frequent_flyer).length;
  const avgSatisfaction = totalPassengers
    ? passengers.reduce((sum, p) => sum + p.satisfaction_score, 0) / totalPassengers
    : 0;

  const totalBags = baggage.length;
  const avgBagWeight = totalBags ? baggage.reduce((sum, b) => sum + b.weight_kg, 0) / totalBags : 0;

  const totalRetailRevenue = retailTransactions.reduce((sum, r) => sum + r.total_amount_inr, 0);
  const avgTransaction = retailTransactions.length ? totalRetailRevenue / retailTransactions.length : 0;

  const totalScreenings = securityScreenings.length;
  const clearRate = totalScreenings
    ? (securityScreenings.filter((sc) => sc.result === 'Clear').length / totalScreenings) * 100
    : 0;
  const avgProcessingSec = totalScreenings
    ? securityScreenings.reduce((sum, sc) => sum + sc.processing_seconds, 0) / totalScreenings
    : 0;

  const totalWorkOrders = maintenanceLogs.length;
  const aogCount = maintenanceLogs.filter((m) => m.is_aog).length;
  const holdCount = maintenanceLogs.filter((m) => !m.cleared_to_fly).length;

  const totalStaff = staffShifts.length;
  const overtimeStaff = staffShifts.filter((st) => st.is_overtime).length;

  return {
    totalFlights, onTimeFlights, delayedFlights, onTimeRate, avgDelay, totalFlightRevenue, avgLoadFactor, internationalPct,
    totalPassengers, businessPax, frequentFlyers, avgSatisfaction,
    totalBags, avgBagWeight,
    totalRetailRevenue, avgTransaction,
    totalScreenings, clearRate, avgProcessingSec,
    totalWorkOrders, aogCount, holdCount,
    totalStaff, overtimeStaff,
  };
}

export function groupCount<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = keyFn(item);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

export function sumBy<T>(items: T[], valFn: (item: T) => number): number {
  return items.reduce((sum, item) => sum + valFn(item), 0);
}

export function topN(record: Record<string, number>, n: number): Array<{ name: string; value: number }> {
  return Object.entries(record)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}
