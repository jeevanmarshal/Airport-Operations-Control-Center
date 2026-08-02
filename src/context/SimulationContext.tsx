import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { SimSpeed } from '@/types';

export const SIMULATION_START = new Date('2024-10-15T08:00:00');
export const SIMULATION_END = new Date('2024-12-30T23:59:59');
const BASE_SPEED_SECONDS = 60; // 1 real second = 60 simulated seconds at 1x

interface SimulationContextType {
  simulatedNow: Date;
  speed: SimSpeed;
  setSpeed: (s: SimSpeed) => void;
  isRunning: boolean;
  toggleSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType>({
  simulatedNow: SIMULATION_START,
  speed: 1,
  setSpeed: () => {},
  isRunning: true,
  toggleSimulation: () => {},
});

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simulatedNow, setSimulatedNow] = useState<Date>(SIMULATION_START);
  const [speed, setSpeed] = useState<SimSpeed>(1);
  const [isRunning, setIsRunning] = useState(true);
  const speedRef = useRef(speed);
  const runningRef = useRef(isRunning);
  speedRef.current = speed;
  runningRef.current = isRunning;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!runningRef.current) return;
      setSimulatedNow((prev) => {
        const next = new Date(prev.getTime() + BASE_SPEED_SECONDS * speedRef.current * 1000);
        return next > SIMULATION_END ? new Date(SIMULATION_START) : next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SimulationContext.Provider
      value={{ simulatedNow, speed, setSpeed, isRunning, toggleSimulation: () => setIsRunning((r) => !r) }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}
