import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { StatusVariant } from '@/utils/colorMapping';

interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: LucideIcon;
  statusColor?: StatusVariant;
  decimals?: number;
  subtext?: string;
}

const BORDER_COLOR: Record<StatusVariant, string> = {
  ok: 'border-t-status-ok', warning: 'border-t-status-warning', critical: 'border-t-status-critical',
  inactive: 'border-t-status-inactive', info: 'border-t-accent-primary',
};

function useCountUp(target: number, decimals: number) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    const start = performance.now();
    const dur = 300;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setDisplay(from + (to - from) * p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return display.toFixed(decimals);
}

export default function KPICard({ label, value, unit, icon: Icon, statusColor = 'info', decimals = 0, subtext }: KPICardProps) {
  const isNumeric = typeof value === 'number';
  const animated = useCountUp(isNumeric ? value : 0, decimals);
  return (
    <div
      className={`rounded-lg border border-border border-t-2 ${BORDER_COLOR[statusColor]} bg-bg-card p-4 transition-colors hover:bg-bg-elevated hover:border-accent-primary/60`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">{label}</span>
        {Icon && <Icon size={18} className="text-text-secondary" aria-hidden="true" />}
      </div>
      <div className="mt-2 font-data text-[18px] xs:text-[22px] sm:text-[26px] md:text-[32px] font-bold leading-none text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
        {isNumeric ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(Number(animated)) : value}
        {unit && <span className="ml-1 text-xs sm:text-sm md:text-base font-medium text-text-secondary">{unit}</span>}
      </div>
      {subtext && <div className="mt-1 text-[13px] text-text-secondary">{subtext}</div>}
    </div>
  );
}
