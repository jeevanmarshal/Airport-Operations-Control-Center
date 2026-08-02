import React from 'react';

export function DetailField({ label, value, onClick, className }: { label: string; value: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-[13px]">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-data text-right text-text-primary ${className ?? ''} ${onClick ? 'cursor-pointer text-accent-primary hover:underline' : ''}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-[16px] font-semibold text-accent-primary">{title}</h3>
      {children}
    </section>
  );
}

export function LinkedCount({ label, count, onClick }: { label: string; count: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center justify-between rounded-md border border-border bg-bg-elevated px-3 py-2 text-[13px] text-text-primary hover:border-accent-primary disabled:hover:border-border"
    >
      <span>{label}</span>
      <span className="font-data rounded-full bg-accent-primary/10 px-2 py-0.5 text-accent-primary">{count}</span>
    </button>
  );
}
