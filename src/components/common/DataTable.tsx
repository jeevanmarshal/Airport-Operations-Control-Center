import React from 'react';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
  rowClassName?: (row: T) => string;
  renderExpandedRow?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  data, columns, onRowClick, rowKey, isLoading, sort, onSort, page = 1, totalPages = 1, onPageChange, total, caption, rowClassName, renderExpandedRow
}: DataTableProps<T>) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  if (isLoading) return <LoadingState rows={10} />;
  if (data.length === 0) return <EmptyState message="No records match the current filters." />;

  const toggleExpand = (rk: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(rk)) next.delete(rk); else next.add(rk);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-[65vh] overflow-auto rounded-lg border border-border shadow-sm scrollbar-thin scroll-smooth">
        <table className="w-full border-collapse text-[13px]">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10 bg-bg-elevated shadow-sm backdrop-blur-md bg-opacity-90">
            <tr>
              {renderExpandedRow && <th scope="col" className="w-8 border-b border-border px-2"></th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap border-b border-border px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary ${col.sortable ? 'cursor-pointer select-none hover:text-accent-primary transition-colors' : ''} ${col.className ?? ''}`}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                  tabIndex={col.sortable ? 0 : undefined}
                  role={col.sortable ? 'button' : undefined}
                  aria-sort={sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onKeyDown={col.sortable && onSort ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(col.key); } } : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sort?.key === col.key && (sort.dir === 'asc' ? <ArrowUp size={12} className="text-accent-primary" /> : <ArrowDown size={12} className="text-accent-primary" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-bg-card">
            {data.map((row, i) => {
              const rk = rowKey(row);
              const customClass = rowClassName ? rowClassName(row) : '';
              const isExpanded = expanded.has(rk);
              return (
                <React.Fragment key={rk}>
                  <tr
                    onClick={() => {
                      if (renderExpandedRow) toggleExpand(rk);
                      if (onRowClick) onRowClick(row);
                    }}
                    className={`group border-b border-border/40 transition-all duration-200 ${i % 2 === 1 ? 'bg-bg-card/30' : 'bg-transparent'} ${(onRowClick || renderExpandedRow) ? 'cursor-pointer hover:bg-bg-elevated hover:shadow-[inset_2px_0_0_0_#00d4ff] hover:bg-opacity-80' : ''} ${customClass}`}
                    tabIndex={(onRowClick || renderExpandedRow) ? 0 : undefined}
                    onKeyDown={(onRowClick || renderExpandedRow) ? (e) => { if (e.key === 'Enter') { if (renderExpandedRow) toggleExpand(rk); if (onRowClick) onRowClick(row); } } : undefined}
                  >
                    {renderExpandedRow && (
                      <td className="px-2 py-2.5 text-center text-text-secondary">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-2.5 align-middle text-text-primary transition-colors group-hover:text-white ${col.className ?? ''}`}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && renderExpandedRow && (
                    <tr className="bg-bg-elevated/50">
                      <td colSpan={columns.length + 1} className="p-0">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
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
