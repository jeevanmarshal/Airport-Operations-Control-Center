import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useSimulation } from '@/context/SimulationContext';
import { useFilter } from '@/hooks/useFilter';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import DataTable, { ColumnDef } from '@/components/common/DataTable';
import KPICard from '@/components/common/KPICard';
import ChartWrapper from '@/components/common/ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { ShoppingCart, DollarSign, Receipt, Tag } from 'lucide-react';
import { formatINR, formatDateTime } from '@/utils/formatters';
import type { RetailTransaction } from '@/types';

export default function RetailPage() {
  const { retailTransactions, raw, isLoading } = useData();
  const { simulatedNow } = useSimulation();
  const simTime = { h: simulatedNow.getHours() };
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Filters
  const filterDefs = useMemo(() => {
    const storeTypes = Array.from(new Set(retailTransactions.map((t) => t.store_type)));
    const categories = Array.from(new Set(retailTransactions.map((t) => t.product_category)));
    const methods = Array.from(new Set(retailTransactions.map((t) => t.payment_method)));

    return [
      {
        key: 'store_type',
        label: 'Store Type',
        options: [{ label: 'All Store Types', value: 'ALL' }, ...storeTypes.map((st) => ({ label: st, value: st }))],
      },
      {
        key: 'product_category',
        label: 'Product Category',
        options: [{ label: 'All Categories', value: 'ALL' }, ...categories.map((c) => ({ label: c, value: c }))],
      },
      {
        key: 'payment_method',
        label: 'Payment Method',
        options: [{ label: 'All Methods', value: 'ALL' }, ...methods.map((m) => ({ label: m, value: m }))],
      },
      {
        key: 'is_duty_free',
        label: 'Duty Free Only',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Duty Free', value: 'true' },
          { label: 'Regular Retail', value: 'false' },
        ],
      },
    ];
  }, [retailTransactions]);

  const filterPredicates = useMemo(() => {
    return {
      store_type: (t: RetailTransaction, v: unknown) => t.store_type === v,
      product_category: (t: RetailTransaction, v: unknown) => t.product_category === v,
      payment_method: (t: RetailTransaction, v: unknown) => t.payment_method === v,
      is_duty_free: (t: RetailTransaction, v: unknown) => t.is_duty_free === (v === 'true'),
    };
  }, []);

  const sortAccessor = (t: RetailTransaction, key: string) => {
    switch (key) {
      case 'total_amount_inr': return t.total_amount_inr;
      case 'transaction_time': return t.transaction_time ?? 0;
      case 'transaction_id': return t.transaction_id;
      default: return '';
    }
  };

  const {
    filters, setFilter, clearFilters, sort, toggleSort, paged, page, setPage, totalPages, total, filtered
  } = useFilter<RetailTransaction>({
    data: search ? raw.retailTransactions : retailTransactions,
    searchFields: [(t) => t.transaction_id, (t) => t.pnr_code, (t) => t.flight_id, (t) => t.staff_id],
    sortAccessor,
    filterPredicates,
    pageSize: 50,
    searchQuery: search,
    setSearchQuery: setSearch,
  });

  // Stats
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let dutyFreeCount = 0;

    for (const t of filtered) {
      totalRevenue += t.total_amount_inr;
      if (t.is_duty_free) dutyFreeCount++;
    }

    const avgValue = filtered.length ? totalRevenue / filtered.length : 0;

    return {
      total: filtered.length,
      revenue: totalRevenue,
      avgVal: avgValue,
      dutyFree: dutyFreeCount,
    };
  }, [filtered]);

  // Hourly volume chart aggregation
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      transactions: 0,
      revenue: 0,
    }));

    for (const t of filtered) {
      if (t.transaction_time) {
        const hour = new Date(t.transaction_time).getHours();
        hours[hour].transactions++;
        hours[hour].revenue += t.total_amount_inr;
      }
    }

    return hours;
  }, [filtered]);

  // Category distribution chart aggregation
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
       map.set(t.product_category, (map.get(t.product_category) || 0) + t.total_amount_inr);
    }
    return Array.from(map.entries()).map(([category, revenue]) => ({ category: category || 'Unknown', revenue }));
  }, [filtered]);

  const topFlights = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
       map.set(t.flight_id, (map.get(t.flight_id) || 0) + t.total_amount_inr);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([flight_id, revenue]) => ({ flight_id, revenue }));
  }, [filtered]);



  const columns: ColumnDef<RetailTransaction>[] = [
    {
      key: 'transaction_id',
      header: 'Transaction ID',
      sortable: true,
      render: (t) => <span className="font-data font-semibold text-accent-primary">{t.transaction_id}</span>,
    },
    {
      key: 'flight_id',
      header: 'Flight ID',
      render: (t) => <span className="font-data text-accent-primary hover:underline cursor-pointer" onClick={() => navigate(`/flights?search=${t.flight_id}`)}>{t.flight_id}</span>,
    },
    {
      key: 'pnr_code',
      header: 'PNR Code',
      className: 'hidden md:table-cell',
      render: (t) => <span className="font-data text-accent-primary hover:underline cursor-pointer" onClick={() => navigate(`/passengers?search=${t.pnr_code}`)}>{t.pnr_code}</span>,
    },
    {
      key: 'product_category',
      header: 'Product Category',
      render: (t) => <span>{t.product_category}</span>,
    },
    {
      key: 'store_type',
      header: 'Store',
      className: 'hidden sm:table-cell',
      render: (t) => <span>{t.store_type}</span>,
    },
    {
      key: 'payment_method',
      header: 'Payment',
      className: 'hidden md:table-cell',
      render: (t) => <span className="text-[12px]">{t.payment_method}</span>,
    },
    {
      key: 'total_amount_inr',
      header: 'Total Amount',
      sortable: true,
      className: 'text-right',
      render: (t) => <span className="font-data font-semibold text-status-ok">{formatINR(t.total_amount_inr)}</span>,
    },
    {
      key: 'transaction_time',
      header: 'Time',
      sortable: true,
      render: (t) => <span className="font-data text-text-secondary">{formatDateTime(t.transaction_time)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Retail Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Total Sales Revenue" value={formatINR(stats.revenue)} icon={DollarSign} statusColor="ok" />
        <KPICard label="Transactions Count" value={stats.total} icon={Receipt} statusColor="info" />
        <KPICard label="Avg Ticket Value" value={formatINR(stats.avgVal)} icon={ShoppingCart} statusColor="info" />
        <KPICard label="Duty Free Transactions" value={stats.dutyFree} icon={Tag} statusColor="ok" />
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartWrapper title="Hourly Transaction Flow Volume (24h clock)">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#7a9bb5" fontSize={11} tickLine={false} />
                <YAxis stroke="#7a9bb5" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#102030', borderColor: '#1a3a5c', borderRadius: '6px' }}
                  labelStyle={{ color: '#e8f4fd', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="transactions" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Transactions" />
                <ReferenceLine x={`${String(simTime.h).padStart(2, '0')}:00`} stroke="#ff3b5c" strokeDasharray="3 3" label={{ position: 'top', value: 'Now', fill: '#ff3b5c', fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>

        <ChartWrapper title="Hourly Revenue Summary (INR)">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#7a9bb5" fontSize={11} tickLine={false} />
                <YAxis stroke="#7a9bb5" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#102030', borderColor: '#1a3a5c', borderRadius: '6px' }}
                  labelStyle={{ color: '#e8f4fd', fontWeight: 'bold' }}
                  formatter={(v) => [formatINR(Number(v)), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#00ff88" radius={[4, 4, 0, 0]} name="Revenue (INR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>

        <ChartWrapper title="Category Spend Distribution">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
                <Pie data={categoryData} dataKey="revenue" nameKey="category" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}>
                  {categoryData.map((entry, index) => {
                     const colors = ['#00d4ff', '#00ff88', '#ff6b35', '#B580FF', '#FF3B5C', '#ffb800'];
                     return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#102030', borderColor: '#1a3a5c', borderRadius: '6px' }}
                  formatter={(v) => [formatINR(Number(v)), 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mt-2">
        <div className="lg:w-1/3 flex flex-col gap-3">
          <h2 className="text-[14px] font-semibold text-text-primary uppercase tracking-wider">Top 15 Revenue by Flight</h2>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] bg-bg-card p-3 rounded-lg border border-border">
            {topFlights.map((f, i) => (
              <div key={f.flight_id} className="flex justify-between items-center text-[12px] p-1.5 border-b border-border/50 last:border-0 hover:bg-bg-elevated cursor-pointer" onClick={() => navigate(`/flights?search=${f.flight_id}`)}>
                <div className="flex gap-2 items-center">
                  <span className="font-data text-text-secondary w-4">{i + 1}.</span>
                  <span className="font-data font-semibold text-accent-primary">{f.flight_id}</span>
                </div>
                <span className="font-data text-status-ok font-bold">{formatINR(f.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search transaction ID, PNR, flight ID, clerk ID…" />
            <FilterBar defs={filterDefs} filters={filters} onChange={setFilter} onClear={clearFilters} />
          </div>

          <DataTable
            data={paged}
            columns={columns}
            rowKey={(t) => t.transaction_id}
            isLoading={isLoading}
            sort={sort}
            onSort={toggleSort}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            caption="Retail transaction history log table"
          />
        </div>
      </div>
    </div>
  );
}
