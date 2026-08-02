import React, { useMemo } from 'react';
import { PlaneTakeoff, Clock3, AlertTriangle, Users, IndianRupee } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAlerts } from '@/context/AlertContext';
import KPICard from '@/components/common/KPICard';
import AlertFeed from '@/components/common/AlertFeed';
import ChartWrapper from '@/components/common/ChartWrapper';
import { computeDashboardKPIs } from '@/utils/calculations';
import { formatINR, formatPct } from '@/utils/formatters';
import OperationalStatusGrid from './OperationalStatusGrid';
import FlightActivityTimeline from './FlightActivityTimeline';
import DelayBreakdownChart from './DelayBreakdownChart';
import QuickStatsRow from './QuickStatsRow';

export default function DashboardPage() {
  const data = useData();
  const { alerts } = useAlerts();
  const kpis = useMemo(() => computeDashboardKPIs(data), [data]);

  // Unresolved active alerts for dashboard view
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => a.status !== 'Resolved' && a.status !== 'Closed');
  }, [alerts]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Operations Dashboard</h1>

      <section aria-label="Airport-wide KPIs" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KPICard label="Total Flights" value={kpis.totalFlights} icon={PlaneTakeoff} statusColor="info" />
        <KPICard label="On-Time Rate" value={kpis.onTimeRate} decimals={1} unit="%" icon={Clock3} statusColor={kpis.onTimeRate >= 70 ? 'ok' : 'warning'} />
        <KPICard label="Delayed Flights" value={kpis.delayedFlights} icon={AlertTriangle} statusColor={kpis.delayedFlights > 0 ? 'warning' : 'ok'} />
        <KPICard label="Total Passengers" value={kpis.totalPassengers} icon={Users} statusColor="info" />
        <KPICard label="Active Alerts" value={activeAlerts.length} icon={AlertTriangle} statusColor={activeAlerts.length > 0 ? 'critical' : 'ok'} />
      </section>

      <section aria-label="Module operational status">
        <h2 className="mb-3 text-[20px] font-semibold text-text-primary">Operational Status Grid</h2>
        <OperationalStatusGrid data={data} kpis={kpis} />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWrapper title="Flight Activity Timeline" height={320}>
            <FlightActivityTimeline flights={data.flights} />
          </ChartWrapper>
        </div>
        <div className="flex flex-col h-full">
          <div className="rounded-lg border border-border bg-bg-card p-4 flex flex-col h-full justify-between">
            <h3 className="mb-3 text-[16px] font-semibold text-text-primary flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-critical opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-critical"></span>
              </span>
              Live Alert Feed
            </h3>
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              <AlertFeed alerts={activeAlerts} limit={12} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartWrapper title="Delay Reason Breakdown" height={220}>
          <DelayBreakdownChart flights={data.flights} />
        </ChartWrapper>
        <div className="flex flex-col h-full">
          <div className="rounded-lg border border-border bg-bg-card p-4 flex flex-col h-full justify-between">
            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-text-primary">Quick Stats</h3>
              <QuickStatsRow kpis={kpis} />
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only">
        Today's flight revenue {formatINR(kpis.totalFlightRevenue)}, average load factor {formatPct(kpis.avgLoadFactor)}.
      </p>
    </div>
  );
}
