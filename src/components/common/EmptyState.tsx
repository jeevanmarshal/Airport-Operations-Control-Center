import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data available.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-card/50 py-16 text-center">
      <Inbox size={28} className="text-text-muted" aria-hidden="true" />
      <p className="text-[13px] text-text-secondary">{message}</p>
    </div>
  );
}
