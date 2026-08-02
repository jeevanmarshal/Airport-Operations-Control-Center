import React, { useMemo } from 'react';
import type { Flight } from '@/types';

export default function FlightStats({ flights }: { flights: Flight[] }) {
  const stats = useMemo(() => {
    const total = flights.length;
    const onTime = flights.filter((f) => f.delay_minutes === 0).length;
    const delayed = total - onTime;
    const intl = flights.filter((f) => f.is_international).length;
    const domestic = total - intl;
    return { total, onTime, delayed, intl, domestic };
  }, [flights]);

  const items = [
    { label: 'Total', value: stats.total, color: 'text-text-primary' },
    { label: 'On-Time', value: stats.onTime, color: 'text-status-ok' },
    { label: 'Delayed', value: stats.delayed, color: 'text-status-warning' },
    { label: 'International', value: stats.intl, color: 'text-accent-primary' },
    { label: 'Domestic', value: stats.domestic, color: 'text-text-secondary' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((it) => (
        <div key={it.label} className="rounded-md border border-border bg-bg-card px-3 py-2 text-center">
          <div className={`font-data text-[20px] font-bold ${it.color}`}>{it.value.toLocaleString('en-IN')}</div>
          <div className="text-[11px] uppercase tracking-wide text-text-secondary">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
