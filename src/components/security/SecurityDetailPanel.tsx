import { useMemo } from 'react';
import type { SecurityScreening } from '@/types';
import { useData } from '@/context/DataContext';
import DetailPanel from '@/components/common/DetailPanel';
import { DetailField, DetailSection } from '@/components/common/DetailField';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

interface SecurityDetailPanelProps {
  screening: SecurityScreening | null;
  onClose: () => void;
  onSelectPassenger?: (passengerId: string) => void;
}

export default function SecurityDetailPanel({
  screening,
  onClose,
  onSelectPassenger,
}: SecurityDetailPanelProps) {
  const data = useData();

  const passenger = useMemo(() => {
    if (!screening) return null;
    return data.passengers.find((p) => p.passenger_id === screening.passenger_id);
  }, [data, screening]);

  if (!screening) return null;

  return (
    <DetailPanel isOpen={!!screening} onClose={onClose} title={`Screening: ${screening.screening_id}`}>
      {/* Sticky Header info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusBadge status={screening.result} variant={screening.result === 'Clear' ? 'ok' : 'critical'} />
          {screening.is_flagged && <StatusBadge status="Flagged" variant="critical" />}
          {screening.alert_triggered && <StatusBadge status="ALERT TRIGGERED" variant="critical" />}
          {screening.is_random && <StatusBadge status="Random Check" variant="info" />}
          {screening.is_peak && <StatusBadge status="Peak Hour" variant="warning" />}
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 p-3 rounded-lg border border-border/50 mb-4 font-data">
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Lane</span>
            <span className="text-[13px] font-bold text-accent-primary">Lane {screening.lane_number}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Duration</span>
            <span className="text-[13px] font-bold text-accent-primary">{screening.processing_seconds}s</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Random</span>
            <span className="text-[13px] font-bold text-status-warning">{screening.is_random ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DetailSection title="Screening Audit Details">
          <DetailField label="Screening ID" value={screening.screening_id} className="font-data" />
          <DetailField label="Shift ID" value={screening.shift_id} className="font-data" />
          <DetailField label="Equipment ID" value={screening.equipment_id} className="font-data" />
          <DetailField label="Officer (Staff ID)" value={screening.staff_id} className="font-data" />
          <DetailField label="Screening Time" value={formatDateTime(screening.screening_time)} />
          <DetailField label="Cleared Time" value={formatDateTime(screening.cleared_time)} />
        </DetailSection>

        {passenger && (
          <DetailSection title="Linked Passenger">
            <DetailField label="Passenger ID" value={passenger.passenger_id} className="font-data text-accent-primary cursor-pointer hover:underline" onClick={() => onSelectPassenger?.(passenger.passenger_id)} />
            <DetailField label="Name" value={`${passenger.first_name} ${passenger.last_name}`} />
            <DetailField label="PNR Code" value={passenger.pnr_code} className="font-data" />
            <DetailField label="Cabin Class" value={passenger.cabin_class} />
            <DetailField label="Flight ID" value={passenger.flight_id} className="font-data" />
          </DetailSection>
        )}

        {(screening.is_flagged || screening.alert_triggered) && (
          <DetailSection title="Security Alert Reason">
            <div className="rounded border border-status-critical/30 bg-status-critical/5 p-2.5 text-[12px] text-status-critical">
              <span className="font-semibold block mb-1">Flagged Incident Report:</span>
              {screening.flag_reason || 'Manual security overrides / alert triggers identified during scanning.'}
            </div>
          </DetailSection>
        )}
      </div>
    </DetailPanel>
  );
}
