import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-lg border border-status-critical/40 bg-status-critical/5 py-16 text-center">
      <AlertTriangle size={28} className="text-status-critical" aria-hidden="true" />
      <p className="max-w-md text-[13px] text-text-primary">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-status-critical/50 px-4 py-2 text-[13px] text-status-critical hover:bg-status-critical/10"
        >
          Retry
        </button>
      )}
    </div>
  );
}
