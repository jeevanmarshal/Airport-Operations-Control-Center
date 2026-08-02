import { useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

export type FilterValue = string | boolean | number | 'ALL';
export type FilterState = Record<string, FilterValue>;
export type SortDir = 'asc' | 'desc';

interface UseFilterOptions<T> {
  data: T[];
  searchFields: Array<(item: T) => string>;
  initialFilters?: FilterState;
  initialSort?: { key: keyof T | string; dir: SortDir } | null;
  sortAccessor?: (item: T, key: string) => number | string | Date;
  filterPredicates?: Record<string, (item: T, value: FilterValue) => boolean>;
  pageSize?: number;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export function useFilter<T>({
  data, searchFields, initialFilters = {}, initialSort = null, sortAccessor, filterPredicates = {}, pageSize = 50,
  searchQuery, setSearchQuery,
}: UseFilterOptions<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const search = searchQuery !== undefined ? searchQuery : internalSearch;
  const setSearch = setSearchQuery !== undefined ? setSearchQuery : setInternalSearch;
  const debouncedSearch = useDebounce(search, 200);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  const setFilter = (key: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const clearFilters = () => { setFilters(initialFilters); setSearch(''); setPage(1); };

  const filtered = useMemo(() => {
    let result = data;
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => searchFields.some((f) => f(item)?.toLowerCase().includes(q)));
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value === 'ALL' || value === '' || value === undefined) continue;
      const pred = filterPredicates[key];
      if (pred) result = result.filter((item) => pred(item, value));
    }
    return result;
  }, [data, debouncedSearch, filters, searchFields, filterPredicates]);

  const sorted = useMemo(() => {
    if (!sort || !sortAccessor) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = sortAccessor(a, sort.key as string);
      const bv = sortAccessor(b, sort.key as string);
      let cmp = 0;
      if (av instanceof Date && bv instanceof Date) cmp = av.getTime() - bv.getTime();
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sort, sortAccessor]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      return prev.dir === 'asc' ? { key, dir: 'desc' } : null;
    });
  };

  return {
    search, setSearch, filters, setFilter, clearFilters, sort, toggleSort,
    filtered: sorted, paged, page, setPage, totalPages, pageSize, total: sorted.length,
  };
}
