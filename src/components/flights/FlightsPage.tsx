import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import type { Flight } from '@/types';
import FlightStats from './FlightStats';
import FlightTable from './FlightTable';
import FlightDetailPanel from './FlightDetailPanel';
import { buildFlightFilterDefs, flightFilterPredicates } from './FlightFilters';

const sortAccessor = (f: Flight, key: string) => {
  switch (key) {
    case 'scheduled_departure': return f.scheduled_departure;
    case 'delay_minutes': return f.delay_minutes;
    case 'load_factor_pct': return f.load_factor_pct;
    case 'revenue_inr': return f.revenue_inr;
    default: return '';
  }
};

export default function FlightsPage() {
  const { flights, raw, isLoading } = useData();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<Flight | null>(null);
  const [search, setSearch] = useState('');

  const filterDefs = useMemo(() => buildFlightFilterDefs(flights), [flights]);

  const {
    filters, setFilter, clearFilters, sort, toggleSort, filtered, paged, page, setPage, totalPages, total,
  } = useFilter<Flight>({
    data: search ? raw.flights : flights,
    searchFields: [(f) => f.flight_id, (f) => f.airline_name, (f) => f.destination],
    sortAccessor,
    filterPredicates: flightFilterPredicates as Record<string, (f: Flight, v: unknown) => boolean>,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  useEffect(() => {
    const q = params.get('search');
    if (q) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    const q = params.get('search');
    if (q && raw.flights.length) {
      const match = raw.flights.find((f) => f.flight_id === q);
      if (match) setSelected(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, raw.flights]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Flights</h1>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search flight ID, airline, destination…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>

      <FlightStats flights={filtered} />

      <FlightTable
        flights={paged}
        isLoading={isLoading}
        onRowClick={setSelected}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />

      <FlightDetailPanel flight={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
