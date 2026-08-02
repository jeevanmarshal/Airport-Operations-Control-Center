import React, { createContext, useContext, useState, useEffect } from 'react';
import type { OpsAlert, AlertStatus } from '@/types';
import { useData } from './DataContext';
import { useSimulation } from './SimulationContext';
import { generateAlerts } from '@/utils/alertGenerator';

interface AlertContextType {
  alerts: OpsAlert[];
  unacknowledgedCount: number;
  acknowledgeAlert: (id: string) => void;
  updateAlertStatus: (id: string, status: AlertStatus) => void;
}

const AlertContext = createContext<AlertContextType>({
  alerts: [],
  unacknowledgedCount: 0,
  acknowledgeAlert: () => {},
  updateAlertStatus: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const data = useData();
  const { simulatedNow } = useSimulation();
  const [alerts, setAlerts] = useState<OpsAlert[]>([]);

  // Simulation loop engine integration
  useEffect(() => {
    if (data.isLoading) return;

    // Detect alert conditions present in the current simulation tick
    const activeConditions = generateAlerts(data, simulatedNow);

    setAlerts((prevAlerts) => {
      // Unique matching signature
      const activeSignatures = new Set(
        activeConditions.map((a) => `${a.module}-${a.recordId}-${a.severity}-${a.message}`)
      );

      // 1. Process previous alerts list
      const updatedAlerts = prevAlerts.map((existing) => {
        const sig = `${existing.module}-${existing.recordId}-${existing.severity}-${existing.message}`;

        if (activeSignatures.has(sig)) {
          // If the condition is still active but was marked closed, keep it closed so a new one can spawn
          return existing;
        } else {
          // Condition has disappeared -> AUTO-RESOLUTION!
          if (
            existing.status === 'Created' ||
            existing.status === 'Acknowledged' ||
            existing.status === 'Investigating'
          ) {
            return {
              ...existing,
              status: 'Resolved' as const,
              resolvedAt: simulatedNow,
              acknowledged: true,
            };
          }

          // If resolved for more than 40 seconds of simulated time, archive to Closed
          if (existing.status === 'Resolved' && existing.resolvedAt) {
            const elapsedSeconds = (simulatedNow.getTime() - existing.resolvedAt.getTime()) / 1000;
            if (elapsedSeconds > 40) {
              return { ...existing, status: 'Closed' as const };
            }
          }

          return existing;
        }
      });

      // 2. Add newly spawned alert conditions
      activeConditions.forEach((active) => {
        const sig = `${active.module}-${active.recordId}-${active.severity}-${active.message}`;
        const alreadyRegistered = prevAlerts.some(
          (existing) =>
            `${existing.module}-${existing.recordId}-${existing.severity}-${existing.message}` === sig &&
            existing.status !== 'Closed'
        );

        if (!alreadyRegistered) {
          updatedAlerts.push({
            ...active,
            status: 'Created',
            timestamp: simulatedNow,
          });
        }
      });

      // Sort by Severity priority, then newest timestamp
      const severityOrder: Record<OpsAlert['severity'], number> = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
        INFO: 4,
      };

      return [...updatedAlerts].sort(
        (a, b) =>
          severityOrder[a.severity] - severityOrder[b.severity] ||
          b.timestamp.getTime() - a.timestamp.getTime()
      );
    });
  }, [data.isLoading, simulatedNow]);

  const updateAlertStatus = (id: string, status: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const acknowledged = status !== 'Created';
          const resolvedAt = status === 'Resolved' ? simulatedNow : a.resolvedAt;
          return { ...a, status, acknowledged, resolvedAt };
        }
        return a;
      })
    );
  };

  const acknowledgeAlert = (id: string) => updateAlertStatus(id, 'Acknowledged');

  const unacknowledgedCount = alerts.filter((a) => a.status === 'Created').length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unacknowledgedCount,
        acknowledgeAlert,
        updateAlertStatus,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}
