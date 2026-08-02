import React from 'react';

export default function ChartWrapper({ title, children, height = 260 }: { title: string; children: React.ReactNode; height?: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-4 flex flex-col h-full">
      <h3 className="mb-3 text-[16px] font-semibold text-text-primary shrink-0">{title}</h3>
      <div className="flex-1 min-h-0" style={height ? { minHeight: height } : undefined}>{children}</div>
    </div>
  );
}

export const chartTheme = {
  grid: 'rgba(26, 58, 92, 0.6)',
  axis: '#7a9bb5',
  primary: '#00d4ff',
  secondary: '#ff6b35',
  tertiary: '#00ff88',
  tooltipBg: '#102030',
};
