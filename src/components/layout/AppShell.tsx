import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-bg-primary">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex min-h-0 flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6" tabIndex={-1}>
          <ErrorBoundary label="Page">{children}</ErrorBoundary>
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
