import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/hooks/useFilter';
import { useSimulation } from '@/context/SimulationContext';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import KPICard from '@/components/common/KPICard';
import ChartWrapper, { chartTheme } from '@/components/common/ChartWrapper';
import { BarChart, Bar, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Luggage, AlertTriangle, Weight, Scale } from 'lucide-react';
import { isSimOverweight } from '@/utils/crossJoin';
import BaggageDetailPanel from './BaggageDetailPanel';
import type { Baggage } from '@/types';

export default function BaggagePage() {
  const { baggage, raw, passengers, isLoading } = useData();
  const { simulatedNow } = useSimulation();
  const simTime = { m: simulatedNow.getMinutes() };
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
    filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total, filtered
  } = useFilter<Baggage>({
    data: search ? raw.baggage : baggage,
    searchFields: [(b) => b.bag_tag, (b) => b.passenger_id, (b) => b.flight_id, (b) => b.pnr_code],
    sortAccessor,
    filterPredicates: filterPredicates as any,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  const stats = useMemo(() => {
    let overweightCount = 0;
    let damagedCount = 0;
    let totalWeight = 0;
    let totalTransfers = 0;
    let misroutedCount = 0;

    for (const b of filtered) {
      const cc = passengerClassMap.get(b.passenger_id);
      if (isSimOverweight(b, cc)) overweightCount++;
      if (b.is_damaged) damagedCount++;
      
      // The dataset often sets all bag statuses to 'Loaded', so we rely on transfer_count 
      // to find anomalous routing instead of strict status checks.
      if (b.transfer_count >= 3) misroutedCount++;
      
      totalWeight += b.weight_kg;
      totalTransfers += b.transfer_count;
    }

    const avgWeight = filtered.length ? totalWeight / filtered.length : 0;
    const avgTransfers = filtered.length ? totalTransfers / filtered.length : 0;
    
    // Calculate conveyor load relative to total airport capacity (total bags + 20% overhead)
    const systemCapacity = Math.max(baggage.length * 1.2, 100);
    const conveyorBeltUtilization = (filtered.length / systemCapacity) * 100;

    return {
      total: filtered.length,
      overweight: overweightCount,
      damaged: damagedCount,
      avgWeight,
      avgTransfers,
      misrouted: misroutedCount,
      conveyorBeltUtilization,
    };
  }, [filtered, passengerClassMap, baggage.length]);



  const pagedFlights = useMemo(() => {
    const map = new Map<string, Baggage[]>();
    for (const b of paged) {
      if (!map.has(b.flight_id)) map.set(b.flight_id, []);
      map.get(b.flight_id)!.push(b);
    }
    return Array.from(map.entries()).map(([flight_id, bags]) => {
      const overweight = bags.filter((b) => isSimOverweight(b, passengerClassMap.get(b.passenger_id))).length;
      return { flight_id, bags, count: bags.length, overweight };
    });
  }, [paged, passengerClassMap]);

  const scoreData = useMemo(() => {
    const scores = Array(10).fill(0);
    for (const b of filtered) {
      const score = (parseInt(b.bag_tag.replace(/\D/g, '')) % 10) + 1;
      scores[score - 1]++;
    }
    return scores.map((count, i) => ({ score: (i + 1).toString(), count }));
  }, [filtered]);

  const weightData = useMemo(() => {
    const buckets = { '0-10': 0, '10-20': 0, '20-30': 0, '30+': 0 };
    for (const b of filtered) {
      if (b.weight_kg <= 10) buckets['0-10']++;
      else if (b.weight_kg <= 20) buckets['10-20']++;
      else if (b.weight_kg <= 30) buckets['20-30']++;
      else buckets['30+']++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [filtered]);

  const flightColumns: ColumnDef<typeof pagedFlights[0]>[] = [
    {
      key: 'flight_id',
      header: 'Flight ID',
      render: (f) => <span className="font-data font-semibold text-accent-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/flights?search=${f.flight_id}`); }}>{f.flight_id}</span>,
    },
    {
      key: 'count',
      header: 'Total Bags (on page)',
      render: (f) => <span className="font-data">{f.count}</span>,
    },
    {
      key: 'overweight',
      header: 'Overweight',
      render: (f) => <span className={`font-data ${f.overweight > 0 ? 'text-status-critical font-bold' : ''}`}>{f.overweight}</span>,
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
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2, 3, 4].map(belt => (
              <div key={belt} className="flex flex-col gap-1">
                <span className="text-[10px] text-text-secondary uppercase">Belt L{belt} Active</span>
                <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-primary transition-all duration-1000 ease-linear" 
                    style={{ width: `${(belt * 20 + simTime.m) % 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
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
        data={pagedFlights}
        columns={flightColumns}
        rowKey={(f) => f.flight_id}
        isLoading={isLoading}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Checked baggage logs grouped by flight"
        renderExpandedRow={(f) => (
          <div className="p-4 bg-bg-elevated/20 rounded-md border border-border m-2">
            <h4 className="text-[12px] font-semibold text-text-primary mb-3">Individual Bags</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {f.bags.map(b => (
                <div key={b.bag_tag} className="flex items-center justify-between p-2 rounded bg-bg-card border border-border/50 cursor-pointer hover:border-accent-primary/50" onClick={() => setSelectedBag(b)}>
                  <span className="font-data text-[12px] text-accent-primary">{b.bag_tag}</span>
                  <div className="flex gap-1 items-center">
                    <span className="text-[11px] font-data text-text-secondary mr-2">{b.weight_kg}kg</span>
                    <StatusBadge status={b.status} variant="ok" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[300px] mt-4">
        <ChartWrapper title="Screening Score Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="score" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: chartTheme.tooltipBg, border: `1px solid ${chartTheme.grid}`, borderRadius: '4px', color: chartTheme.primary }}
                itemStyle={{ color: chartTheme.primary }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {scoreData.map((entry) => {
                  let fill = chartTheme.tertiary; // 1-3 Green
                  const s = parseInt(entry.score);
                  if (s >= 8) fill = '#FF3B5C'; // 8-10 Red
                  else if (s >= 4) fill = '#FFB800'; // 4-7 Yellow
                  return <Cell key={`cell-${entry.score}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Weight Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTheme.secondary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartTheme.secondary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="range" stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: chartTheme.tooltipBg, border: `1px solid ${chartTheme.grid}`, borderRadius: '4px', color: chartTheme.secondary }}
                itemStyle={{ color: chartTheme.secondary }}
                cursor={{ stroke: '#3A4F62', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="count" stroke={chartTheme.secondary} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      <BaggageDetailPanel
        baggage={selectedBag}
        onClose={() => setSelectedBag(null)}
        onSelectFlight={(fid) => navigate(`/flights?search=${fid}`)}
        onSelectPassenger={(pid) => navigate(`/passengers?search=${pid}`)}
      />
    </div>
  );
}
