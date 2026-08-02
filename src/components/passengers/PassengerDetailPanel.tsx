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

  const retail = data.retailTransactions.filter((r) => r.pnr_code === passenger.pnr_code);

  const steps = [
    {
      id: 'booking',
      title: 'Booking Confirmed',
      status: 'ok',
      time: passenger.boarding_time ? new Date(passenger.boarding_time.getTime() - 48*3600*1000) : null,
      desc: `${flight?.airline_name || 'Unknown Airline'} • PNR: ${passenger.pnr_code} • ${passenger.cabin_class}`,
    },
    {
      id: 'checkin',
      title: 'Check-In',
      status: passenger.check_in_time ? 'ok' : 'pending',
      time: passenger.check_in_time,
      desc: passenger.check_in_time ? `Seat ${passenger.seat_number}` : 'Not checked in yet',
    },
    {
      id: 'baggage',
      title: 'Baggage Drop',
      status: baggage.length > 0 ? 'ok' : 'pending',
      time: baggage.length > 0 ? baggage[0].timestamp : null,
      desc: baggage.length > 0 ? `${baggage.length} bags checked (${baggage.reduce((acc,b)=>acc+b.weight_kg,0).toFixed(1)}kg)` : 'No checked bags',
    },
    {
      id: 'security',
      title: 'Security Screening',
      status: security.length > 0 ? (security.some(s => s.result === 'Clear') ? 'ok' : 'critical') : 'pending',
      time: security.length > 0 ? security[0].screening_time : null,
      desc: security.length > 0 ? `Lane ${security[0].lane_number} • Result: ${security[0].result}` : 'Not cleared',
    },
    {
      id: 'retail',
      title: 'Retail & Duty Free',
      status: retail.length > 0 ? 'info' : 'pending',
      time: retail.length > 0 ? retail[0].transaction_time : null,
      desc: retail.length > 0 ? `${retail.length} transactions (Latest: ${retail[0].store_type})` : 'No purchases',
    },
    {
      id: 'boarding',
      title: 'Boarding',
      status: passenger.boarding_time ? 'ok' : 'pending',
      time: passenger.boarding_time,
      desc: passenger.boarding_time ? `Gate ${passenger.gate}` : 'Not boarded yet',
    },
  ];

  const statusColors: Record<string, string> = {
    'ok': 'border-status-ok bg-status-ok/10',
    'critical': 'border-status-critical bg-status-critical/10',
    'info': 'border-accent-primary bg-accent-primary/10',
    'pending': 'border-border bg-bg-card opacity-50',
  };

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

        <DetailSection title="Passenger Journey Timeline">
          <div className="flex flex-col gap-3 mt-2">
            {steps.map((step, i) => (
              <div key={step.id} className={`flex items-start rounded-md border-l-4 p-3 ${statusColors[step.status]} transition-all`}>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[13px] font-bold text-text-primary">{i + 1}. {step.title}</span>
                    <span className="text-[11px] font-data text-text-secondary">{formatDateTime(step.time) || '--'}</span>
                  </div>
                  <span className="text-[11px] text-text-secondary">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>
    </DetailPanel>
  );
}
