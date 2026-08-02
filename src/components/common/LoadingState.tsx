import React from 'react';

export default function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading data" className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 w-full animate-pulse rounded-md bg-bg-elevated" style={{ animationDelay: `${i * 40}ms` }} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
