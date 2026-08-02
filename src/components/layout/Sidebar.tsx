import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import AOCCLogo from '@/components/common/AOCCLogo';
import {
  LayoutGrid, PlaneTakeoff, DoorOpen, Luggage, Users, ShieldCheck, Wrench, UserCog, ShoppingBag, Bell, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/flights', label: 'Flights', icon: PlaneTakeoff },
  { to: '/gates', label: 'Gates', icon: DoorOpen },
  { to: '/baggage', label: 'Baggage', icon: Luggage },
  { to: '/passengers', label: 'Passengers', icon: Users },
  { to: '/security', label: 'Security', icon: ShieldCheck },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/staff', label: 'Staff', icon: UserCog },
  { to: '/retail', label: 'Retail', icon: ShoppingBag },
  { to: '/alerts', label: 'Alerts', icon: Bell },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Navigation container */}
      <nav
        aria-label="Module navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-border bg-bg-card py-4 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:flex lg:w-52 lg:translate-x-0 lg:items-stretch lg:px-2 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-border/60 lg:hidden mb-2">
          <div className="flex items-center gap-2">
            <AOCCLogo className="h-6 w-6 shrink-0" />
            <div className="text-[14px] font-bold text-accent-primary uppercase tracking-wider">AOCC Modules</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1 px-2 lg:px-0">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors ${
                  isActive
                    ? 'bg-accent-primary/10 text-accent-primary border-l-2 border-accent-primary font-medium'
                    : 'text-text-secondary border-l-2 border-transparent hover:bg-bg-elevated hover:text-text-primary'
                }`
              }
            >
              <Icon size={19} aria-hidden="true" className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
