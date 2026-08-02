import { useMemo } from 'react';
import type { GateEvent } from '@/types';
import { useData } from '@/context/DataContext';
import DetailPanel from '@/components/common/DetailPanel';
import { DetailSection } from '@/components/common/DetailField';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function GateDetailPanel({ gate, onClose }: { gate: string | null; onClose: () => void }) {
  const data = useData();

  const info = useMemo(() => {
    if (!gate) return null;
    const events = data.gateEvents.filter((e) => e.gate === gate);
    const flights = data.flights.filter((f) => f.gate === gate);
    const staffIds = new Set(events.map((e) => e.staff_id));
    const staff = data.staffShifts.filter((s) => staffIds.has(s.staff_id));
    return { events, flights, staff };
  }, [data, gate]);

  if (!gate || !info) return null;
  const delayedFlights = info.flights.filter((f) => f.delay_minutes > 0).length;
  const gateStatus = delayedFlights > 0 ? 'Delayed Operations' : info.flights.length > 0 ? 'Active boarding' : 'Ready / Open';
  const gateVariant = delayedFlights > 0 ? 'critical' : info.flights.length > 0 ? 'warning' : 'ok';

  return (
    <DetailPanel isOpen={!!gate} onClose={onClose} title={`Gate: ${gate}`}>
      {/* Sticky Header info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusBadge status={gateStatus} variant={gateVariant} />
          <StatusBadge status="Terminal T3" variant="info" />
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 p-3 rounded-lg border border-border/50 mb-4 font-data">
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Flights</span>
            <span className="text-[13px] font-bold text-accent-primary">{info.flights.length}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Staff</span>
            <span className="text-[13px] font-bold text-status-ok">{info.staff.length}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Events</span>
            <span className="text-[13px] font-bold text-status-warning">{info.events.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DetailSection title="Assigned Flights">
          {info.flights.length === 0 && <p className="text-[13px] text-text-secondary">No flights assigned to this gate.</p>}
          <ul className="flex flex-col gap-1.5">
            {info.flights.slice(0, 10).map((f) => (
              <li key={f.flight_id} className="flex items-center justify-between rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <span className="font-data font-semibold text-accent-primary">{f.flight_id} → {f.destination}</span>
                <StatusBadge status={f.delay_minutes > 0 ? `+${f.delay_minutes}m` : 'On-Time'} variant={f.delay_minutes > 0 ? 'warning' : 'ok'} />
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="Recent Gate Events">
          {info.events.length === 0 && <p className="text-[13px] text-text-secondary">No events recorded at this gate.</p>}
          <ul className="flex flex-col gap-1.5">
            {info.events.slice(0, 10).map((e) => (
              <li key={e.event_id} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <div className="flex justify-between"><span>{e.event_type}</span><span className="font-data text-text-secondary">{formatDateTime(e.event_time)}</span></div>
                <div className="text-text-secondary mt-1">Flight {e.flight_id} · staff {e.staff_id}</div>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="Staff on Duty">
          {info.staff.length === 0 && <p className="text-[13px] text-text-secondary">No staff records linked to this gate.</p>}
          <ul className="flex flex-col gap-1.5">
            {info.staff.slice(0, 10).map((s) => (
              <li key={s.staff_id} className="flex items-center justify-between rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <span>{s.name}</span>
                <span className="font-data text-text-secondary text-[11px]">{s.role} ({s.department})</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      </div>
    </DetailPanel>
  );
}
