import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { OpsAlert } from '@/types';
import { severityBadgeClasses } from '@/utils/colorMapping';
import { timeAgo } from '@/utils/formatters';
import { useSimulation } from '@/context/SimulationContext';
import EmptyState from './EmptyState';

const MODULE_ROUTE: Record<OpsAlert['module'], string> = {
  flights: '/flights', gates: '/gates', baggage: '/baggage', passengers: '/passengers',
  security: '/security', maintenance: '/maintenance', staff: '/staff', retail: '/retail',
};

export default function AlertFeed({ alerts, limit }: { alerts: OpsAlert[]; limit?: number }) {
  const navigate = useNavigate();
  const { simulatedNow } = useSimulation();
  const shown = limit ? alerts.slice(0, limit) : alerts;

  if (shown.length === 0) return <EmptyState message="No active alerts. All systems nominal." />;

  return (
    <ul
      aria-live="polite"
      aria-label="Live operational alert feed"
      className="flex max-h-[420px] flex-col gap-2 overflow-y-auto scrollbar-thin"
    >
      {shown.map((a) => {
        const borderMap: Record<OpsAlert['severity'], string> = {
          CRITICAL: 'border-l-status-critical',
          HIGH: 'border-l-status-critical',
          MEDIUM: 'border-l-status-warning',
          LOW: 'border-l-info',
          INFO: 'border-l-border',
        };
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => navigate(`${MODULE_ROUTE[a.module]}?search=${encodeURIComponent(a.recordId)}`)}
              className={`group flex w-full animate-fade-in flex-col gap-1 rounded-r-md rounded-l-sm border border-l-4 border-y-border border-r-border bg-bg-card px-3 py-2 text-left transition-colors hover:bg-bg-elevated ${borderMap[a.severity] || 'border-l-border'}`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityBadgeClasses(a.severity)}`}>
                  {a.severity}
                </span>
                <span className="text-[11px] text-text-muted">{timeAgo(a.timestamp, simulatedNow)}</span>
              </div>
              <p className="text-[13px] text-text-primary group-hover:text-white transition-colors">{a.message}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
