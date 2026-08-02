import { Routes, Route, useLocation } from 'react-router-dom';
import PageTransition from '@/components/common/PageTransition';
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
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><DashboardPage /></PageTransition>} />
      <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
      <Route path="/flights" element={<PageTransition><FlightsPage /></PageTransition>} />
      <Route path="/gates" element={<PageTransition><GatesPage /></PageTransition>} />
      <Route path="/baggage" element={<PageTransition><BaggagePage /></PageTransition>} />
      <Route path="/passengers" element={<PageTransition><PassengersPage /></PageTransition>} />
      <Route path="/security" element={<PageTransition><SecurityPage /></PageTransition>} />
      <Route path="/maintenance" element={<PageTransition><MaintenancePage /></PageTransition>} />
      <Route path="/staff" element={<PageTransition><StaffPage /></PageTransition>} />
      <Route path="/retail" element={<PageTransition><RetailPage /></PageTransition>} />
      <Route path="/alerts" element={<PageTransition><AlertsPage /></PageTransition>} />
      <Route path="*" element={<PageTransition><DashboardPage /></PageTransition>} />
    </Routes>
  );
}
