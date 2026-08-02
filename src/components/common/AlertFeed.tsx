import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OpsAlert } from '@/types';
import { severityBadgeClasses } from '@/utils/colorMapping';
import { useSimulation } from '@/context/SimulationContext';
import { useAlerts } from '@/context/AlertContext';
import EmptyState from './EmptyState';
import { Check } from 'lucide-react';

const MODULE_ROUTE: Record<OpsAlert['module'], string> = {
  flights: '/flights', gates: '/gates', baggage: '/baggage', passengers: '/passengers',
  security: '/security', maintenance: '/maintenance', staff: '/staff', retail: '/retail',
};

export default function AlertFeed({ alerts, limit }: { alerts: OpsAlert[]; limit?: number }) {
  const navigate = useNavigate();
  const { simulatedNow } = useSimulation();
  const { acknowledgeAlert } = useAlerts();
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');

  const counts = {
    ALL: alerts.length,
    HIGH: alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length,
    MED: alerts.filter(a => a.severity === 'MEDIUM').length,
    LOW: alerts.filter(a => a.severity === 'LOW' || a.severity === 'INFO').length,
  };

  const filtered = alerts.filter(a => {
    if (activeTab === 'HIGH') return a.severity === 'CRITICAL' || a.severity === 'HIGH';
    if (activeTab === 'MED') return a.severity === 'MEDIUM';
    if (activeTab === 'LOW') return a.severity === 'LOW' || a.severity === 'INFO';
    return true;
  });

  const shown = limit ? filtered.slice(0, limit) : filtered;

  const getRelativeTime = (ts: Date) => {
    const diffSeconds = Math.floor((Date.now() - ts.getTime()) / 1000);
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  if (alerts.length === 0) return <EmptyState message="No active alerts. All systems nominal." />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 text-[11px] font-semibold border-b border-border pb-2">
        {(['ALL', 'HIGH', 'MED', 'LOW'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded transition-colors ${activeTab === tab ? 'bg-accent-primary text-bg-base' : 'text-text-secondary hover:bg-bg-elevated'}`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({counts[tab]})
          </button>
        ))}
      </div>
      <ul
        aria-live="polite"
        aria-label="Live operational alert feed"
        className="flex max-h-[420px] flex-col gap-2 overflow-y-auto scrollbar-thin mt-1"
      >
        {shown.length === 0 ? (
          <EmptyState message={`No ${activeTab !== 'ALL' ? activeTab.toLowerCase() + ' ' : ''}alerts.`} />
        ) : shown.map((a) => {
          const borderMap: Record<OpsAlert['severity'], string> = {
            CRITICAL: 'border-l-status-critical',
            HIGH: 'border-l-status-critical',
            MEDIUM: 'border-l-status-warning',
            LOW: 'border-l-info',
            INFO: 'border-l-border',
          };
          return (
            <li key={a.id} className={`relative flex w-full animate-fade-in flex-col gap-1 rounded-r-md rounded-l-sm border border-l-4 border-y-border border-r-border bg-bg-card transition-all hover:bg-bg-elevated ${borderMap[a.severity] || 'border-l-border'} ${a.acknowledged ? 'opacity-40' : 'opacity-100'}`}>
              <button
                type="button"
                onClick={() => navigate(`${MODULE_ROUTE[a.module]}?search=${encodeURIComponent(a.recordId)}`)}
                className="flex flex-col text-left px-3 pt-2 pb-1"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {a.severity === 'CRITICAL' && <div className="h-2 w-2 shrink-0 rounded-full bg-status-critical animate-pulse shadow-[0_0_8px_rgba(255,59,92,0.8)]" />}
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityBadgeClasses(a.severity)}`}>
                      {a.severity}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted">{getRelativeTime(a.timestamp)}</span>
                </div>
                <p className="text-[13px] text-text-primary group-hover:text-white transition-colors mt-1 mb-8 pr-8">{a.message}</p>
              </button>
              
              <div className="absolute right-3 bottom-2">
                {a.acknowledged ? (
                  <Check size={16} className="text-status-ok" />
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); acknowledgeAlert(a.id); }}
                    className="text-[10px] bg-bg-elevated border border-border px-2 py-1 rounded hover:bg-accent-primary hover:text-bg-base transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
