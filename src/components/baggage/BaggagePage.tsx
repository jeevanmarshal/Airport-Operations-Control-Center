import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import KPICard from '@/components/common/KPICard';
import { Luggage, AlertTriangle, Weight, Scale } from 'lucide-react';
import { isSimOverweight } from '@/utils/crossJoin';
import BaggageDetailPanel from './BaggageDetailPanel';
import type { Baggage } from '@/types';

export default function BaggagePage() {
  const { baggage, raw, passengers, isLoading } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selectedBag, setSelectedBag] = useState<Baggage | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = params.get('search');
    if (q) setSearch(q);
  }, [params]);

  useEffect(() => {
    const q = params.get('search');
    if (q && raw.baggage.length) {
      const match = raw.baggage.find((b) => b.bag_tag === q || b.passenger_id === q);
      if (match) setSelectedBag(match);
    }
  }, [params, raw.baggage]);

  // Helper mapping passenger class to baggage for overweight check
  const passengerClassMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of passengers) {
      map.set(p.passenger_id, p.cabin_class);
    }
    return map;
  }, [passengers]);

  const stats = useMemo(() => {
    let overweightCount = 0;
    let damagedCount = 0;
    let totalWeight = 0;
    let totalTransfers = 0;
    let misroutedCount = 0;

    for (const b of baggage) {
      const cc = passengerClassMap.get(b.passenger_id);
      if (isSimOverweight(b, cc)) overweightCount++;
      if (b.is_damaged) damagedCount++;
      if (b.transfer_count >= 3 && (b.status === 'Transit' || b.status === 'Checked')) misroutedCount++;
      totalWeight += b.weight_kg;
      totalTransfers += b.transfer_count;
    }

    const avgWeight = baggage.length ? totalWeight / baggage.length : 0;
    const avgTransfers = baggage.length ? totalTransfers / baggage.length : 0;
    const activeBags = baggage.filter(b => b.status === 'Sorted' || b.status === 'Transit').length;
    const conveyorBeltUtilization = Math.min(100, Math.max(10, (activeBags / 15) * 100));

    return {
      total: baggage.length,
      overweight: overweightCount,
      damaged: damagedCount,
      avgWeight,
      avgTransfers,
      misrouted: misroutedCount,
      conveyorBeltUtilization,
    };
  }, [baggage, passengerClassMap]);

  const filterDefs = useMemo(() => {
    const statuses = Array.from(new Set(baggage.map((b) => b.status)));
    const areas = Array.from(new Set(baggage.map((b) => b.handling_area)));
    const drops = Array.from(new Set(baggage.map((b) => b.drop_point)));

    return [
      {
        key: 'status',
        label: 'Status',
        options: [{ label: 'All', value: 'ALL' }, ...statuses.map((s) => ({ label: s, value: s }))],
      },
      {
        key: 'handling_area',
        label: 'Handling Area',
        options: [{ label: 'All', value: 'ALL' }, ...areas.map((a) => ({ label: a, value: a }))],
      },
      {
        key: 'drop_point',
        label: 'Drop Point',
        options: [{ label: 'All', value: 'ALL' }, ...drops.map((d) => ({ label: d, value: d }))],
      },
      {
        key: 'is_overweight',
        label: 'Weight Category',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Overweight Only', value: 'true' },
          { label: 'Normal Weight Only', value: 'false' },
        ],
      },
      {
        key: 'is_damaged',
        label: 'Damaged State',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Damaged Only', value: 'true' },
          { label: 'No Damage Only', value: 'false' },
        ],
      },
    ];
  }, [baggage]);

  const filterPredicates = useMemo(() => {
    return {
      status: (b: Baggage, v: unknown) => b.status === v,
      handling_area: (b: Baggage, v: unknown) => b.handling_area === v,
      drop_point: (b: Baggage, v: unknown) => b.drop_point === v,
      is_overweight: (b: Baggage, v: unknown) => {
        const cc = passengerClassMap.get(b.passenger_id);
        const ow = isSimOverweight(b, cc);
        return v === 'true' ? ow : !ow;
      },
      is_damaged: (b: Baggage, v: unknown) => b.is_damaged === (v === 'true'),
    };
  }, [passengerClassMap]);

  const sortAccessor = (b: Baggage, key: string) => {
    switch (key) {
      case 'weight_kg': return b.weight_kg;
      case 'transfer_count': return b.transfer_count;
      case 'timestamp': return b.timestamp ?? 0;
      case 'bag_tag': return b.bag_tag;
      default: return '';
    }
  };

  const {
    filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total,
  } = useFilter<Baggage>({
    data: search ? raw.baggage : baggage,
    searchFields: [(b) => b.bag_tag, (b) => b.passenger_id, (b) => b.flight_id, (b) => b.pnr_code],
    sortAccessor,
    filterPredicates: filterPredicates as any,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  const columns: ColumnDef<Baggage>[] = [
    {
      key: 'bag_tag',
      header: 'Bag Tag',
      sortable: true,
      render: (b) => <span className="font-data font-semibold text-accent-primary">{b.bag_tag}</span>,
    },
    {
      key: 'passenger_id',
      header: 'Passenger ID',
      className: 'hidden sm:table-cell',
      render: (b) => <span className="font-data">{b.passenger_id}</span>,
    },
    {
      key: 'flight_id',
      header: 'Flight ID',
      render: (b) => <span className="font-data text-accent-primary hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/flights?search=${b.flight_id}`); }}>{b.flight_id}</span>,
    },
    {
      key: 'pnr_code',
      header: 'PNR Code',
      className: 'hidden md:table-cell',
      render: (b) => <span className="font-data">{b.pnr_code}</span>,
    },
    {
      key: 'weight_kg',
      header: 'Weight',
      sortable: true,
      className: 'text-right',
      render: (b) => {
        const cc = passengerClassMap.get(b.passenger_id);
        const ow = isSimOverweight(b, cc);
        return (
          <span className={`font-data ${ow ? 'text-status-critical font-bold' : ''}`}>
            {b.weight_kg.toFixed(1)} kg
          </span>
        );
      },
    },
    {
      key: 'transfer_count',
      header: 'Transfers',
      sortable: true,
      className: 'text-right hidden md:table-cell',
      render: (b) => <span className="font-data">{b.transfer_count}</span>,
    },
    {
      key: 'location_code',
      header: 'Loc',
      render: (b) => <span className="font-data">{b.location_code}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => {
        const cc = passengerClassMap.get(b.passenger_id);
        const ow = isSimOverweight(b, cc);
        const damaged = b.is_damaged;
        return (
          <div className="flex gap-1">
            <StatusBadge status={b.status} variant="ok" />
            {ow && <StatusBadge status="Overweight" variant="critical" />}
            {damaged && <StatusBadge status="Damaged" variant="critical" />}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Baggage Monitoring</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KPICard label="Total Checked Bags" value={stats.total} icon={Luggage} statusColor="ok" />
        <KPICard label="Overweight Bags" value={stats.overweight} icon={Scale} statusColor={stats.overweight > 0 ? 'critical' : 'ok'} />
        <KPICard label="Damaged Bags" value={stats.damaged} icon={AlertTriangle} statusColor={stats.damaged > 0 ? 'critical' : 'ok'} />
        <KPICard label="Avg Bag Weight" value={`${stats.avgWeight.toFixed(1)} kg`} icon={Weight} statusColor="info" />
        <KPICard label="Avg Handoffs" value={stats.avgTransfers.toFixed(1)} icon={Scale} statusColor="info" />
      </div>

      {/* Operational Conveyor & Handling Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conveyor Belt System Card */}
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <h3 className="mb-2 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Conveyor Belt System Load</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-text-muted">Sorting Loop Utilization</span>
            <span className="text-[15px] font-bold text-accent-primary font-data">{stats.conveyorBeltUtilization.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full bg-accent-primary transition-all duration-500" style={{ width: `${stats.conveyorBeltUtilization}%` }} />
          </div>
          <span className="block mt-2 text-[10px] text-text-secondary">Handling Zone: Sorting Loops L1-L4 Active</span>
        </div>

        {/* Misrouted / Anomalies Card */}
        <div className="rounded-lg border border-border bg-bg-card p-4 flex items-center justify-between">
          <div>
            <h3 className="mb-1 text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Handling Anomalies</h3>
            <p className="text-[11px] text-text-secondary">Baggage items showing high-frequency transfers or routing delays</p>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-text-secondary">Misrouted / Multi-Handoff</span>
            <span className={`text-[20px] font-bold font-data ${stats.misrouted > 0 ? 'text-status-critical' : 'text-status-ok'}`}>{stats.misrouted} bags</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search bag tag, passenger PNR, flight ID…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>

      <DataTable
        data={paged}
        columns={columns}
        rowKey={(b) => b.bag_tag}
        onRowClick={setSelectedBag}
        isLoading={isLoading}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Checked baggage logs table"
      />

      <BaggageDetailPanel
        baggage={selectedBag}
        onClose={() => setSelectedBag(null)}
        onSelectFlight={(fid) => navigate(`/flights?search=${fid}`)}
        onSelectPassenger={(pid) => navigate(`/passengers?search=${pid}`)}
      />
    </div>
  );
}
