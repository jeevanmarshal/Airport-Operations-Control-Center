import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import KPICard from '@/components/common/KPICard';
import { Wrench, ShieldAlert, AlertOctagon, Clock, Hammer } from 'lucide-react';
import MaintenanceDetailPanel from './MaintenanceDetailPanel';
import type { MaintenanceLog } from '@/types';

export default function MaintenancePage() {
  const { maintenanceLogs, raw, isLoading } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = params.get('search');
    if (q) setSearch(q);
  }, [params]);

  useEffect(() => {
    const q = params.get('search');
    if (q && raw.maintenanceLogs.length) {
      const match = raw.maintenanceLogs.find((m) => m.work_order_id === q || m.flight_id === q);
      if (match) setSelectedLog(match);
    }
  }, [params, raw.maintenanceLogs]);

  const stats = useMemo(() => {
    let aogCount = 0;
    let unclearedCount = 0;
    let sumDuration = 0;
    let sumParts = 0;
    let criticalIssuesCount = 0;
    let engineWarningsCount = 0;
    const techMap: Record<string, number> = {};

    for (const m of maintenanceLogs) {
      if (m.is_aog) aogCount++;
      if (!m.cleared_to_fly) unclearedCount++;
      if (m.severity_level >= 3) criticalIssuesCount++;
      if (/engine|oil|hydr|leak|warning/i.test(m.defect_description || '')) engineWarningsCount++;
      if (m.technician_id) techMap[m.technician_id] = (techMap[m.technician_id] || 0) + 1;
      sumDuration += m.duration_hrs;
      sumParts += m.parts_used_count;
    }

    const avgDuration = maintenanceLogs.length ? sumDuration / maintenanceLogs.length : 0;
    const healthScore = maintenanceLogs.length ? ((maintenanceLogs.length - unclearedCount) / maintenanceLogs.length) * 100 : 100;
    const topEngineers = Object.entries(techMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({ id, count }));

    return {
      total: maintenanceLogs.length,
      aog: aogCount,
      uncleared: unclearedCount,
      avgDuration,
      totalParts: sumParts,
      criticalIssues: criticalIssuesCount,
      engineWarnings: engineWarningsCount,
      healthScore,
      topEngineers,
    };
  }, [maintenanceLogs]);

  const filterDefs = useMemo(() => {
    const types = Array.from(new Set(maintenanceLogs.map((m) => m.maintenance_type)));
    const levels = Array.from(new Set(maintenanceLogs.map((m) => m.severity_level))).sort((a, b) => a - b);

    return [
      {
        key: 'maintenance_type',
        label: 'Type',
        options: [{ label: 'All Types', value: 'ALL' }, ...types.map((t) => ({ label: t, value: t }))],
      },
      {
        key: 'severity_level',
        label: 'Severity Level',
        options: [{ label: 'All Levels', value: 'ALL' }, ...levels.map((l) => ({ label: `Level ${l}`, value: l }))],
      },
      {
        key: 'is_aog',
        label: 'AOG Status',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'AOG Only', value: 'true' },
          { label: 'Normal Only', value: 'false' },
        ],
      },
      {
        key: 'cleared_to_fly',
        label: 'Cleared State',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Cleared Only', value: 'true' },
          { label: 'Hold / Pending Only', value: 'false' },
        ],
      },
    ];
  }, [maintenanceLogs]);

  const filterPredicates = useMemo(() => {
    return {
      maintenance_type: (m: MaintenanceLog, v: unknown) => m.maintenance_type === v,
      severity_level: (m: MaintenanceLog, v: unknown) => m.severity_level === Number(v),
      is_aog: (m: MaintenanceLog, v: unknown) => m.is_aog === (v === 'true'),
      cleared_to_fly: (m: MaintenanceLog, v: unknown) => m.cleared_to_fly === (v === 'true'),
    };
  }, []);

  const sortAccessor = (m: MaintenanceLog, key: string) => {
    switch (key) {
      case 'duration_hrs': return m.duration_hrs;
      case 'parts_used_count': return m.parts_used_count;
      case 'severity_level': return m.severity_level;
      case 'start_time': return m.start_time ?? 0;
      case 'work_order_id': return m.work_order_id;
      default: return '';
    }
  };

  const {
    filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total,
  } = useFilter<MaintenanceLog>({
    data: search ? raw.maintenanceLogs : maintenanceLogs,
    searchFields: [(m) => m.work_order_id, (m) => m.tail_number, (m) => m.flight_id, (m) => m.technician_id, (m) => m.supervisor_id],
    sortAccessor,
    filterPredicates,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  const columns: ColumnDef<MaintenanceLog>[] = [
    {
      key: 'work_order_id',
      header: 'Work Order',
      sortable: true,
      render: (m) => <span className="font-data font-semibold text-accent-primary">{m.work_order_id}</span>,
    },
    {
      key: 'tail_number',
      header: 'Tail Number',
      render: (m) => <span className="font-data font-bold text-text-primary">{m.tail_number}</span>,
    },
    {
      key: 'flight_id',
      header: 'Flight ID',
      className: 'hidden sm:table-cell',
      render: (m) => <span className="font-data text-accent-primary hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/flights?search=${m.flight_id}`); }}>{m.flight_id}</span>,
    },
    {
      key: 'maintenance_type',
      header: 'Type',
      render: (m) => <span>{m.maintenance_type}</span>,
    },
    {
      key: 'severity_level',
      header: 'Severity',
      sortable: true,
      className: 'text-right',
      render: (m) => (
        <span className={`font-data font-bold ${m.severity_level >= 3 ? 'text-status-warning' : 'text-accent-primary'}`}>
          Level {m.severity_level}
        </span>
      ),
    },
    {
      key: 'duration_hrs',
      header: 'Duration',
      sortable: true,
      className: 'text-right hidden sm:table-cell',
      render: (m) => <span className="font-data">{m.duration_hrs} hrs</span>,
    },
    {
      key: 'parts_used_count',
      header: 'Parts Replaced',
      sortable: true,
      className: 'text-right hidden md:table-cell',
      render: (m) => <span className="font-data">{m.parts_used_count}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => (
        <div className="flex gap-1">
          <StatusBadge status={m.cleared_to_fly ? 'Cleared' : 'Ground Hold'} variant={m.cleared_to_fly ? 'ok' : 'critical'} />
          {m.is_aog && <StatusBadge status="AOG" variant="critical" />}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Maintenance Work Orders</h1>

      {/* Critical Operational Banner */}
      {stats.uncleared > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-status-critical bg-status-critical/10 p-4 text-text-primary shadow-lg shadow-status-critical/5 animate-pulse">
          <AlertOctagon size={24} className="text-status-critical shrink-0" />
          <div>
            <div className="font-bold text-[14px]">CRITICAL SYSTEMS EXCEPTION: GROUND HOLDS DETECTED</div>
            <div className="text-[12px] text-text-secondary">
              There are currently <span className="text-status-critical font-bold">{stats.uncleared}</span> aircraft in ground hold status (VT-ABC). Operations require clearance verification prior to scheduling.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KPICard label="Total Work Orders" value={stats.total} icon={Wrench} statusColor="info" />
        <KPICard label="Aircraft AOG" value={stats.aog} icon={AlertOctagon} statusColor={stats.aog > 0 ? 'critical' : 'ok'} />
        <KPICard label="Pending Clearance" value={stats.uncleared} icon={ShieldAlert} statusColor={stats.uncleared > 0 ? 'critical' : 'ok'} />
        <KPICard label="Avg Repair Time" value={`${stats.avgDuration.toFixed(1)} hrs`} icon={Clock} statusColor="info" />
        <KPICard label="Total Parts Used" value={stats.totalParts} icon={Hammer} statusColor="ok" />
      </div>

      {/* Visual Operational Dashboard Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Aircraft Health Summary Card */}
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <h3 className="mb-2 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Aircraft Health & Status</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-text-muted">Cleared Fleet Ratio</span>
            <span className="text-[15px] font-bold text-status-ok font-data">{stats.healthScore.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full bg-status-ok transition-all duration-500" style={{ width: `${stats.healthScore}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-text-secondary">
            <span>Cleared: {stats.total - stats.uncleared}</span>
            <span>Ground Hold: {stats.uncleared}</span>
          </div>
        </div>

        {/* System Warnings Card */}
        <div className="rounded-lg border border-border bg-bg-card p-4 flex flex-col justify-between">
          <div>
            <h3 className="mb-2 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Defects & Alerts</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-bg-elevated p-2 rounded border border-border/40">
                <span className="block text-[9px] text-text-secondary">Engine Warnings</span>
                <span className="text-[15px] font-bold text-status-warning font-data">{stats.engineWarnings}</span>
              </div>
              <div className="bg-bg-elevated p-2 rounded border border-border/40">
                <span className="block text-[9px] text-text-secondary">Critical Level 3+</span>
                <span className="text-[15px] font-bold text-status-critical font-data">{stats.criticalIssues}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Engineers Card */}
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <h3 className="mb-2 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Top Technicians on Shift</h3>
          <div className="flex flex-col gap-2">
            {stats.topEngineers.map((eng, idx) => (
              <div key={eng.id} className="flex items-center justify-between text-[11px] bg-bg-elevated/50 px-2.5 py-1.5 rounded">
                <span className="font-semibold text-accent-primary font-data">#{idx + 1} {eng.id}</span>
                <span className="text-text-secondary">{eng.count} orders</span>
              </div>
            ))}
            {stats.topEngineers.length === 0 && <span className="text-[11px] text-text-muted">No assignments today</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search work order, tail #, technician ID…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>

      <DataTable
        data={paged}
        columns={columns}
        rowKey={(m) => m.work_order_id}
        onRowClick={setSelectedLog}
        isLoading={isLoading}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Maintenance logs and work orders table"
      />

      <MaintenanceDetailPanel
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onSelectFlight={(fid) => navigate(`/flights?search=${fid}`)}
      />
    </div>
  );
}
