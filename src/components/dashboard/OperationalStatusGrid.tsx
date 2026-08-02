import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlaneTakeoff, DoorOpen, Luggage, Users, ShieldCheck, Wrench, UserCog, ShoppingBag,
} from 'lucide-react';
import type { AllData } from '@/types';
import { formatINR, formatPct } from '@/utils/formatters';
import type { StatusVariant } from '@/utils/colorMapping';

interface Props {
  data: AllData;
  kpis: ReturnType<typeof import('@/utils/calculations').computeDashboardKPIs>;
}

const CARD_STYLE: Record<StatusVariant, string> = {
  ok: 'border-l-status-ok', warning: 'border-l-status-warning', critical: 'border-l-status-critical',
  inactive: 'border-l-status-inactive', info: 'border-l-accent-primary',
};

function ModuleCard({
  icon: Icon, label, metric, sub, variant, onClick,
}: { icon: React.ElementType; label: string; metric: string; sub: string; variant: StatusVariant; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-lg border border-border border-l-4 ${CARD_STYLE[variant]} bg-bg-card p-4 text-left transition-colors hover:bg-bg-elevated hover:border-accent-primary focus:outline-none`}
    >
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-text-secondary" aria-hidden="true" />
        <span className="text-[11px] uppercase tracking-wide text-text-secondary">{label}</span>
      </div>
      <div className="font-data text-[22px] font-bold text-text-primary">{metric}</div>
      <div className="text-[12px] text-text-secondary">{sub}</div>
    </button>
  );
}

export default function OperationalStatusGrid({ data, kpis }: Props) {
  const navigate = useNavigate();
  const uniqueGates = new Set(data.flights.map((f) => f.gate)).size;
  const overtimeCount = data.staffShifts.filter((s) => s.is_overtime).length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <ModuleCard
        icon={PlaneTakeoff} label="Flights" metric={`${kpis.onTimeRate.toFixed(1)}%`}
        sub={`${kpis.delayedFlights} delayed of ${kpis.totalFlights}`}
        variant={kpis.onTimeRate >= 70 ? 'ok' : 'warning'} onClick={() => navigate('/flights')}
      />
      <ModuleCard
        icon={DoorOpen} label="Gates" metric={`${uniqueGates}/50`}
        sub={`${data.gateEvents.length} gate events logged`}
        variant="ok" onClick={() => navigate('/gates')}
      />
      <ModuleCard
        icon={Luggage} label="Baggage" metric={kpis.totalBags.toLocaleString('en-IN')}
        sub={`avg ${kpis.avgBagWeight.toFixed(1)}kg per bag`}
        variant="ok" onClick={() => navigate('/baggage')}
      />
      <ModuleCard
        icon={Users} label="Passengers" metric={kpis.totalPassengers.toLocaleString('en-IN')}
        sub={`${kpis.frequentFlyers} frequent flyers`}
        variant="info" onClick={() => navigate('/passengers')}
      />
      <ModuleCard
        icon={ShieldCheck} label="Security" metric={formatPct(kpis.clearRate)}
        sub={`${kpis.totalScreenings.toLocaleString('en-IN')} screened`}
        variant={kpis.clearRate >= 95 ? 'ok' : 'warning'} onClick={() => navigate('/security')}
      />
      <ModuleCard
        icon={Wrench} label="Maintenance" metric={String(kpis.aogCount)}
        sub={`${kpis.holdCount} not cleared to fly`}
        variant={kpis.aogCount > 0 ? 'critical' : kpis.holdCount > 0 ? 'warning' : 'ok'} onClick={() => navigate('/maintenance')}
      />
      <ModuleCard
        icon={UserCog} label="Staff" metric={kpis.totalStaff.toLocaleString('en-IN')}
        sub={`${overtimeCount} on overtime`}
        variant={overtimeCount > 0 ? 'warning' : 'ok'} onClick={() => navigate('/staff')}
      />
      <ModuleCard
        icon={ShoppingBag} label="Retail" metric={formatINR(kpis.totalRetailRevenue)}
        sub={`${data.retailTransactions.length.toLocaleString('en-IN')} transactions`}
        variant="info" onClick={() => navigate('/retail')}
      />
    </div>
  );
}
