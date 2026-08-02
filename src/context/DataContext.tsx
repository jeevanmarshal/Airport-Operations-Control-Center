import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { AllData } from '@/types';
import {
  loadFlights, loadPassengers, loadBaggage, loadGateEvents,
  loadSecurityScreenings, loadMaintenanceLogs, loadStaffShifts, loadRetailTransactions,
} from '@/utils/csvParser';
import { useSimulation } from './SimulationContext';

interface DataContextType extends AllData {
  raw: AllData;
  isLoading: boolean;
  error: string | null;
}

const empty: AllData = {
  flights: [], passengers: [], baggage: [], gateEvents: [],
  securityScreenings: [], maintenanceLogs: [], staffShifts: [], retailTransactions: [],
};

const DataContext = createContext<DataContextType>({ ...empty, raw: empty, isLoading: true, error: null });

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AllData>(empty);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { simulatedNow } = useSimulation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [flights, passengers, baggage, gateEvents, securityScreenings, maintenanceLogs, staffShifts, retailTransactions] =
          await Promise.all([
            loadFlights(), loadPassengers(), loadBaggage(), loadGateEvents(),
            loadSecurityScreenings(), loadMaintenanceLogs(), loadStaffShifts(), loadRetailTransactions(),
          ]);
        if (cancelled) return;
        setData({ flights, passengers, baggage, gateEvents, securityScreenings, maintenanceLogs, staffShifts, retailTransactions });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load operational dataset.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const simulatedData = useMemo(() => {
    if (isLoading || error) return { ...empty, raw: empty };

    // Operational Window for Flights: scheduled departure between [simulatedNow - 12h, simulatedNow + 24h]
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const windowStart = new Date(simulatedNow.getTime() - twelveHoursMs);
    const windowEnd = new Date(simulatedNow.getTime() + twentyFourHoursMs);

    const flights = data.flights.filter(
      (f) => f.scheduled_departure >= windowStart && f.scheduled_departure <= windowEnd
    );

    // Other events: occur on or before simulatedNow
    const passengers = data.passengers.filter(
      (p) => p.check_in_time && p.check_in_time <= simulatedNow
    );
    const baggage = data.baggage.filter(
      (b) => b.timestamp && b.timestamp <= simulatedNow
    );
    const gateEvents = data.gateEvents.filter(
      (g) => g.event_time && g.event_time <= simulatedNow
    );
    const securityScreenings = data.securityScreenings.filter(
      (s) => s.screening_time && s.screening_time <= simulatedNow
    );
    const maintenanceLogs = data.maintenanceLogs.filter(
      (m) => m.start_time && m.start_time <= simulatedNow
    );
    const staffShifts = data.staffShifts.filter(
      (s) => s.shift_start && s.shift_start <= simulatedNow
    );
    const retailTransactions = data.retailTransactions.filter(
      (r) => r.transaction_time && r.transaction_time <= simulatedNow
    );

    return {
      flights,
      passengers,
      baggage,
      gateEvents,
      securityScreenings,
      maintenanceLogs,
      staffShifts,
      retailTransactions,
      raw: data,
    };
  }, [data, simulatedNow, isLoading, error]);

  return (
    <DataContext.Provider value={{ ...simulatedData, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
