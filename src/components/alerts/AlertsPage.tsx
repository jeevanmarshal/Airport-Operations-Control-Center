import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '@/context/AlertContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import KPICard from '@/components/common/KPICard';
import { formatDateTime } from '@/utils/formatters';
import {
  Bell,
  ShieldAlert,
  ArrowRight,
  Eye,
  Plane,
  DoorOpen,
  Luggage,
  User,
  Shield,
  Wrench,
  Users,
  ShoppingBag,
} from 'lucide-react';
import type { OpsAlert, AlertStatus } from '@/types';

// Map department modules to Lucide icons
const moduleIconMap: Record<OpsAlert['module'], React.ComponentType<any>> = {
  flights: Plane,
  gates: DoorOpen,
  baggage: Luggage,
  passengers: User,
  security: Shield,
  maintenance: Wrench,
  staff: Users,
  retail: ShoppingBag,
};

export default function AlertsPage() {
  const { alerts, unacknowledgedCount, updateAlertStatus } = useAlerts();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Summary Metrics based on state lifecycle
  const stats = useMemo(() => {
    let activeCount = 0;
    let ackCount = 0;
    let invCount = 0;
    let resCount = 0;

    for (const a of alerts) {
      const status = a.status || 'Created';
      if (status === 'Created') activeCount++;
      else if (status === 'Acknowledged') ackCount++;
      else if (status === 'Investigating') invCount++;
      else if (status === 'Resolved') resCount++;
    }

    return {
      total: alerts.length,
      active: activeCount,
      acknowledged: ackCount,
      investigating: invCount,
      resolved: resCount,
    };
  }, [alerts]);

  const filterDefs = useMemo(() => {
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    const modules = ['flights', 'gates', 'baggage', 'passengers', 'security', 'maintenance', 'staff', 'retail'];
    const statuses: AlertStatus[] = ['Created', 'Acknowledged', 'Investigating', 'Resolved', 'Closed'];

    return [
      {
        key: 'severity',
        label: 'Severity',
        options: [{ label: 'All Severities', value: 'ALL' }, ...severities.map((s) => ({ label: s, value: s }))],
      },
      {
        key: 'module',
        label: 'Department',
        options: [{ label: 'All Departments', value: 'ALL' }, ...modules.map((m) => ({ label: m.toUpperCase(), value: m }))],
      },
      {
        key: 'status',
        label: 'Alert Status',
        options: [{ label: 'All Statuses', value: 'ALL' }, ...statuses.map((s) => ({ label: s, value: s }))],
      },
    ];
  }, []);

  const filterPredicates = useMemo(() => {
    return {
      severity: (a: OpsAlert, v: unknown) => a.severity === v,
      module: (a: OpsAlert, v: unknown) => a.module === v,
      status: (a: OpsAlert, v: unknown) => (a.status || 'Created') === v,
    };
  }, []);

  const sortAccessor = (a: OpsAlert, key: string) => {
    switch (key) {
      case 'timestamp': return a.timestamp;
      case 'severity': {
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
        return order[a.severity] ?? 5;
      }
      default: return '';
    }
  };

  const {
    search, setSearch, filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total,
  } = useFilter<OpsAlert>({
    data: alerts,
    searchFields: [(a) => a.id, (a) => a.message, (a) => a.recordId, (a) => a.module],
    sortAccessor,
    filterPredicates,
    pageSize: 50,
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const visibleIds = paged.map((a) => a.id);
      const allSelected = visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBulkStatusChange = (status: AlertStatus) => {
    selectedIds.forEach((id) => {
      updateAlertStatus(id, status);
    });
    setSelectedIds(new Set());
  };

  const handleNavigateToSource = (alert: OpsAlert) => {
    const routeMap: Record<string, string> = {
      flights: '/flights',
      baggage: '/baggage',
      passengers: '/passengers',
      security: '/security',
      maintenance: '/maintenance',
      staff: '/staff',
      retail: '/retail',
      gates: '/gates',
    };

    const targetRoute = routeMap[alert.module] || '/';
    navigate(`${targetRoute}?search=${alert.recordId}`);
  };

  const columns: ColumnDef<OpsAlert>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={paged.length > 0 && paged.every((a) => selectedIds.has(a.id))}
          onChange={toggleSelectAll}
          className="rounded border-border bg-bg-elevated text-accent-primary cursor-pointer h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      className: 'w-10 text-center',
      render: (a) => (
        <input
          type="checkbox"
          checked={selectedIds.has(a.id)}
          onChange={() => toggleSelect(a.id)}
          className="rounded border-border bg-bg-elevated text-accent-primary cursor-pointer h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'id',
      header: 'Alert ID',
      sortable: true,
      render: (a) => {
        const IconComponent = moduleIconMap[a.module] || Bell;
        return (
          <div className="flex items-center gap-2">
            <IconComponent size={14} className="text-text-secondary" />
            <span className="font-data font-semibold text-accent-primary">{a.id}</span>
          </div>
        );
      },
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (a) => {
        const severityMap: Record<OpsAlert['severity'], 'critical' | 'warning' | 'info' | 'inactive'> = {
          CRITICAL: 'critical',
          HIGH: 'critical',
          MEDIUM: 'warning',
          LOW: 'info',
          INFO: 'inactive',
        };
        return <StatusBadge status={a.severity} variant={severityMap[a.severity]} />;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => {
        const status = a.status || 'Created';
        const variantMap: Record<AlertStatus, 'critical' | 'info' | 'warning' | 'ok' | 'inactive'> = {
          Created: 'critical',
          Acknowledged: 'info',
          Investigating: 'warning',
          Resolved: 'ok',
          Closed: 'inactive',
        };
        return <StatusBadge status={status} variant={variantMap[status]} />;
      },
    },
    {
      key: 'message',
      header: 'Incident Description',
      render: (a) => {
        const status = a.status || 'Created';
        const isUrgent = (a.severity === 'CRITICAL' || a.severity === 'HIGH') && status === 'Created';
        return (
          <div className="flex flex-col gap-0.5">
            <span className={isUrgent ? 'text-status-critical font-bold' : 'text-text-primary'}>
              {a.message}
            </span>
            <span className="text-[10px] text-text-secondary font-data">
              Ref ID: {a.recordId}
            </span>
          </div>
        );
      },
    },
    {
      key: 'timestamp',
      header: 'Occurred',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (a) => <span className="font-data text-text-secondary">{formatDateTime(a.timestamp)}</span>,
    },
    {
      key: 'actions',
      header: 'Operations',
      className: 'text-right',
      render: (a) => {
        const status = a.status || 'Created';
        return (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {status === 'Created' && (
              <>
                <button
                  type="button"
                  onClick={() => updateAlertStatus(a.id, 'Acknowledged')}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
                >
                  Ack
                </button>
                <button
                  type="button"
                  onClick={() => updateAlertStatus(a.id, 'Investigating')}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-status-warning/20 text-status-warning hover:bg-status-warning/30 transition-colors"
                >
                  Investigate
                </button>
              </>
            )}

            {status === 'Acknowledged' && (
              <>
                <button
                  type="button"
                  onClick={() => updateAlertStatus(a.id, 'Investigating')}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-status-warning/20 text-status-warning hover:bg-status-warning/30 transition-colors"
                >
                  Investigate
                </button>
                <button
                  type="button"
                  onClick={() => updateAlertStatus(a.id, 'Resolved')}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-status-ok/20 text-status-ok hover:bg-status-ok/30 transition-colors"
                >
                  Resolve
                </button>
              </>
            )}

            {status === 'Investigating' && (
              <button
                type="button"
                onClick={() => updateAlertStatus(a.id, 'Resolved')}
                className="px-2 py-1 text-[10px] font-bold rounded bg-status-ok/20 text-status-ok hover:bg-status-ok/30 transition-colors"
              >
                Resolve
              </button>
            )}

            {status === 'Resolved' && (
              <button
                type="button"
                onClick={() => updateAlertStatus(a.id, 'Closed')}
                className="px-2 py-1 text-[10px] font-bold rounded bg-border text-text-secondary hover:bg-border/80 transition-colors"
              >
                Archive
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavigateToSource(a)}
              className="flex h-6 items-center gap-1 rounded bg-bg-elevated px-2 text-[10px] font-semibold text-text-secondary hover:text-accent-primary transition-colors border border-border"
              aria-label={`View record for alert ${a.id}`}
            >
              <Eye size={12} />
              Inspect
              <ArrowRight size={10} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Incident & Alert Center</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KPICard label="Total Incidents" value={stats.total} icon={Bell} statusColor="info" />
        <KPICard label="New Alerts" value={stats.active} icon={ShieldAlert} statusColor={stats.active > 0 ? 'critical' : 'ok'} />
        <KPICard label="Acknowledged" value={stats.acknowledged} icon={ShieldAlert} statusColor="info" />
        <KPICard label="Investigating" value={stats.investigating} icon={ShieldAlert} statusColor="warning" />
        <KPICard label="Resolved Queue" value={stats.resolved} icon={ShieldAlert} statusColor="ok" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search alert message, ID, record reference…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-accent-primary/10 border border-accent-primary/30 rounded-lg p-3 animate-fade-in text-[13px] tracking-wide">
          <span className="font-semibold text-accent-primary font-data">
            {selectedIds.size} alert(s) selected for bulk commands:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatusChange('Acknowledged')}
              className="px-3 py-1.5 font-bold rounded bg-accent-primary text-bg-primary hover:bg-accent-primary/90 transition-colors text-[10px] sm:text-[11px] uppercase"
            >
              Ack
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange('Investigating')}
              className="px-3 py-1.5 font-bold rounded bg-status-warning text-bg-primary hover:bg-status-warning/90 transition-colors text-[10px] sm:text-[11px] uppercase"
            >
              Investigate
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange('Resolved')}
              className="px-3 py-1.5 font-bold rounded bg-status-ok text-bg-primary hover:bg-status-ok/90 transition-colors text-[10px] sm:text-[11px] uppercase"
            >
              Resolve
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 font-semibold rounded border border-border text-text-secondary hover:text-text-primary transition-colors text-[10px] sm:text-[11px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DataTable
        data={paged}
        columns={columns}
        rowKey={(a) => a.id}
        onRowClick={handleNavigateToSource}
        isLoading={false}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Operational exception alerts logs table"
      />
    </div>
  );
}
