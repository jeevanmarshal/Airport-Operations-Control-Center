import React from 'react';
import { formatINR, formatPct } from '@/utils/formatters';
import type { computeDashboardKPIs } from '@/utils/calculations';

export default function QuickStatsRow({ kpis }: { kpis: ReturnType<typeof computeDashboardKPIs> }) {
  const items = [
    { label: 'Flight Revenue Today', value: formatINR(kpis.totalFlightRevenue) },
    { label: 'Retail Revenue Today', value: formatINR(kpis.totalRetailRevenue) },
    { label: 'Average Load Factor', value: formatPct(kpis.avgLoadFactor) },
    { label: 'Security Throughput', value: `${kpis.totalScreenings.toLocaleString('en-IN')} pax` },
    { label: 'Avg Processing Time', value: `${kpis.avgProcessingSec.toFixed(0)}s` },
    { label: 'Maintenance Holds', value: String(kpis.holdCount) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-md border border-border bg-bg-elevated px-3 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-text-secondary">{it.label}</dt>
          <dd className="font-data mt-0.5 text-[16px] font-semibold text-text-primary">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
