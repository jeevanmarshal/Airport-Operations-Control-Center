import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useSimulation } from '@/context/SimulationContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import KPICard from '@/components/common/KPICard';
import { Users, AlertOctagon, UserCheck, ShieldAlert, BadgeInfo } from 'lucide-react';
import StaffDetailPanel from './StaffDetailPanel';
import type { StaffShift } from '@/types';

export default function StaffPage() {
  const { staffShifts, raw, isLoading } = useData();
  const { simulatedNow } = useSimulation();
  const [params] = useSearchParams();
  const [selectedStaff, setSelectedStaff] = useState<StaffShift | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = params.get('search');
    if (q) setSearch(q);
  }, [params]);

  useEffect(() => {
    const q = params.get('search');
    if (q && raw.staffShifts.length) {
      const match = raw.staffShifts.find((s) => s.staff_id === q);
      if (match) setSelectedStaff(match);
    }
  }, [params, raw.staffShifts]);

  const stats = useMemo(() => {
    let overtimeCount = 0;
    let expiredCount = 0;
    let expiringCount = 0;
    let activeCount = 0;
    const uniqueGates = new Set<string>();

    for (const st of staffShifts) {
      if (st.is_overtime) overtimeCount++;
      if (st.gate) uniqueGates.add(st.gate);

      const expiry = st.certification_expiry;
      if (expiry) {
        const isExpired = expiry.getTime() < simulatedNow.getTime();
        const isExpiring = !isExpired && (expiry.getTime() - simulatedNow.getTime()) / (1000 * 60 * 60 * 24) <= 30;

        if (isExpired) expiredCount++;
        else if (isExpiring) expiringCount++;
        else activeCount++;
      }
    }

    return {
      total: staffShifts.length,
      overtime: overtimeCount,
      expired: expiredCount,
      expiring: expiringCount,
      active: activeCount,
      gates: uniqueGates.size,
    };
  }, [staffShifts, simulatedNow]);

  const filterDefs = useMemo(() => {
    const departments = Array.from(new Set(staffShifts.map((s) => s.department)));
    const roles = Array.from(new Set(staffShifts.map((s) => s.role)));
    const gates = Array.from(new Set(staffShifts.map((s) => s.gate)));

    return [
      {
        key: 'department',
        label: 'Department',
        options: [{ label: 'All', value: 'ALL' }, ...departments.map((d) => ({ label: d, value: d }))],
      },
      {
        key: 'role',
        label: 'Role',
        options: [{ label: 'All', value: 'ALL' }, ...roles.map((r) => ({ label: r, value: r }))],
      },
      {
        key: 'gate',
        label: 'Gate',
        options: [{ label: 'All', value: 'ALL' }, ...gates.map((g) => ({ label: `Gate ${g}`, value: g }))],
      },
      {
        key: 'is_overtime',
        label: 'Overtime status',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Overtime', value: 'true' },
          { label: 'Regular Hours', value: 'false' },
        ],
      },
      {
        key: 'cert_status',
        label: 'Certification',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Expiring Soon (<30d)', value: 'EXPIRING_SOON' },
          { label: 'Expired', value: 'EXPIRED' },
        ],
      },
    ];
  }, [staffShifts]);

  const filterPredicates = useMemo(() => {
    return {
      department: (s: StaffShift, v: unknown) => s.department === v,
      role: (s: StaffShift, v: unknown) => s.role === v,
      gate: (s: StaffShift, v: unknown) => s.gate === v,
      is_overtime: (s: StaffShift, v: unknown) => s.is_overtime === (v === 'true'),
      cert_status: (s: StaffShift, v: unknown) => {
        const expiry = s.certification_expiry;
        if (!expiry) return v === 'ALL';
        const isExpired = expiry.getTime() < simulatedNow.getTime();
        const isExpiring = !isExpired && (expiry.getTime() - simulatedNow.getTime()) / (1000 * 60 * 60 * 24) <= 30;

        if (v === 'EXPIRED') return isExpired;
        if (v === 'EXPIRING_SOON') return isExpiring;
        if (v === 'ACTIVE') return !isExpired && !isExpiring;
        return true;
      },
    };
  }, [simulatedNow]);

  const sortAccessor = (s: StaffShift, key: string) => {
    switch (key) {
      case 'hours_worked': return s.hours_worked;
      case 'certification_expiry': return s.certification_expiry ?? 0;
      case 'staff_id': return s.staff_id;
      case 'name': return s.name;
      default: return '';
    }
  };

  const {
    filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total,
  } = useFilter<StaffShift>({
    data: search ? raw.staffShifts : staffShifts,
    searchFields: [(s) => s.staff_id, (s) => s.name, (s) => s.supervisor_id],
    sortAccessor,
    filterPredicates,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  const columns: ColumnDef<StaffShift>[] = [
    {
      key: 'staff_id',
      header: 'Staff ID',
      sortable: true,
      render: (s) => <span className="font-data font-semibold text-accent-primary">{s.staff_id}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (s) => <span>{s.name}</span>,
    },
    {
      key: 'role',
      header: 'Role / Dept',
      render: (s) => <span>{s.role} <span className="text-[11px] text-text-secondary">({s.department})</span></span>,
    },
    {
      key: 'gate',
      header: 'Gate',
      className: 'hidden sm:table-cell',
      render: (s) => <span className="font-data">{s.gate ? `Gate ${s.gate}` : 'Unassigned'}</span>,
    },
    {
      key: 'hours_worked',
      header: 'Hours',
      sortable: true,
      className: 'text-right',
      render: (s) => (
        <span className="font-data">
          {s.hours_worked} hr
          {s.is_overtime && <span className="text-[10px] text-status-warning bg-status-warning/10 px-1 rounded ml-1">OT</span>}
        </span>
      ),
    },
    {
      key: 'certification_expiry',
      header: 'Cert Expiry',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (s) => {
        const exp = s.certification_expiry;
        if (!exp) return <span className="text-text-muted">None</span>;
        const isExpired = exp.getTime() < simulatedNow.getTime();
        const isExpiring = !isExpired && (exp.getTime() - simulatedNow.getTime()) / (1000 * 60 * 60 * 24) <= 30;

        return (
          <span className={`font-data ${isExpired ? 'text-status-critical font-bold' : isExpiring ? 'text-status-warning font-semibold' : 'text-text-primary'}`}>
            {exp.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'cert_status',
      header: 'Cert Status',
      render: (s) => {
        const exp = s.certification_expiry;
        if (!exp) return <StatusBadge status="No Cert" variant="inactive" />;
        const isExpired = exp.getTime() < simulatedNow.getTime();
        const isExpiring = !isExpired && (exp.getTime() - simulatedNow.getTime()) / (1000 * 60 * 60 * 24) <= 30;

        if (isExpired) return <StatusBadge status="EXPIRED" variant="critical" />;
        if (isExpiring) return <StatusBadge status="Expiring" variant="warning" />;
        return <StatusBadge status="Active" variant="ok" />;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Staff Operations</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KPICard label="Total on Shift" value={stats.total} icon={Users} statusColor="ok" />
        <KPICard label="Overtime Active" value={stats.overtime} icon={BadgeInfo} statusColor={stats.overtime > 0 ? 'warning' : 'ok'} />
        <KPICard label="Expired Certs" value={stats.expired} icon={AlertOctagon} statusColor={stats.expired > 0 ? 'critical' : 'ok'} />
        <KPICard label="Expiring Soon" value={stats.expiring} icon={ShieldAlert} statusColor={stats.expiring > 0 ? 'warning' : 'ok'} />
        <KPICard label="Active Certs" value={stats.active} icon={UserCheck} statusColor="ok" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search staff name, ID, supervisor ID…" />
        <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
      </div>

      <DataTable
        data={paged}
        columns={columns}
        rowKey={(s) => s.staff_id}
        onRowClick={setSelectedStaff}
        isLoading={isLoading}
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        caption="Staff shift rosters and safety compliance table"
      />

      <StaffDetailPanel
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />
    </div>
  );
}
