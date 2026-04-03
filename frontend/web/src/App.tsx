import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/customer/Home';
import CustomerLogin from './pages/customer/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import MovieManagement from './pages/admin/MovieManagement';
import ArtistManagement from './pages/admin/ArtistManagement';
import ProductManagement from './pages/admin/ProductManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import StaffManagement from './pages/admin/StaffManagement';
import ReviewManagement from './pages/admin/ReviewManagement';
import OrderManagement from './pages/admin/OrderManagement';
import PromotionManagement from './pages/admin/PromotionManagement';
import PriceManagement from './pages/admin/PriceManagement';
import CinemaManagement from './pages/admin/CinemaManagement';
import HolidayManagement from './pages/admin/HolidayManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer & Guest Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<CustomerLogin />} />
        </Route>

        {/* Admin & Employee Routes */}
        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />

          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="movies" element={<MovieManagement />} />
            <Route path="artists" element={<ArtistManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="schedules" element={<ScheduleManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="promotions" element={<PromotionManagement />} />
            <Route path="holidays" element={<HolidayManagement />} />
            <Route path="prices" element={<PriceManagement />} />
            <Route path="cinemas" element={<CinemaManagement />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
