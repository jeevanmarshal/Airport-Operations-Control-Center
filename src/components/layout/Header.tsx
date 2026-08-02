import AOCCLogo from '@/components/common/AOCCLogo';
import { Bell, Menu } from 'lucide-react';
import { useSimulation } from '@/context/SimulationContext';
import { useAlerts } from '@/context/AlertContext';
import { formatSimClock } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { simulatedNow } = useSimulation();
  const { alerts, unacknowledgedCount } = useAlerts();
  const navigate = useNavigate();

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH' && !a.acknowledged).length;
  const opsStatus = criticalCount > 0 ? 'CRITICAL' : highCount > 3 ? 'ADVISORY' : 'NORMAL';
  const opsColor = opsStatus === 'CRITICAL' ? 'text-status-critical border-status-critical/40 bg-status-critical/10 shadow-glow-critical'
    : opsStatus === 'ADVISORY' ? 'text-status-warning border-status-warning/40 bg-status-warning/10 shadow-glow-warning'
    : 'text-status-ok border-status-ok/40 bg-status-ok/10 shadow-glow-ok';

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-bg-card px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded p-1.5 text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary lg:hidden shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        
        <AOCCLogo className="h-10 w-10 sm:h-12 sm:w-12 shrink-0" />
        
        <div className="flex flex-col min-w-0 justify-center pb-0.5">
          <div className="flex items-baseline gap-2 sm:gap-3 mb-0.5">
            <span className="text-[22px] sm:text-[24px] md:text-[26px] font-bold text-text-primary leading-none tracking-tight">DEL</span>
            <span className="hidden sm:block text-[14px] md:text-[16px] font-semibold text-text-primary leading-none">Indira Gandhi International Airport</span>
          </div>
          
          <span className="hidden md:block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary opacity-70 mt-1">
            Terminal 3 • Airport Operations Control Center
          </span>
          <span className="hidden xs:block md:hidden text-[11px] font-semibold uppercase tracking-wider text-text-secondary opacity-80 mt-0.5">
            Terminal 3 • AOCC
          </span>
          <span className="xs:hidden text-[11px] font-semibold uppercase tracking-wider text-text-secondary opacity-80 mt-0.5">
            Airport Operations
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 font-data text-[14px] tracking-wide text-accent-primary" aria-live="off">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ok opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-status-ok"></span>
        </span>
        <span>{formatSimClock(simulatedNow)}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="relative flex h-8 sm:h-10 min-w-[36px] sm:min-w-[44px] items-center justify-center rounded-md border border-border px-1.5 sm:px-2 text-text-secondary hover:border-accent-primary hover:text-accent-primary"
          aria-label={`${unacknowledgedCount} unacknowledged alerts`}
        >
          <Bell size={16} />
          {unacknowledgedCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] animate-pulse-slow items-center justify-center rounded-full bg-status-critical px-1 text-[9px] sm:text-[10px] font-bold text-white">
              {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
            </span>
          )}
        </button>
        <span className={`rounded-full border px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide shrink-0 ${opsColor}`}>
          {opsStatus}
        </span>
      </div>
    </header>
  );
}
