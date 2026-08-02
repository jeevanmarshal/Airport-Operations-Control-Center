import React from 'react';
import type { Flight } from '@/types';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime, formatINR, formatPct } from '@/utils/formatters';
import { delayStatus } from '@/utils/colorMapping';

interface FlightTableProps {
  flights: Flight[];
  isLoading?: boolean;
  onRowClick?: (row: Flight) => void;
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  onSort?: (key: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  total?: number;
}

export default function FlightTable({
  flights,
  isLoading,
  onRowClick,
  sort,
  onSort,
  page,
  totalPages,
  onPageChange,
  total,
}: FlightTableProps) {
  const columns: ColumnDef<Flight>[] = [
    {
      key: 'flight_id',
      header: 'Flight ID',
      sortable: true,
      render: (f) => <span className="font-data font-semibold text-accent-primary">{f.flight_id}</span>,
    },
    {
      key: 'airline_name',
      header: 'Airline',
      sortable: true,
      render: (f) => <span>{f.airline_name}</span>,
    },
    {
      key: 'destination',
      header: 'Destination',
      sortable: true,
      render: (f) => <span className="font-data">{f.destination}</span>,
    },
    {
      key: 'scheduled_departure',
      header: 'Scheduled Dep',
      sortable: true,
      render: (f) => <span className="font-data">{formatDateTime(f.scheduled_departure)}</span>,
    },
    {
      key: 'delay_minutes',
      header: 'Delay',
      sortable: true,
      className: 'text-right',
      render: (f) => {
        const { label, variant } = delayStatus(f.delay_minutes);
        return f.delay_minutes > 0 ? (
          <span className="font-data inline-flex items-center gap-1.5">
            <span className={`text-[12px] ${variant === 'critical' ? 'text-status-critical' : 'text-status-warning'}`}>
              +{f.delay_minutes} min
            </span>
            <span className="text-[11px] text-text-secondary">({f.delay_reason})</span>
          </span>
        ) : (
          <span className="font-data text-status-ok text-[12px]">On-Time</span>
        );
      },
    },
    {
      key: 'load_factor_pct',
      header: 'Load Factor',
      sortable: true,
      className: 'text-right hidden md:table-cell',
      render: (f) => (
        <span className={`font-data ${f.load_factor_pct > 100 ? 'text-status-critical font-bold' : ''}`}>
          {formatPct(f.load_factor_pct)}
        </span>
      ),
    },
    {
      key: 'revenue_inr',
      header: 'Revenue',
      sortable: true,
      className: 'text-right hidden md:table-cell',
      render: (f) => <span className="font-data">{formatINR(f.revenue_inr)}</span>,
    },
    {
      key: 'gate',
      header: 'Gate',
      className: 'hidden sm:table-cell',
      render: (f) => <span className="font-data">{f.gate}</span>,
    },
  ];

  return (
    <DataTable
      data={flights}
      columns={columns}
      onRowClick={onRowClick}
      rowKey={(f) => f.flight_id}
      isLoading={isLoading}
      sort={sort}
      onSort={onSort}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      total={total}
      caption="All departing flights monitoring table"
    />
  );
}
