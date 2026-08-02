import { useState, useRef, useEffect } from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import type { FilterState, FilterValue } from '@/hooks/useFilter';

export interface FilterDef {
  key: string;
  label: string;
  options: Array<{ value: FilterValue; label: string }>;
}

interface FilterBarProps {
  defs: FilterDef[];
  filters: FilterState;
  onChange: (key: string, value: FilterValue) => void;
  onClear: () => void;
}

function DropdownFilter({
  def,
  value,
  onChange,
}: {
  def: FilterDef;
  value: FilterValue;
  onChange: (val: FilterValue) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const activeOption = def.options.find((o) => String(o.value) === String(value));
  const uniqueOptions = def.options.filter(
    (o) => String(o.value).toUpperCase() !== 'ALL' && String(o.label).toLowerCase() !== 'all'
  );

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 items-center justify-between gap-1.5 rounded-md border bg-bg-card px-3 text-[12px] transition-colors focus:outline-none focus:ring-1 focus:ring-accent-primary/50 ${
          isOpen ? 'border-accent-primary text-accent-primary' : 'border-border text-text-primary hover:border-accent-primary/50 hover:bg-bg-elevated'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[120px] xs:max-w-none">
          {def.label}: {activeOption && String(activeOption.value).toUpperCase() !== 'ALL' ? activeOption.label : 'All'}
        </span>
        <ChevronDown size={14} className={`text-text-secondary shrink-0 transition-transform ${isOpen ? 'rotate-180 text-accent-primary' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute left-0 mt-1.5 z-[99] max-h-60 min-w-[160px] overflow-y-auto rounded-md border border-border bg-bg-card py-1 text-[12px] shadow-2xl focus:outline-none scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          role="listbox"
        >
          <li
            onClick={() => {
              onChange('ALL');
              setIsOpen(false);
            }}
            className={`cursor-pointer px-3 py-2 text-[12px] transition-colors hover:bg-bg-elevated hover:text-accent-primary ${
              value === 'ALL' || value === undefined ? 'bg-accent-primary/10 text-accent-primary font-semibold' : 'text-text-primary'
            }`}
            role="option"
            aria-selected={value === 'ALL' || value === undefined}
          >
            All
          </li>
          {uniqueOptions.map((o) => {
            const isSelected = String(o.value) === String(value);
            return (
              <li
                key={String(o.value)}
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 text-[12px] transition-colors hover:bg-bg-elevated hover:text-accent-primary ${
                  isSelected ? 'bg-accent-primary/10 text-accent-primary font-semibold' : 'text-text-primary'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function FilterBar({ defs, filters, onChange, onClear }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Filters">
      {defs.map((d) => (
        <DropdownFilter
          key={d.key}
          def={d}
          value={filters[d.key]}
          onChange={(val) => onChange(d.key, val)}
        />
      ))}
      <button
        type="button"
        onClick={onClear}
        className="flex h-9 items-center gap-1 rounded-md border border-border bg-bg-card px-3 text-[12px] text-text-secondary transition-colors hover:border-accent-primary hover:text-accent-primary hover:bg-bg-elevated"
      >
        <RotateCcw size={13} /> Clear
      </button>
    </div>
  );
}
