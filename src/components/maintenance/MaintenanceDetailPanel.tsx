import { useMemo } from 'react';
import type { MaintenanceLog } from '@/types';
import { useData } from '@/context/DataContext';
import DetailPanel from '@/components/common/DetailPanel';
import { DetailField, DetailSection } from '@/components/common/DetailField';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

interface MaintenanceDetailPanelProps {
  log: MaintenanceLog | null;
  onClose: () => void;
  onSelectFlight?: (flightId: string) => void;
}

export default function MaintenanceDetailPanel({
  log,
  onClose,
  onSelectFlight,
}: MaintenanceDetailPanelProps) {
  const data = useData();

  const flight = useMemo(() => {
    if (!log) return null;
    return data.flights.find((f) => f.flight_id === log.flight_id || f.tail_number === log.tail_number);
  }, [data, log]);

  if (!log) return null;

  return (
    <DetailPanel isOpen={!!log} onClose={onClose} title={`Work Order: ${log.work_order_id}`}>
      {/* Sticky Header info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusBadge status={log.cleared_to_fly ? 'Cleared to Fly' : 'Ground Hold'} variant={log.cleared_to_fly ? 'ok' : 'critical'} />
          <StatusBadge status={log.is_aog ? 'AOG (Critical)' : 'Normal Status'} variant={log.is_aog ? 'critical' : 'inactive'} />
          <StatusBadge status={`Severity: Level ${log.severity_level}`} variant={log.severity_level >= 4 ? 'critical' : log.severity_level >= 3 ? 'warning' : 'info'} />
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 p-3 rounded-lg border border-border/50 mb-4 font-data">
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Tail #</span>
            <span className="text-[13px] font-bold text-accent-primary">{log.tail_number}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Duration</span>
            <span className="text-[13px] font-bold text-accent-primary">{log.duration_hrs}h</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Parts</span>
            <span className="text-[13px] font-bold text-status-warning">{log.parts_used_count}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DetailSection title="Aircraft and Log Info">
          <DetailField label="Work Order ID" value={log.work_order_id} className="font-data" />
          <DetailField label="Maintenance Type" value={log.maintenance_type} />
          <DetailField label="Technician ID" value={log.technician_id} className="font-data" />
          <DetailField label="Supervisor ID" value={log.supervisor_id} className="font-data" />
          <DetailField label="Start Time" value={formatDateTime(log.start_time)} />
          <DetailField label="End Time" value={formatDateTime(log.end_time)} />
        </DetailSection>

        <DetailSection title="Defect & Resolution">
          <DetailField label="Reported Defect" value={log.defect_description} />
          <DetailField label="Action Taken" value={log.repair_action} />
          <DetailField label="Inspector Notes" value={log.notes || 'Routine check complete. No discrepancies found.'} />
        </DetailSection>

        {flight && (
          <DetailSection title="Linked Flight Details">
            <DetailField label="Flight ID" value={flight.flight_id} className="font-data text-accent-primary cursor-pointer hover:underline" onClick={() => onSelectFlight?.(flight.flight_id)} />
            <DetailField label="Airline" value={flight.airline_name} />
            <DetailField label="Route" value={`${flight.origin} → ${flight.destination}`} />
            <DetailField label="Scheduled Departure" value={formatDateTime(flight.scheduled_departure)} />
            <DetailField label="Flight Status" value={flight.status} />
          </DetailSection>
        )}
      </div>
    </DetailPanel>
  );
}
