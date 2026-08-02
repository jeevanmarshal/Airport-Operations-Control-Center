import React from 'react';
import type { StatusVariant } from '@/utils/colorMapping';

const VARIANT_STYLES: Record<StatusVariant, string> = {
  ok: 'bg-status-ok/10 text-status-ok border-status-ok/40',
  warning: 'bg-status-warning/10 text-status-warning border-status-warning/40',
  critical: 'bg-status-critical/10 text-status-critical border-status-critical/40',
  inactive: 'bg-status-inactive/10 text-status-inactive border-status-inactive/40',
  info: 'bg-accent-primary/10 text-accent-primary border-accent-primary/40',
};

const DOT_COLOR: Record<StatusVariant, string> = {
  ok: 'bg-status-ok', warning: 'bg-status-warning', critical: 'bg-status-critical',
  inactive: 'bg-status-inactive', info: 'bg-accent-primary',
};

function autoVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (/(critical|aog|damaged|severe|flagged|expired|overbooked)/.test(s)) return 'critical';
  if (/(warning|moderate|hold|delay|pending|overweight)/.test(s)) return 'warning';
  if (/(clear|ok|on-time|normal|resolved|loaded|departed|satisfied)/.test(s)) return 'ok';
  if (/(inactive|offline|n\/a|low occupancy)/.test(s)) return 'inactive';
  return 'info';
}

export default function StatusBadge({ status, variant }: { status: string; variant?: StatusVariant }) {
  const v = variant ?? autoVariant(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${VARIANT_STYLES[v]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[v]}`} aria-hidden="true" />
      {status}
    </span>
  );
}
