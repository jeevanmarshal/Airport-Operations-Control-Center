import { useState } from 'react';
import { useData } from '@/context/DataContext';
import GateMap from './GateMap';
import GateEventList from './GateEventList';
import GateDetailPanel from './GateDetailPanel';
import FlightDetailPanel from '@/components/flights/FlightDetailPanel';
import KPICard from '@/components/common/KPICard';
import { DoorOpen, AlertOctagon, Sparkles, Wrench } from 'lucide-react';
import type { GateEvent, Flight } from '@/types';

export default function GatesPage() {
  const { flights, gateEvents, isLoading } = useData();
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const handleEventClick = (e: GateEvent) => {
    const flight = flights.find((f) => f.flight_id === e.flight_id);
    if (flight) setSelectedFlight(flight);
  };

  const occupiedGatesCount = Array.from(new Set(flights.map((f) => f.gate))).filter(Boolean).length;
  const availableGatesCount = Math.max(0, 50 - occupiedGatesCount);
  const delayedGatesCount = Array.from(new Set(flights.filter((f) => f.delay_minutes > 0).map((f) => f.gate))).filter(Boolean).length;
  const cleaningCount = gateEvents.filter((e) => /clean/i.test(e.event_type)).length;
  const maintenanceCount = gateEvents.filter((e) => /maint/i.test(e.event_type)).length;
  const utilizationRate = (occupiedGatesCount / 50) * 100;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-semibold text-text-primary">Gate Operations</h1>

      {/* Visual utilization dashboard row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <KPICard label="Occupied Gates" value={occupiedGatesCount} icon={DoorOpen} statusColor="warning" />
        <KPICard label="Available Gates" value={availableGatesCount} icon={DoorOpen} statusColor="ok" />
        <KPICard label="Delayed at Gates" value={delayedGatesCount} icon={AlertOctagon} statusColor={delayedGatesCount > 0 ? 'critical' : 'ok'} />
        <KPICard label="Cleaning Operations" value={cleaningCount} icon={Sparkles} statusColor="info" />
        <KPICard label="Maintenance Holds" value={maintenanceCount} icon={Wrench} statusColor="info" />
      </div>

      {/* Utilization Bar */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <div className="flex items-center justify-between mb-2 text-[12px]">
          <span className="font-semibold text-text-secondary">Terminal T3 Gate Utilization Rate</span>
          <span className="font-bold text-accent-primary font-data">{utilizationRate.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-accent-primary transition-all duration-500" style={{ width: `${utilizationRate}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div className="xl:col-span-2">
          <section aria-label="Gate map, Terminal 3, gates B1 through B50" className="rounded-lg border border-border bg-bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-text-primary">Gate Map — Terminal 3</h2>
              {selectedGate && (
                <button
                  type="button"
                  onClick={() => setSelectedGate(null)}
                  className="text-[12px] text-accent-primary hover:underline"
                >
                  Clear gate filter ({selectedGate})
                </button>
              )}
            </div>
            <GateMap flights={flights} gateEvents={gateEvents} selectedGate={selectedGate} onSelectGate={setSelectedGate} />
          </section>
        </div>

        <div className="xl:col-span-1">
          <section aria-label="Gate events" className="rounded-lg border border-border bg-bg-card p-4">
            <h2 className="mb-3 text-[20px] font-semibold text-text-primary">
              Gate Event Log {selectedGate ? `— Gate ${selectedGate}` : ''}
            </h2>
            <GateEventList events={gateEvents} isLoading={isLoading} onRowClick={handleEventClick} gateFilter={selectedGate} />
          </section>
        </div>
      </div>

      <GateDetailPanel gate={selectedGate} onClose={() => setSelectedGate(null)} />
      <FlightDetailPanel flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
    </div>
  );
}
