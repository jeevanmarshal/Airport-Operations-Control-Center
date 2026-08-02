import { Routes, Route } from 'react-router-dom';
import DashboardPage from '@/components/dashboard/DashboardPage';
import FlightsPage from '@/components/flights/FlightsPage';
import GatesPage from '@/components/gates/GatesPage';
import BaggagePage from '@/components/baggage/BaggagePage';
import PassengersPage from '@/components/passengers/PassengersPage';
import SecurityPage from '@/components/security/SecurityPage';
import MaintenancePage from '@/components/maintenance/MaintenancePage';
import StaffPage from '@/components/staff/StaffPage';
import RetailPage from '@/components/retail/RetailPage';
import AlertsPage from '@/components/alerts/AlertsPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/flights" element={<FlightsPage />} />
      <Route path="/gates" element={<GatesPage />} />
      <Route path="/baggage" element={<BaggagePage />} />
      <Route path="/passengers" element={<PassengersPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/retail" element={<RetailPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}
