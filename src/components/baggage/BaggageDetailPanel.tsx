import { useMemo } from 'react';
import type { Baggage } from '@/types';
import { useData } from '@/context/DataContext';
import DetailPanel from '@/components/common/DetailPanel';
import { DetailField, DetailSection } from '@/components/common/DetailField';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';
import { isSimOverweight } from '@/utils/crossJoin';

interface BaggageDetailPanelProps {
  baggage: Baggage | null;
  onClose: () => void;
  onSelectFlight?: (flightId: string) => void;
  onSelectPassenger?: (passengerId: string) => void;
}

export default function BaggageDetailPanel({
  baggage,
  onClose,
  onSelectFlight,
  onSelectPassenger,
}: BaggageDetailPanelProps) {
  const data = useData();

  const linkedInfo = useMemo(() => {
    if (!baggage) return null;
    const passenger = data.passengers.find((p) => p.passenger_id === baggage.passenger_id);
    const flight = data.flights.find((f) => f.flight_id === baggage.flight_id);
    return { passenger, flight };
  }, [data, baggage]);

  if (!baggage) return null;

  const { passenger, flight } = linkedInfo ?? {};
  const isOverweight = isSimOverweight(baggage, passenger?.cabin_class);

  return (
    <DetailPanel isOpen={!!baggage} onClose={onClose} title={`Bag: ${baggage.bag_tag}`}>
      {/* Sticky Header info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusBadge status={baggage.status} variant="ok" />
          {isOverweight && <StatusBadge status="Overweight" variant="critical" />}
          {baggage.is_damaged && <StatusBadge status="Damaged" variant="critical" />}
          {!isOverweight && !baggage.is_damaged && <StatusBadge status="Clear" variant="ok" />}
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 p-3 rounded-lg border border-border/50 mb-4 font-data">
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Weight</span>
            <span className={`text-[13px] font-bold ${isOverweight ? 'text-status-critical' : 'text-accent-primary'}`}>{baggage.weight_kg.toFixed(1)}kg</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Location</span>
            <span className="text-[13px] font-bold text-accent-primary truncate max-w-full">{baggage.location_code}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Transfers</span>
            <span className="text-[13px] font-bold text-status-warning">{baggage.transfer_count}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DetailSection title="Baggage Info">
          <DetailField label="Bag Tag" value={baggage.bag_tag} className="font-data" />
          <DetailField label="PNR Code" value={baggage.pnr_code} className="font-data" />
          <DetailField label="Dimensions" value={baggage.dimensions} />
          <DetailField label="Drop Point" value={baggage.drop_point} />
          <DetailField label="Handling Area" value={baggage.handling_area} />
          <DetailField label="Timestamp" value={formatDateTime(baggage.timestamp)} />
          <DetailField label="Last Scanned" value={formatDateTime(baggage.last_scanned)} />
        </DetailSection>

        {passenger && (
          <DetailSection title="Linked Passenger">
            <DetailField label="Passenger ID" value={passenger.passenger_id} className="font-data text-accent-primary cursor-pointer hover:underline" onClick={() => onSelectPassenger?.(passenger.passenger_id)} />
            <DetailField label="Name" value={`${passenger.first_name} ${passenger.last_name}`} />
            <DetailField label="Cabin Class" value={passenger.cabin_class} />
            <DetailField label="Frequent Flyer" value={passenger.is_frequent_flyer ? 'Yes' : 'No'} />
          </DetailSection>
        )}

        {flight && (
          <DetailSection title="Linked Flight">
            <DetailField label="Flight ID" value={flight.flight_id} className="font-data text-accent-primary cursor-pointer hover:underline" onClick={() => onSelectFlight?.(flight.flight_id)} />
            <DetailField label="Airline" value={flight.airline_name} />
            <DetailField label="Route" value={`${flight.origin} → ${flight.destination}`} />
            <DetailField label="Scheduled Departure" value={formatDateTime(flight.scheduled_departure)} />
          </DetailSection>
        )}

        {baggage.is_damaged && (
          <DetailSection title="Damage Log">
            <div className="rounded border border-status-critical/30 bg-status-critical/5 p-2.5 text-[12px] text-status-critical">
              {baggage.damage_notes || 'Damage reported, no notes provided.'}
            </div>
          </DetailSection>
        )}
      </div>
    </DetailPanel>
  );
}
