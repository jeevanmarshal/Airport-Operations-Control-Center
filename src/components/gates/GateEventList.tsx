import React, { useMemo } from 'react';
import type { GateEvent } from '@/types';
import DataTable, { type ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import SearchBar from '@/components/common/SearchBar';
import FilterBar, { type FilterDef } from '@/components/common/FilterBar';
import { useFilter } from '@/hooks/useFilter';
import { formatDateTime } from '@/utils/formatters';

interface Props {
  events: GateEvent[];
  isLoading: boolean;
  onRowClick: (e: GateEvent) => void;
  gateFilter: string | null;
}

const sortAccessor = (e: GateEvent, key: string) => {
  if (key === 'event_time') return e.event_time ?? new Date(0);
  if (key === 'scheduled_time') return e.scheduled_time ?? new Date(0);
  if (key === 'pax_count') return e.pax_count;
  return '';
};

const columns: ColumnDef<GateEvent>[] = [
  { key: 'event_id', header: 'Event ID', render: (e) => <span className="font-data">{e.event_id}</span> },
  { key: 'flight_id', header: 'Flight', render: (e) => <span className="font-data">{e.flight_id}</span> },
  { key: 'gate', header: 'Gate', render: (e) => e.gate },
  { key: 'event_type', header: 'Event Type', render: (e) => e.event_type },
  { key: 'event_time', header: 'Event Time', sortable: true, render: (e) => <span className="font-data">{formatDateTime(e.event_time)}</span> },
  { key: 'staff_id', header: 'Staff', render: (e) => <span className="font-data">{e.staff_id}</span> },
  { key: 'pax_count', header: 'Pax', sortable: true, render: (e) => e.pax_count },
  { key: 'priority', header: 'Priority', render: (e) => e.priority },
  { key: 'is_delayed', header: 'Status', render: (e) => <StatusBadge status={e.is_delayed ? 'Delayed' : 'On Schedule'} variant={e.is_delayed ? 'warning' : 'ok'} /> },
];

export default function GateEventList({ events, isLoading, onRowClick, gateFilter }: Props) {
  const filterDefs: FilterDef[] = useMemo(() => {
    const eventTypes = Array.from(new Set(events.map((e) => e.event_type)));
    const priorities = Array.from(new Set(events.map((e) => e.priority)));
    const terminals = Array.from(new Set(events.map((e) => e.terminal)));
    return [
      { key: 'event_type', label: 'Event Type', options: eventTypes.map((v) => ({ value: v, label: v })) },
      { key: 'priority', label: 'Priority', options: priorities.map((v) => ({ value: v, label: v })) },
      { key: 'terminal', label: 'Terminal', options: terminals.map((v) => ({ value: v, label: v })) },
      { key: 'is_delayed', label: 'Delayed', options: [{ value: 'true', label: 'Delayed' }, { value: 'false', label: 'On Schedule' }] },
    ];
  }, [events]);

  const {
    search, setSearch, filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total,
  } = useFilter<GateEvent>({
    data: gateFilter ? events.filter((e) => e.gate === gateFilter) : events,
    searchFields: [(e) => e.event_id, (e) => e.flight_id, (e) => e.staff_id],
    sortAccessor,
    filterPredicates: {
      event_type: (e, v) => e.event_type === v,
      priority: (e, v) => e.priority === v,
      terminal: (e, v) => e.terminal === v,
      is_delayed: (e, v) => String(e.is_delayed) === v,
    },
    pageSize: 50,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search event ID, flight, staff…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>
      <DataTable
        data={paged}
        columns={columns}
        isLoading={isLoading}
        onRowClick={onRowClick}
        rowKey={(e) => e.event_id}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Gate events table"
      />
    </div>
  );
}
