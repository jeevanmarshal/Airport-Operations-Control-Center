import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import KPICard from '@/components/common/KPICard';
import { Users, Award, Smile, TrendingUp, Sparkles } from 'lucide-react';
import PassengerDetailPanel from './PassengerDetailPanel';
import type { Passenger } from '@/types';

export default function PassengersPage() {
  const { passengers, raw, isLoading } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = params.get('search');
    if (q) setSearch(q);
  }, [params]);

  useEffect(() => {
    const q = params.get('search');
    if (q && raw.passengers.length) {
      let match = raw.passengers.find((p) => p.passenger_id === q || p.pnr_code === q);
      if (!match) {
        // Cross-query other datasets by PNR/ID
        const sec = raw.securityScreenings.find(s => s.screening_id === q || s.pnr_code === q || s.passenger_id === q);
        const bag = raw.baggage.find(b => b.bag_tag === q || b.pnr_code === q || b.passenger_id === q);
        const ret = raw.retailTransactions.find(r => r.transaction_id === q || r.pnr_code === q);
        const pnr = sec?.pnr_code || bag?.pnr_code || ret?.pnr_code;
        if (pnr) {
          match = raw.passengers.find(p => p.pnr_code === pnr);
        }
      }
      if (match) setSelectedPassenger(match);
    }
  }, [params, raw.passengers, raw.securityScreenings, raw.baggage, raw.retailTransactions]);

  const stats = useMemo(() => {
    let bizCount = 0;
    let econCount = 0;
    let ffCount = 0;
    let upgradeCount = 0;
    let sumSatisfaction = 0;

    for (const p of passengers) {
      if (p.cabin_class === 'Business') bizCount++;
      else econCount++;

      if (p.is_frequent_flyer) ffCount++;
      if (p.is_upgrade) upgradeCount++;
      sumSatisfaction += p.satisfaction_score;
    }

    const avgSatisfaction = passengers.length ? sumSatisfaction / passengers.length : 0;

    return {
      total: passengers.length,
      business: bizCount,
      economy: econCount,
      frequentFlyer: ffCount,
      upgrades: upgradeCount,
      avgSatisfaction,
    };
  }, [passengers]);

  const filterDefs = useMemo(() => {
    const classes = Array.from(new Set(passengers.map((p) => p.cabin_class)));
    const nationalities = Array.from(new Set(passengers.map((p) => p.nationality)));
    const genders = Array.from(new Set(passengers.map((p) => p.gender)));
    const ageGroups = Array.from(new Set(passengers.map((p) => p.age_group)));

    return [
      {
        key: 'cabin_class',
        label: 'Cabin Class',
        options: [{ label: 'All', value: 'ALL' }, ...classes.map((c) => ({ label: c, value: c }))],
      },
      {
        key: 'nationality',
        label: 'Nationality',
        options: [{ label: 'All', value: 'ALL' }, ...nationalities.map((n) => ({ label: n, value: n }))],
      },
      {
        key: 'gender',
        label: 'Gender',
        options: [{ label: 'All', value: 'ALL' }, ...genders.map((g) => ({ label: g, value: g }))],
      },
      {
        key: 'age_group',
        label: 'Age Group',
        options: [{ label: 'All', value: 'ALL' }, ...ageGroups.map((a) => ({ label: a, value: a }))],
      },
      {
        key: 'is_frequent_flyer',
        label: 'Frequent Flyer',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Yes Only', value: 'true' },
          { label: 'No Only', value: 'false' },
        ],
      },
      {
        key: 'is_upgrade',
        label: 'Upgraded',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Yes Only', value: 'true' },
          { label: 'No Only', value: 'false' },
        ],
      },
    ];
  }, [passengers]);

  const filterPredicates = useMemo(() => {
    return {
      cabin_class: (p: Passenger, v: unknown) => p.cabin_class === v,
      nationality: (p: Passenger, v: unknown) => p.nationality === v,
      gender: (p: Passenger, v: unknown) => p.gender === v,
      age_group: (p: Passenger, v: unknown) => p.age_group === v,
      is_frequent_flyer: (p: Passenger, v: unknown) => p.is_frequent_flyer === (v === 'true'),
      is_upgrade: (p: Passenger, v: unknown) => p.is_upgrade === (v === 'true'),
    };
  }, []);

  const sortAccessor = (p: Passenger, key: string) => {
    switch (key) {
      case 'age': return p.age;
      case 'satisfaction_score': return p.satisfaction_score;
      case 'bags_count': return p.bags_count;
      case 'check_in_time': return p.check_in_time ?? 0;
      case 'boarding_time': return p.boarding_time ?? 0;
      case 'passenger_id': return p.passenger_id;
      default: return '';
    }
  };

  const {
    filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total,
  } = useFilter<Passenger>({
    data: search ? raw.passengers : passengers,
    searchFields: [(p) => p.passenger_id, (p) => p.first_name, (p) => p.last_name, (p) => p.pnr_code, (p) => p.flight_id],
    sortAccessor,
    filterPredicates,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  const columns: ColumnDef<Passenger>[] = [
    {
      key: 'passenger_id',
      header: 'Passenger ID',
      sortable: true,
      render: (p) => <span className="font-data font-semibold text-accent-primary">{p.passenger_id}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (p) => <span>{p.first_name} {p.last_name}</span>,
    },
    {
      key: 'cabin_class',
      header: 'Cabin',
      render: (p) => {
        const isUpgraded = p.cabin_class !== p.booked_class || p.is_upgrade;
        return (
          <div className="flex items-center gap-1.5">
            <span>{p.cabin_class}</span>
            {isUpgraded && <span className="text-[10px] text-accent-secondary bg-accent-secondary/10 px-1 rounded">UPG</span>}
          </div>
        );
      },
    },
    {
      key: 'seat_number',
      header: 'Seat',
      className: 'hidden sm:table-cell',
      render: (p) => <span className="font-data">{p.seat_number}</span>,
    },
    {
      key: 'flight_id',
      header: 'Flight ID',
      render: (p) => <span className="font-data text-accent-primary hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/flights?search=${p.flight_id}`); }}>{p.flight_id}</span>,
    },
    {
      key: 'bags_count',
      header: 'Bags',
      sortable: true,
      className: 'text-right hidden sm:table-cell',
      render: (p) => <span className="font-data">{p.bags_count}</span>,
    },
    {
      key: 'age',
      header: 'Age',
      sortable: true,
      className: 'text-right hidden md:table-cell',
      render: (p) => <span>{p.age > 0 ? p.age : 'N/A'} <span className="text-[11px] text-text-secondary">({p.age_group})</span></span>,
    },
    {
      key: 'satisfaction_score',
      header: 'Satisfaction',
      sortable: true,
      className: 'text-right',
      render: (p) => {
        const sat = p.satisfaction_score;
        return (
          <span className={`font-data font-semibold ${sat >= 3 ? 'text-status-ok' : sat >= 1 ? 'text-status-warning' : 'text-status-critical'}`}>
            {sat.toFixed(1)} / 5.0
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Passenger Management</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KPICard label="Total Passengers" value={stats.total} icon={Users} statusColor="ok" />
        <KPICard label="Business Class" value={stats.business} icon={Sparkles} statusColor="info" />
        <KPICard label="Frequent Flyers" value={stats.frequentFlyer} icon={Award} statusColor="ok" />
        <KPICard label="Upgraded Tickets" value={stats.upgrades} icon={TrendingUp} statusColor="warning" />
        <KPICard label="Avg Satisfaction" value={`${stats.avgSatisfaction.toFixed(2)}`} icon={Smile} statusColor={stats.avgSatisfaction >= 3 ? 'ok' : 'warning'} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search PNR, ID, name, flight ID…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>

      <DataTable
        data={paged}
        columns={columns}
        rowKey={(p) => p.passenger_id}
        onRowClick={setSelectedPassenger}
        isLoading={isLoading}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Passenger list and check-in status table"
      />

      <PassengerDetailPanel
        passenger={selectedPassenger}
        onClose={() => setSelectedPassenger(null)}
        onSelectFlight={(fid) => navigate(`/flights?search=${fid}`)}
        onSelectBag={(btag) => navigate(`/baggage?search=${btag}`)}
      />
    </div>
  );
}
