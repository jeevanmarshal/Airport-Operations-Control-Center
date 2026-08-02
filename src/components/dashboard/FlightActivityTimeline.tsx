import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Flight } from '@/types';
import { chartTheme } from '@/components/common/ChartWrapper';

export default function FlightActivityTimeline({ flights }: { flights: Flight[] }) {
  const hourly = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, '0')}:00`, departures: 0, delayed: 0 }));
    flights.forEach((f) => {
      const h = f.scheduled_departure.getHours();
      buckets[h].departures += 1;
      if (f.delay_minutes > 0) buckets[h].delayed += 1;
    });
    return buckets;
  }, [flights]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={hourly} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={chartTheme.grid} vertical={false} />
        <XAxis dataKey="hour" tick={{ fill: chartTheme.axis, fontSize: 11 }} axisLine={{ stroke: chartTheme.grid }} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: chartTheme.axis, fontSize: 11 }} axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
        <Tooltip
          contentStyle={{ background: chartTheme.tooltipBg, border: '1px solid #1a3a5c', borderRadius: 8, color: '#e8f4fd', fontSize: 12 }}
          cursor={{ fill: 'rgba(0,212,255,0.06)' }}
        />
        <Bar dataKey="departures" name="Scheduled Departures" fill={chartTheme.primary} radius={[3, 3, 0, 0]} />
        <Bar dataKey="delayed" name="Delayed" fill={chartTheme.secondary} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
