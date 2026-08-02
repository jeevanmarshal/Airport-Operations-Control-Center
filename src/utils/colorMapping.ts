export type StatusVariant = 'ok' | 'warning' | 'critical' | 'inactive' | 'info';

export const VARIANT_COLOR: Record<StatusVariant, string> = {
  ok: 'var(--status-ok)',
  warning: 'var(--status-warning)',
  critical: 'var(--status-critical)',
  inactive: 'var(--status-inactive)',
  info: 'var(--accent-primary)',
};

export function delayStatus(delayMinutes: number): { label: string; variant: StatusVariant } {
  if (delayMinutes <= 0) return { label: 'On-Time', variant: 'ok' };
  if (delayMinutes <= 30) return { label: 'Minor Delay', variant: 'warning' };
  if (delayMinutes <= 60) return { label: 'Moderate Delay', variant: 'warning' };
  return { label: 'Severe Delay', variant: 'critical' };
}

export function loadFactorStatus(pct: number): { label: string; variant: StatusVariant } {
  if (pct < 70) return { label: 'Low Occupancy', variant: 'inactive' };
  if (pct < 90) return { label: 'Normal', variant: 'ok' };
  if (pct < 100) return { label: 'High', variant: 'warning' };
  return { label: 'Overbooked', variant: 'critical' };
}

export function maintenanceSeverity(level: number): { label: string; variant: StatusVariant } {
  switch (level) {
    case 1: return { label: 'Low', variant: 'ok' };
    case 2: return { label: 'Moderate-Low', variant: 'warning' };
    case 3: return { label: 'Moderate', variant: 'warning' };
    case 4: return { label: 'High', variant: 'critical' };
    case 5: return { label: 'Critical', variant: 'critical' };
    default: return { label: 'Unknown', variant: 'inactive' };
  }
}

export function satisfactionStatus(score: number): { label: string; variant: StatusVariant } {
  if (score < 0) return { label: 'Dissatisfied', variant: 'critical' };
  if (score < 2) return { label: 'Neutral', variant: 'warning' };
  if (score < 4) return { label: 'Satisfied', variant: 'ok' };
  return { label: 'Very Satisfied', variant: 'ok' };
}

export function severityBadgeClasses(sev: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'): string {
  switch (sev) {
    case 'CRITICAL': return 'bg-status-critical/15 text-status-critical border-status-critical/40';
    case 'HIGH': return 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/40';
    case 'MEDIUM': return 'bg-status-warning/15 text-status-warning border-status-warning/40';
    case 'LOW': return 'bg-yellow-400/10 text-yellow-300 border-yellow-300/30';
    case 'INFO': return 'bg-accent-primary/15 text-accent-primary border-accent-primary/40';
    default: return 'bg-status-inactive/15 text-status-inactive border-status-inactive/40';
  }
}
