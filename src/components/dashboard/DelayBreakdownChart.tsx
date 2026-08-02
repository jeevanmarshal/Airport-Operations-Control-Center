import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Flight } from '@/types';
import { chartTheme } from '@/components/common/ChartWrapper';
import { groupCount } from '@/utils/calculations';

const COLORS = [chartTheme.secondary, chartTheme.primary, chartTheme.tertiary, '#ffd700', '#a855f7'];

const colorMap = new Map<string, string>();
let nextColorIndex = 0;
function getStableColor(name: string) {
  if (!colorMap.has(name)) {
    colorMap.set(name, COLORS[nextColorIndex % COLORS.length]);
    nextColorIndex++;
  }
  return colorMap.get(name)!;
}

import { useData } from '@/context/DataContext';

export default function DelayBreakdownChart({ flights }: { flights: Flight[] }) {
  const { raw } = useData();

  const allReasons = useMemo(() => {
    const reasons = new Set<string>();
    raw.flights.forEach(f => {
      if (f.delay_reason && f.delay_minutes > 0) reasons.add(f.delay_reason);
    });
    const arr = Array.from(reasons).sort((a, b) => a.localeCompare(b));
    if (arr.length === 0) arr.push('Unknown');
    return arr;
  }, [raw.flights]);

  const data = useMemo(() => {
    const delayed = flights.filter((f) => f.delay_minutes > 0);
    const counts = groupCount(delayed, (f) => f.delay_reason ?? 'Unknown');
    
    // Provide ALL possible reasons with a value (0 if not present) to ensure 
    // constant array length for smooth Recharts Pie animations.
    return allReasons.map(name => ({
      name,
      value: counts[name] || 0
    }));
  }, [flights, allReasons]);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  if (totalValue === 0) {
    return <div className="flex h-full items-center justify-center text-[13px] text-text-secondary">No delayed flights to break down.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={data} 
          dataKey="value" 
          nameKey="name" 
          cx="50%" 
          cy="48%" 
          innerRadius={50} 
          outerRadius={75} 
          paddingAngle={2}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry) => <Cell key={entry.name} fill={getStableColor(entry.name)} stroke={chartTheme.tooltipBg} />)}
        </Pie>
        <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: '1px solid #1a3a5c', borderRadius: 8, color: '#e8f4fd', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: chartTheme.axis }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
