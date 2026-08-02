import { BrowserRouter } from 'react-router-dom';
import AOCCLogo from '@/components/common/AOCCLogo';
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
      <div className="flex h-screen flex-col items-center justify-center gap-8 bg-bg-primary p-6">
        <AOCCLogo className="w-24 h-24 animate-pulse-slow" />
        <div className="flex flex-col items-center gap-4">
          <div className="font-data text-[13px] text-accent-primary uppercase tracking-[0.2em] font-semibold">
            INITIALIZING AOCC DATASET…
          </div>
          <div className="w-72"><LoadingState rows={3} /></div>
        </div>
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
