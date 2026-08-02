import { useMemo } from 'react';
import type { Passenger } from '@/types';
import { useData } from '@/context/DataContext';
import DetailPanel from '@/components/common/DetailPanel';
import { DetailField, DetailSection } from '@/components/common/DetailField';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';
import { passengerBaggage, passengerSecurity } from '@/utils/crossJoin';

interface PassengerDetailPanelProps {
  passenger: Passenger | null;
  onClose: () => void;
  onSelectFlight?: (flightId: string) => void;
  onSelectBag?: (bagTag: string) => void;
}

export default function PassengerDetailPanel({
  passenger,
  onClose,
  onSelectFlight,
  onSelectBag,
}: PassengerDetailPanelProps) {
  const data = useData();

  const linked = useMemo(() => {
    if (!passenger) return null;
    const flight = data.flights.find((f) => f.flight_id === passenger.flight_id);
    const baggage = passengerBaggage(data, passenger);
    const security = passengerSecurity(data, passenger);
    return { flight, baggage, security };
  }, [data, passenger]);

  if (!passenger || !linked) return null;

  const { flight, baggage, security } = linked;
  const isUpgraded = passenger.cabin_class !== passenger.booked_class || passenger.is_upgrade;

  return (
    <DetailPanel isOpen={!!passenger} onClose={onClose} title={`Passenger: ${passenger.first_name} ${passenger.last_name}`}>
      {/* Sticky Header info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusBadge status={passenger.cabin_class} variant="info" />
          {isUpgraded && <StatusBadge status="Upgraded" variant="warning" />}
          {passenger.is_frequent_flyer && <StatusBadge status="Frequent Flyer" variant="ok" />}
          <StatusBadge
            status={`Sat: ${passenger.satisfaction_score.toFixed(1)}/5.0`}
            variant={passenger.satisfaction_score >= 3 ? 'ok' : passenger.satisfaction_score >= 1 ? 'warning' : 'critical'}
          />
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 p-3 rounded-lg border border-border/50 mb-4 font-data">
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Seat</span>
            <span className="text-[13px] font-bold text-accent-primary">{passenger.seat_number}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Flight</span>
            <span className="text-[13px] font-bold text-accent-primary truncate max-w-full cursor-pointer hover:underline" onClick={() => onSelectFlight?.(passenger.flight_id)}>
              {passenger.flight_id}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Bags</span>
            <span className="text-[13px] font-bold text-status-warning">{passenger.bags_count}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DetailSection title="Personal Details">
          <DetailField label="Passenger ID" value={passenger.passenger_id} className="font-data" />
          <DetailField label="Nationality" value={passenger.nationality} />
          <DetailField label="Age" value={`${passenger.age} (${passenger.age_group})`} />
          <DetailField label="Gender" value={passenger.gender} />
          <DetailField label="Email" value={passenger.email} />
          <DetailField label="Phone" value={passenger.phone} />
        </DetailSection>

        <DetailSection title="Journey Details">
          {flight && <DetailField label="Airline" value={flight.airline_name} />}
          <DetailField label="PNR Code" value={passenger.pnr_code} className="font-data" />
          <DetailField label="Check-In Time" value={formatDateTime(passenger.check_in_time)} />
          <DetailField label="Boarding Time" value={formatDateTime(passenger.boarding_time)} />
          <DetailField label="Boarding Gate" value={passenger.gate} className="font-data" />
        </DetailSection>

        <DetailSection title={`Linked Baggage (${baggage.length})`}>
          {baggage.length === 0 ? (
            <p className="text-[12px] text-text-secondary">No baggage records linked to PNR.</p>
          ) : (
            <div className="flex flex-col gap-1.5 mt-2">
              {baggage.map((b) => (
                <div key={b.bag_tag} className="rounded border border-border bg-bg-elevated px-2 py-1 text-[12px] flex justify-between items-center">
                  <div>
                    <span className="font-data font-semibold text-accent-primary cursor-pointer hover:underline" onClick={() => onSelectBag?.(b.bag_tag)}>{b.bag_tag}</span>
                    <span className="text-text-secondary"> · {b.status}</span>
                  </div>
                  <span className="font-data text-text-secondary">{b.weight_kg.toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          )}
        </DetailSection>

        <DetailSection title={`Security Screening (${security.length})`}>
          {security.length === 0 ? (
            <p className="text-[12px] text-text-secondary">No security screenings recorded.</p>
          ) : (
            <div className="flex flex-col gap-1.5 mt-2">
              {security.map((s) => (
                <div key={s.screening_id} className="rounded border border-border bg-bg-elevated px-2 py-1.5 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="font-data font-semibold">{s.screening_id} (Lane {s.lane_number})</span>
                    <StatusBadge status={s.result} variant={s.result === 'Clear' ? 'ok' : 'critical'} />
                  </div>
                  <div className="text-text-secondary mt-1">
                    Time: {formatDateTime(s.screening_time)} · duration: {s.processing_seconds}s
                  </div>
                  {s.is_flagged && (
                    <div className="text-status-critical mt-1 text-[11px] font-semibold">
                      Flagged: {s.flag_reason || 'Reason not specified'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DetailSection>
      </div>
    </DetailPanel>
  );
}
