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

export default function DelayBreakdownChart({ flights }: { flights: Flight[] }) {
  const data = useMemo(() => {
    const delayed = flights.filter((f) => f.delay_minutes > 0);
    const counts = groupCount(delayed, (f) => f.delay_reason ?? 'Unknown');
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Stable sort for smooth animation
  }, [flights]);

  if (data.length === 0) {
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
