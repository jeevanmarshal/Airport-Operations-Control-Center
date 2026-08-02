import { useMemo } from 'react';
import type { StaffShift } from '@/types';
import { useData } from '@/context/DataContext';
import { useSimulation } from '@/context/SimulationContext';
import DetailPanel from '@/components/common/DetailPanel';
import { DetailField, DetailSection } from '@/components/common/DetailField';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';
import { staffGateEvents, staffScreenings } from '@/utils/crossJoin';

interface StaffDetailPanelProps {
  staff: StaffShift | null;
  onClose: () => void;
  onSelectEvent?: (eventId: string) => void;
  onSelectScreening?: (screeningId: string) => void;
}

export default function StaffDetailPanel({
  staff,
  onClose,
  onSelectEvent,
  onSelectScreening,
}: StaffDetailPanelProps) {
  const data = useData();
  const { simulatedNow } = useSimulation();

  const linked = useMemo(() => {
    if (!staff) return null;
    const supervisor = data.staffShifts.find((s) => s.staff_id === staff.supervisor_id);
    const gateEvents = staffGateEvents(data, staff.staff_id);
    const screenings = staffScreenings(data, staff.staff_id);
    return { supervisor, gateEvents, screenings };
  }, [data, staff]);

  if (!staff || !linked) return null;

  const { supervisor, gateEvents, screenings } = linked;

  const expiryDate = staff.certification_expiry;
  const isExpired = expiryDate ? expiryDate.getTime() < simulatedNow.getTime() : false;
  const isExpiringSoon = expiryDate
    ? !isExpired && (expiryDate.getTime() - simulatedNow.getTime()) / (1000 * 60 * 60 * 24) <= 30
    : false;

  return (
    <DetailPanel isOpen={!!staff} onClose={onClose} title={`Staff: ${staff.name}`}>
      {/* Sticky Header info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusBadge status={staff.department} variant="info" />
          <StatusBadge status={staff.role} variant="inactive" />
          {staff.is_overtime && <StatusBadge status="Overtime Active" variant="warning" />}
          {isExpired && <StatusBadge status="CERT EXPIRED" variant="critical" />}
          {isExpiringSoon && <StatusBadge status="Cert Expiring Soon" variant="warning" />}
          {!isExpired && !isExpiringSoon && <StatusBadge status="Cert Active" variant="ok" />}
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-bg-elevated/40 p-3 rounded-lg border border-border/50 mb-4 font-data">
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Gate</span>
            <span className="text-[13px] font-bold text-accent-primary">{staff.gate || 'N/A'}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Hours</span>
            <span className="text-[13px] font-bold text-accent-primary">{staff.hours_worked}h</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-bg-card rounded border border-border/40 text-center">
            <span className="text-[9px] uppercase text-text-secondary tracking-wider">Screenings</span>
            <span className="text-[13px] font-bold text-status-warning">{screenings.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DetailSection title="Staff Information">
          <DetailField label="Staff ID" value={staff.staff_id} className="font-data" />
          <DetailField label="Languages" value={staff.language} />
          {supervisor && <DetailField label="Supervisor" value={`${supervisor.name} (${staff.supervisor_id})`} />}
        </DetailSection>

        <DetailSection title="Shift Details">
          <DetailField label="Shift Date" value={staff.shift_date ? new Date(staff.shift_date).toLocaleDateString() : 'N/A'} />
          <DetailField label="Shift Start" value={formatDateTime(staff.shift_start)} />
          <DetailField label="Shift End" value={formatDateTime(staff.shift_end)} />
          {staff.is_overtime && staff.overtime_hours && (
            <DetailField label="Overtime Hours" value={`${staff.overtime_hours} hrs`} className="text-status-warning font-bold" />
          )}
          <DetailField label="Assigned Terminal" value={staff.terminal} className="font-data" />
        </DetailSection>

        <DetailSection title="Certification Details">
          <div className={`rounded border p-2.5 text-[12px] ${isExpired ? 'border-status-critical bg-status-critical/5 text-status-critical' : isExpiringSoon ? 'border-status-warning bg-status-warning/5 text-status-warning' : 'border-border bg-bg-elevated text-text-primary'}`}>
            <span className="font-bold block mb-1">Safety & Operations Certification:</span>
            Expires: {expiryDate ? expiryDate.toLocaleDateString() : 'N/A'}
            {isExpired && <span className="block mt-1 font-semibold">CRITICAL: Staff member is on shift with an expired certification.</span>}
            {isExpiringSoon && <span className="block mt-1 font-semibold">WARNING: Certification renewal required within 30 days.</span>}
          </div>
        </DetailSection>

        <DetailSection title={`Linked Gate Events (${gateEvents.length})`}>
          {gateEvents.length === 0 ? (
            <p className="text-[12px] text-text-secondary">No gate events assigned.</p>
          ) : (
            <div className="flex flex-col gap-1.5 mt-2">
              {gateEvents.map((g) => (
                <div key={g.event_id} className="rounded border border-border bg-bg-elevated px-2 py-1 text-[12px] flex justify-between items-center">
                  <div>
                    <span className="font-data font-semibold text-accent-primary cursor-pointer hover:underline" onClick={() => onSelectEvent?.(g.event_id)}>{g.event_type}</span>
                    <span className="text-text-secondary"> · Gate {g.gate}</span>
                  </div>
                  <span className="font-data text-text-secondary">{g.flight_id}</span>
                </div>
              ))}
            </div>
          )}
        </DetailSection>

        <DetailSection title={`Linked Security Screenings (${screenings.length})`}>
          {screenings.length === 0 ? (
            <p className="text-[12px] text-text-secondary">No screenings audited under this staff ID.</p>
          ) : (
            <div className="flex flex-col gap-1.5 mt-2">
              {screenings.map((sc) => (
                <div key={sc.screening_id} className="rounded border border-border bg-bg-elevated px-2 py-1 text-[12px] flex justify-between items-center">
                  <div>
                    <span className="font-data font-semibold text-accent-primary cursor-pointer hover:underline" onClick={() => onSelectScreening?.(sc.screening_id)}>{sc.screening_id}</span>
                    <span className="text-text-secondary"> · Lane {sc.lane_number}</span>
                  </div>
                  <span className="font-data text-text-secondary">{sc.result}</span>
                </div>
              ))}
            </div>
          )}
        </DetailSection>
      </div>
    </DetailPanel>
  );
}
