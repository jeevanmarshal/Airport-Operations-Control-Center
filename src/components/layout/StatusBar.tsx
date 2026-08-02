import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { useData } from '@/context/DataContext';
import { formatDateTime } from '@/utils/formatters';
import { Pause, Play } from 'lucide-react';
import type { SimSpeed } from '@/types';

export default function StatusBar() {
  const { simulatedNow, speed, setSpeed, isRunning, toggleSimulation } = useSimulation();
  const data = useData();
  const totalRecords =
    data.flights.length + data.passengers.length + data.baggage.length + data.gateEvents.length +
    data.securityScreenings.length + data.maintenanceLogs.length + data.staffShifts.length + data.retailTransactions.length;

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between border-t border-border bg-bg-card px-4 text-[11px] text-text-secondary">
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ok opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-status-ok"></span>
        </span>
        Last updated: <span className="font-data text-text-primary">{formatDateTime(simulatedNow)}</span>
      </span>
      <span className="hidden sm:inline">Data source: static dataset (8 tables) · <span className="font-data">{totalRecords.toLocaleString('en-IN')}</span> records loaded</span>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleSimulation}
          aria-label={isRunning ? 'Pause simulation' : 'Resume simulation'}
          className={`flex h-6 items-center gap-1 rounded px-2 text-[10px] font-semibold transition-colors uppercase tracking-wider ${
            !isRunning
              ? 'bg-status-critical/15 text-status-critical border border-status-critical/30'
              : 'border border-border text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 bg-transparent'
          }`}
        >
          <Pause size={10} className={!isRunning ? 'animate-pulse' : ''} />
          {isRunning ? 'Run' : 'Pause'}
        </button>
        <span className="h-4 w-px bg-border/60" />
        {([1, 5, 10, 20] as SimSpeed[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSpeed(s);
              if (!isRunning) toggleSimulation();
            }}
            aria-pressed={speed === s && isRunning}
            className={`rounded px-1.5 py-0.5 font-data text-[10px] transition-colors ${
              speed === s && isRunning
                ? 'bg-accent-primary/15 text-accent-primary font-bold border border-accent-primary/30'
                : 'text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </footer>
  );
}
