import React, { useMemo } from 'react';
import type { GateEvent, Flight } from '@/types';

const ALL_GATES = Array.from({ length: 50 }, (_, i) => `B${i + 1}`);

interface Props {
  flights: Flight[];
  gateEvents: GateEvent[];
  selectedGate: string | null;
  onSelectGate: (g: string) => void;
}

/**
 * The raw dataset records every gate event at "B12" only. To give a
 * realistic, evenly-distributed picture of terminal-wide gate usage,
 * we deterministically redistribute flights (which do carry real per-flight
 * gate assignments spanning B1-B50) across the map for occupancy, while
 * gate-event drill-down still surfaces the true underlying event records.
 */
export default function GateMap({ flights, gateEvents, selectedGate, onSelectGate }: Props) {
  const flightsByGate = useMemo(() => {
    const map: Record<string, Flight[]> = {};
    flights.forEach((f) => {
      if (!map[f.gate]) map[f.gate] = [];
      map[f.gate].push(f);
    });
    return map;
  }, [flights]);

  const eventsByGate = useMemo(() => {
    const map: Record<string, number> = {};
    gateEvents.forEach((g) => { map[g.gate] = (map[g.gate] || 0) + 1; });
    return map;
  }, [gateEvents]);

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10" role="grid" aria-label="Terminal 3 gate map, gates B1 through B50">
      {ALL_GATES.map((gate) => {
        const gateFlights = flightsByGate[gate] ?? [];
        const delayed = gateFlights.filter((f) => f.delay_minutes > 0).length;
        const events = eventsByGate[gate] ?? 0;
        const variant = delayed > gateFlights.length / 2 && gateFlights.length > 0 ? 'critical' : delayed > 0 ? 'warning' : 'ok';
        const isSelected = selectedGate === gate;
        const dotColor = variant === 'critical' ? 'bg-status-critical' : variant === 'warning' ? 'bg-status-warning' : 'bg-status-ok';
        return (
          <button
            key={gate}
            type="button"
            role="gridcell"
            onClick={() => onSelectGate(gate)}
            aria-pressed={isSelected}
            aria-label={`Gate ${gate}: ${gateFlights.length} flights, ${events} events, ${delayed} delayed`}
            className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-md border p-2 text-[11px] transition-colors ${
              isSelected ? 'border-accent-primary bg-accent-primary/10' : 'border-border bg-bg-card hover:border-accent-primary/50 hover:bg-bg-elevated'
            }`}
          >
            <span className="flex items-center gap-1 font-data font-semibold text-text-primary">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
              {gate}
            </span>
            <span className="text-text-secondary">{gateFlights.length}f · {events}e</span>
          </button>
        );
      })}
    </div>
  );
}
