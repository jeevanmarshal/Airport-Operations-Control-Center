import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import KPICard from '@/components/common/KPICard';
import { Shield, ShieldAlert, ShieldCheck, Clock, Users } from 'lucide-react';
import SecurityDetailPanel from './SecurityDetailPanel';
import type { SecurityScreening } from '@/types';

export default function SecurityPage() {
  const { securityScreenings, raw, isLoading } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selectedScreening, setSelectedScreening] = useState<SecurityScreening | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = params.get('search');
    if (q) setSearch(q);
  }, [params]);

  useEffect(() => {
    const q = params.get('search');
    if (q && raw.securityScreenings.length) {
      const match = raw.securityScreenings.find((s) => s.screening_id === q || s.passenger_id === q);
      if (match) setSelectedScreening(match);
    }
  }, [params, raw.securityScreenings]);

  // Compute lane-specific metrics dynamically
  const laneMetrics = useMemo(() => {
    const metricsMap: Record<number, { count: number; cleared: number; flagged: number; alert: number; sumTime: number }> = {};
    for (let i = 1; i <= 8; i++) {
      metricsMap[i] = { count: 0, cleared: 0, flagged: 0, alert: 0, sumTime: 0 };
    }

    for (const sc of securityScreenings) {
      const lane = sc.lane_number;
      if (metricsMap[lane]) {
        metricsMap[lane].count++;
        if (sc.result === 'Clear') metricsMap[lane].cleared++;
        if (sc.is_flagged) metricsMap[lane].flagged++;
        if (sc.alert_triggered) metricsMap[lane].alert++;
        metricsMap[lane].sumTime += sc.processing_seconds;
      }
    }

    return Object.entries(metricsMap).map(([lane, data]) => ({
      laneNumber: parseInt(lane, 10),
      ...data,
      avgTime: data.count ? data.sumTime / data.count : 0,
      clearRate: data.count ? (data.cleared / data.count) * 100 : 0,
    }));
  }, [securityScreenings]);

  // Overall KPIs
  const stats = useMemo(() => {
    let clearedCount = 0;
    let flaggedCount = 0;
    let alertCount = 0;
    let sumTime = 0;

    for (const sc of securityScreenings) {
      if (sc.result === 'Clear') clearedCount++;
      if (sc.is_flagged) flaggedCount++;
      if (sc.alert_triggered) alertCount++;
      sumTime += sc.processing_seconds;
    }

    const avgTime = securityScreenings.length ? sumTime / securityScreenings.length : 0;

    return {
      total: securityScreenings.length,
      cleared: clearedCount,
      flagged: flaggedCount,
      alert: alertCount,
      avgTime,
    };
  }, [securityScreenings]);

  const filterDefs = useMemo(() => {
    const lanes = Array.from(new Set(securityScreenings.map((sc) => sc.lane_number))).sort((a, b) => a - b);
    const results = Array.from(new Set(securityScreenings.map((sc) => sc.result)));
    const shifts = Array.from(new Set(securityScreenings.map((sc) => sc.shift_id)));

    return [
      {
        key: 'lane_number',
        label: 'Security Lane',
        options: [{ label: 'All Lanes', value: 'ALL' }, ...lanes.map((l) => ({ label: `Lane ${l}`, value: l }))],
      },
      {
        key: 'result',
        label: 'Result',
        options: [{ label: 'All', value: 'ALL' }, ...results.map((r) => ({ label: r, value: r }))],
      },
      {
        key: 'is_flagged',
        label: 'Flagged Status',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Flagged Only', value: 'true' },
          { label: 'Clear Only', value: 'false' },
        ],
      },
      {
        key: 'alert_triggered',
        label: 'Alarm Triggered',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Alarm Triggered', value: 'true' },
          { label: 'No Alarm', value: 'false' },
        ],
      },
      {
        key: 'shift_id',
        label: 'Shift',
        options: [{ label: 'All', value: 'ALL' }, ...shifts.map((s) => ({ label: s, value: s }))],
      },
    ];
  }, [securityScreenings]);

  const filterPredicates = useMemo(() => {
    return {
      lane_number: (sc: SecurityScreening, v: unknown) => sc.lane_number === Number(v),
      result: (sc: SecurityScreening, v: unknown) => sc.result === v,
      is_flagged: (sc: SecurityScreening, v: unknown) => sc.is_flagged === (v === 'true'),
      alert_triggered: (sc: SecurityScreening, v: unknown) => sc.alert_triggered === (v === 'true'),
      shift_id: (sc: SecurityScreening, v: unknown) => sc.shift_id === v,
    };
  }, []);

  const sortAccessor = (sc: SecurityScreening, key: string) => {
    switch (key) {
      case 'processing_seconds': return sc.processing_seconds;
      case 'screening_time': return sc.screening_time ?? 0;
      case 'screening_id': return sc.screening_id;
      default: return '';
    }
  };

  const {
    filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total,
  } = useFilter<SecurityScreening>({
    data: search ? raw.securityScreenings : securityScreenings,
    searchFields: [(sc) => sc.screening_id, (sc) => sc.passenger_id, (sc) => sc.pnr_code, (sc) => sc.staff_id, (sc) => sc.equipment_id],
    sortAccessor,
    filterPredicates,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  const columns: ColumnDef<SecurityScreening>[] = [
    {
      key: 'screening_id',
      header: 'Screening ID',
      sortable: true,
      render: (sc) => <span className="font-data font-semibold text-accent-primary">{sc.screening_id}</span>,
    },
    {
      key: 'passenger_id',
      header: 'Passenger ID',
      className: 'hidden sm:table-cell',
      render: (sc) => <span className="font-data">{sc.passenger_id}</span>,
    },
    {
      key: 'pnr_code',
      header: 'PNR Code',
      className: 'hidden md:table-cell',
      render: (sc) => <span className="font-data">{sc.pnr_code}</span>,
    },
    {
      key: 'lane_number',
      header: 'Lane',
      render: (sc) => <span className="font-data font-semibold">Lane {sc.lane_number}</span>,
    },
    {
      key: 'equipment_id',
      header: 'Equip ID',
      className: 'hidden lg:table-cell',
      render: (sc) => <span className="font-data text-text-secondary">{sc.equipment_id}</span>,
    },
    {
      key: 'processing_seconds',
      header: 'Duration',
      sortable: true,
      className: 'text-right',
      render: (sc) => <span className="font-data">{sc.processing_seconds}s</span>,
    },
    {
      key: 'result',
      header: 'Result',
      render: (sc) => (
        <div className="flex gap-1">
          <StatusBadge status={sc.result} variant={sc.result === 'Clear' ? 'ok' : 'critical'} />
          {sc.is_flagged && <StatusBadge status="Flagged" variant="critical" />}
          {sc.alert_triggered && <StatusBadge status="Alarm" variant="critical" />}
        </div>
      ),
    },
    {
      key: 'screening_time',
      header: 'Screening Time',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (sc) => <span className="font-data text-text-secondary">{sc.screening_time ? new Date(sc.screening_time).toLocaleTimeString() : 'N/A'}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Security Screening lane monitor</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KPICard label="Total Screened" value={stats.total} icon={Users} statusColor="ok" />
        <KPICard label="Clear Result" value={stats.cleared} icon={ShieldCheck} statusColor="ok" />
        <KPICard label="Flagged Screenings" value={stats.flagged} icon={ShieldAlert} statusColor={stats.flagged > 0 ? 'critical' : 'ok'} />
        <KPICard label="Alarms Triggered" value={stats.alert} icon={Shield} statusColor={stats.alert > 0 ? 'critical' : 'ok'} />
        <KPICard label="Avg Process Time" value={`${stats.avgTime.toFixed(0)}s`} icon={Clock} statusColor="info" />
      </div>

      {/* Lanes Grid */}
      <div>
        <h2 className="text-[16px] font-semibold text-text-secondary mb-2 uppercase tracking-wide">Lane Utilization Overview</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {laneMetrics.map((lane) => {
            const isSelected = filters.lane_number === lane.laneNumber;
            return (
              <button
                key={lane.laneNumber}
                type="button"
                onClick={() => setFilter('lane_number', isSelected ? 'ALL' : lane.laneNumber)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all text-center ${
                  isSelected
                    ? 'border-accent-primary bg-accent-primary/10 shadow-lg shadow-accent-primary/5'
                    : 'border-border bg-bg-card hover:bg-bg-elevated hover:border-accent-primary/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-text-secondary uppercase">Lane {lane.laneNumber}</div>
                <div className="font-data text-[20px] font-bold text-text-primary">{lane.count}</div>
                <div className="text-[11px] font-data text-accent-primary">Avg: {lane.avgTime.toFixed(0)}s</div>
                <div className="text-[10px] text-text-secondary">Clear: {lane.clearRate.toFixed(0)}%</div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ok opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-ok"></span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-status-ok">Active</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search passenger PNR, ID, officer staff ID…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>

      <DataTable
        data={paged}
        columns={columns}
        rowKey={(sc) => sc.screening_id}
        onRowClick={setSelectedScreening}
        isLoading={isLoading}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Security screening audit logs table"
      />

      <SecurityDetailPanel
        screening={selectedScreening}
        onClose={() => setSelectedScreening(null)}
        onSelectPassenger={(pid) => navigate(`/passengers?search=${pid}`)}
      />
    </div>
  );
}
