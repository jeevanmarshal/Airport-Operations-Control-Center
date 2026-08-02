import { BrowserRouter } from 'react-router-dom';
import { DataProvider, useData } from '@/context/DataContext';
import { SimulationProvider } from '@/context/SimulationContext';
import { AlertProvider } from '@/context/AlertContext';
import AppShell from '@/components/layout/AppShell';
import AppRouter from '@/router/AppRouter';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

function Gate({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useData();
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary p-6">
        <ErrorState message={`Unable to load the operational dataset: ${error}`} onRetry={() => window.location.reload()} />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-bg-primary p-6">
        <div className="font-data text-[13px] text-accent-primary">LOADING AIRPORT OPERATIONS DATASET…</div>
        <div className="w-72"><LoadingState rows={5} /></div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <DataProvider>
          <Gate>
            <AlertProvider>
              <AppShell>
                <AppRouter />
              </AppShell>
            </AlertProvider>
          </Gate>
        </DataProvider>
      </SimulationProvider>
    </BrowserRouter>
  );
}
