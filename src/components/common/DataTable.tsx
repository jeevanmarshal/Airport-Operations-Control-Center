import React from 'react';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  onSort?: (key: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  total?: number;
  caption: string;
}

export default function DataTable<T>({
  data, columns, onRowClick, rowKey, isLoading, sort, onSort, page = 1, totalPages = 1, onPageChange, total, caption,
}: DataTableProps<T>) {
  if (isLoading) return <LoadingState rows={10} />;
  if (data.length === 0) return <EmptyState message="No records match the current filters." />;

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-[65vh] overflow-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-full border-collapse text-[13px]">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10 bg-bg-elevated">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap border-b border-border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-text-secondary ${col.sortable ? 'cursor-pointer select-none hover:text-accent-primary' : ''} ${col.className ?? ''}`}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                  tabIndex={col.sortable ? 0 : undefined}
                  role={col.sortable ? 'button' : undefined}
                  aria-sort={sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onKeyDown={col.sortable && onSort ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(col.key); } } : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sort?.key === col.key && (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border/60 ${i % 2 === 1 ? 'bg-bg-card/60' : 'bg-transparent'} ${onRowClick ? 'cursor-pointer hover:bg-bg-elevated hover:outline hover:outline-1 hover:outline-accent-primary/40' : ''}`}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(row); } : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2 align-middle text-text-primary ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onPageChange && (
        <div className="flex items-center justify-between text-[13px] text-text-secondary">
          <span>{total ?? data.length} records &middot; page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="flex h-9 min-w-[44px] items-center justify-center rounded-md border border-border bg-bg-card px-2 text-text-primary hover:border-accent-primary disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="flex h-9 min-w-[44px] items-center justify-center rounded-md border border-border bg-bg-card px-2 text-text-primary hover:border-accent-primary disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
