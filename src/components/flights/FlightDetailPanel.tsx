import { useMemo, useState } from 'react';
import type { Flight } from '@/types';
import { useData } from '@/context/DataContext';
import DetailPanel from '@/components/common/DetailPanel';
import { DetailField, DetailSection, LinkedCount } from '@/components/common/DetailField';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, formatINR, formatPct, formatDuration } from '@/utils/formatters';
import { delayStatus, loadFactorStatus } from '@/utils/colorMapping';
import {
  flightPassengers, flightBaggage, flightGateEvents, flightMaintenance, flightRetail, flightStaff,
} from '@/utils/crossJoin';

type Tab = 'overview' | 'passengers' | 'baggage' | 'gate' | 'maintenance' | 'retail' | 'staff';

export default function FlightDetailPanel({ flight, onClose }: { flight: Flight | null; onClose: () => void }) {
  const data = useData();
  const [tab, setTab] = useState<Tab>('overview');

  const linked = useMemo(() => {
    if (!flight) return null;
    return {
      passengers: flightPassengers(data, flight.flight_id),
      baggage: flightBaggage(data, flight.flight_id),
      gateEvents: flightGateEvents(data, flight.flight_id),
      maintenance: flightMaintenance(data, flight),
      retail: flightRetail(data, flight.flight_id),
      staff: flightStaff(data, flight.flight_id),
    };
  }, [data, flight]);

  if (!flight || !linked) return null;
  const delay = delayStatus(flight.delay_minutes);
  const load = loadFactorStatus(flight.load_factor_pct);

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'passengers', label: 'Pax', count: linked.passengers.length },
    { key: 'baggage', label: 'Bags', count: linked.baggage.length },
    { key: 'gate', label: 'Gates', count: linked.gateEvents.length },
    { key: 'maintenance', label: 'Maint', count: linked.maintenance.length },
    { key: 'retail', label: 'Retail', count: linked.retail.length },
    { key: 'staff', label: 'Staff', count: linked.staff.length },
  ];

  return (
    <DetailPanel isOpen={!!flight} onClose={onClose} title={`Flight: ${flight.flight_id}`}>
      {/* Sticky Header info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusBadge status={delay.label} variant={delay.variant} />
          <StatusBadge status={load.label} variant={load.variant} />
          {flight.is_international && <StatusBadge status="International" variant="info" />}
          {flight.is_codeshare && <StatusBadge status="Codeshare" variant="inactive" />}
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 p-3 rounded-lg border border-border/50 mb-4">
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Gate</span>
            <span className="text-[13px] font-bold text-accent-primary font-data">{flight.gate}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Pax</span>
            <span className="text-[13px] font-bold text-status-ok font-data">{flight.passengers_boarded} / {flight.capacity}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Baggage</span>
            <span className="text-[13px] font-bold text-status-warning font-data">{linked.baggage.length}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Aircraft</span>
            <span className="text-[11px] font-bold text-text-primary truncate max-w-full font-data">{flight.aircraft_type}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Crew</span>
            <span className="text-[13px] font-bold text-text-primary font-data">{linked.staff.length}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Status</span>
            <span className="text-[11px] font-bold text-status-ok uppercase">{flight.status}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border pb-2" role="tablist" aria-label="Flight detail sections">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-2 py-1 text-[11px] transition-colors ${tab === t.key ? 'bg-accent-primary/15 text-accent-primary font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'overview' && (
          <div className="flex flex-col gap-4">
            <DetailSection title="Schedule">
              <DetailField label="Airline" value={`${flight.airline_name} (${flight.airline_code})`} />
              <DetailField label="Route" value={`${flight.origin} → ${flight.destination}`} />
              <DetailField label="Scheduled Departure" value={formatDateTime(flight.scheduled_departure)} />
              <DetailField label="Actual Departure" value={formatDateTime(flight.actual_departure)} />
              <DetailField label="Scheduled Arrival" value={formatDateTime(flight.scheduled_arrival)} />
              <DetailField label="Boarding Start" value={formatDateTime(flight.boarding_start_time)} />
              <DetailField label="Terminal / Gate" value={`${flight.terminal} / ${flight.gate}`} />
              <DetailField label="Delay" value={`${flight.delay_minutes}min ${flight.delay_reason ? `(${flight.delay_reason})` : ''}`} />
            </DetailSection>
            <DetailSection title="Aircraft">
              <DetailField label="Aircraft Type" value={flight.aircraft_type} />
              <DetailField label="Tail Number" value={flight.tail_number} />
              <DetailField label="Capacity" value={flight.capacity} />
              <DetailField label="Passengers Boarded" value={flight.passengers_boarded} />
              <DetailField label="Load Factor" value={formatPct(flight.load_factor_pct)} />
              <DetailField label="Fuel Efficiency" value={flight.fuel_efficiency} />
            </DetailSection>
            <DetailSection title="Commercial">
              <DetailField label="Revenue" value={formatINR(flight.revenue_inr)} />
              <DetailField label="Distance" value={`${flight.distance_km.toLocaleString('en-IN')} km`} />
              <DetailField label="Revenue / km" value={flight.revenue_per_km.toFixed(2)} />
              <DetailField label="Flight Category" value={flight.flight_category} />
              <DetailField label="Season" value={flight.season} />
            </DetailSection>
            <DetailSection title="Linked Records">
              <div className="flex flex-col gap-2">
                <LinkedCount label="Passengers" count={linked.passengers.length} onClick={() => setTab('passengers')} />
                <LinkedCount label="Baggage" count={linked.baggage.length} onClick={() => setTab('baggage')} />
                <LinkedCount label="Gate Events" count={linked.gateEvents.length} onClick={() => setTab('gate')} />
                <LinkedCount label="Maintenance Records" count={linked.maintenance.length} onClick={() => setTab('maintenance')} />
                <LinkedCount label="Retail Transactions" count={linked.retail.length} onClick={() => setTab('retail')} />
                <LinkedCount label="Staff Assigned" count={linked.staff.length} onClick={() => setTab('staff')} />
              </div>
            </DetailSection>
          </div>
        )}

        {tab === 'passengers' && (
          <ul className="flex flex-col gap-2">
            {linked.passengers.length === 0 && <p className="text-[13px] text-text-secondary">No passenger records linked.</p>}
            {linked.passengers.map((p) => (
              <li key={p.passenger_id} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <div className="flex justify-between"><span>{p.first_name} {p.last_name}</span><span className="font-data text-text-secondary">{p.seat_number}</span></div>
                <div className="text-text-secondary mt-1">{p.cabin_class} · {p.nationality} · sat {p.satisfaction_score.toFixed(1)}</div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'baggage' && (
          <ul className="flex flex-col gap-2">
            {linked.baggage.length === 0 && <p className="text-[13px] text-text-secondary">No baggage records linked.</p>}
            {linked.baggage.map((b) => (
              <li key={b.bag_tag} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <div className="flex justify-between font-data font-semibold text-accent-primary"><span>{b.bag_tag}</span><span className="text-text-primary">{b.weight_kg.toFixed(1)}kg</span></div>
                <div className="text-text-secondary mt-1">{b.status} · {b.handling_area} · {b.transfer_count} transfers</div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'gate' && (
          <ul className="flex flex-col gap-2">
            {linked.gateEvents.length === 0 && <p className="text-[13px] text-text-secondary">No gate events linked.</p>}
            {linked.gateEvents.map((g) => (
              <li key={g.event_id} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <div className="flex justify-between"><span>{g.event_type}</span><span className="font-data text-text-secondary">{formatDateTime(g.event_time)}</span></div>
                <div className="text-text-secondary mt-1">Gate {g.gate} · staff {g.staff_id} · {g.pax_count} pax</div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'maintenance' && (
          <ul className="flex flex-col gap-2">
            {linked.maintenance.length === 0 && <p className="text-[13px] text-text-secondary">No maintenance records linked.</p>}
            {linked.maintenance.map((m) => (
              <li key={m.work_order_id} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <div className="flex justify-between"><span>{m.work_order_id}</span><span>{m.duration_hrs}h</span></div>
                <div className="text-text-secondary mt-1">{m.defect_description} · sev {m.severity_level} · cleared: {String(m.cleared_to_fly)}</div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'retail' && (
          <ul className="flex flex-col gap-2">
            {linked.retail.length === 0 && <p className="text-[13px] text-text-secondary">No retail transactions linked.</p>}
            {linked.retail.map((r) => (
              <li key={r.transaction_id} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <div className="flex justify-between"><span>{r.product_category}</span><span className="font-data text-status-ok font-semibold">{formatINR(r.total_amount_inr)}</span></div>
                <div className="text-text-secondary mt-1">{r.store_type} · {formatDateTime(r.transaction_time)}</div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'staff' && (
          <ul className="flex flex-col gap-2">
            {linked.staff.length === 0 && <p className="text-[13px] text-text-secondary">No staff records linked.</p>}
            {linked.staff.map((st) => (
              <li key={st.staff_id} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px]">
                <div className="flex justify-between"><span>{st.name}</span><span className="font-data text-text-secondary">{st.staff_id}</span></div>
                <div className="text-text-secondary mt-1">{st.role} · {st.department} · {formatDuration(st.hours_worked * 60)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailPanel>
  );
}
