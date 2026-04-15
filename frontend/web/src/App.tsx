import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Employee Login
import Login from "./pages/employee/Login";

// ADMIN
import AdminDashboard from "./pages/employee/admin/AdminDashboard";
import StaffManagement from "./pages/employee/admin/StaffManagement";
import MovieManagement from "./pages/employee/admin/MovieManagement";
import ArtistManagement from "./pages/employee/admin/ArtistManagement";
import CinemaManagement from "./pages/employee/admin/CinemaManagement";
import CustomerManagement from "./pages/employee/admin/CustomerManagement";
import HolidayManagement from "./pages/employee/admin/HolidayManagement";
import OrderManagement from "./pages/employee/admin/OrderManagement";
import PriceManagement from "./pages/employee/admin/PriceManagement";
import ProductManagement from "./pages/employee/admin/ProductManagement";
import PromotionManagement from "./pages/employee/admin/PromotionManagement";
import ReviewManagement from "./pages/employee/admin/ReviewManagement";
import RoomManagement from "./pages/employee/admin/RoomManagement";
import ScheduleManagement from "./pages/employee/admin/ScheduleManagement";
import SeatManagement from "./pages/employee/admin/SeatManagement";
import SeatTypeManagement from "./pages/employee/admin/SeatTypeManagement";

// MANAGER
import ManagerDashboard from "./pages/employee/manager/ManagerDashboard";
import ManagerOrder from "./pages/employee/manager/OrderManagement";
import ManagerRoom from "./pages/employee/manager/RoomManagement";
import ManagerSchedule from "./pages/employee/manager/ScheduleManagement";
import ManagerSeat from "./pages/employee/manager/SeatManagement";
import ManagerSeatType from "./pages/employee/manager/SeatTypeManagement";
import ManagerStaff from "./pages/employee/manager/StaffManagement";

// STAFF
import SellTickets from "./pages/employee/staff/SellTickets";
import StaffDashboard from "./pages/employee/staff/StaffDashboard";

// CLIENT
import Home from "./pages/client/Home";
import ClientLogin from "./pages/client/ClientLogin";
import Profile from "./pages/client/customer/Profile";

// REDIRECT
import RoleRedirect from "./routes/RoleRedirect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= CLIENT ================= */}
        <Route element={<MainLayout />}>
          {/* PUBLIC */}
          <Route element={<ProtectedRoute type="public" />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* CLIENT LOGIN */}
          <Route path="/login" element={<ClientLogin />} />

          {/* CUSTOMER ONLY */}
          <Route
            element={
              <ProtectedRoute type="client" allowedRoles={["CUSTOMER"]} />
            }
          >
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ================= EMPLOYEE ================= */}
        <Route path="/employee">
          {/* LOGIN */}
          <Route path="login" element={<Login />} />

          {/* PROTECTED EMPLOYEE */}
          <Route element={<ProtectedRoute type="employee" />}>
            <Route element={<AdminLayout />}>
              {/* ADMIN */}
              <Route
                element={
                  <ProtectedRoute type="employee" allowedRoles={["ADMIN"]} />
                }
              >
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/staff" element={<StaffManagement />} />
                <Route path="admin/movies" element={<MovieManagement />} />
                <Route path="admin/artists" element={<ArtistManagement />} />
                <Route path="admin/cinemas" element={<CinemaManagement />} />
                <Route
                  path="admin/customers"
                  element={<CustomerManagement />}
                />
                <Route path="admin/holidays" element={<HolidayManagement />} />
                <Route path="admin/orders" element={<OrderManagement />} />
                <Route path="admin/prices" element={<PriceManagement />} />
                <Route path="admin/products" element={<ProductManagement />} />
                <Route
                  path="admin/promotions"
                  element={<PromotionManagement />}
                />
                <Route path="admin/reviews" element={<ReviewManagement />} />
                <Route path="admin/rooms" element={<RoomManagement />} />
                <Route
                  path="admin/schedules"
                  element={<ScheduleManagement />}
                />
                <Route path="admin/seats" element={<SeatManagement />} />
                <Route
                  path="admin/seat-types"
                  element={<SeatTypeManagement />}
                />

                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* MANAGER */}
              <Route
                element={
                  <ProtectedRoute type="employee" allowedRoles={["MANAGER"]} />
                }
              >
                <Route
                  path="manager/dashboard"
                  element={<ManagerDashboard />}
                />
                <Route path="manager/orders" element={<ManagerOrder />} />
                <Route path="manager/rooms" element={<ManagerRoom />} />
                <Route path="manager/schedules" element={<ManagerSchedule />} />
                <Route path="manager/seats" element={<ManagerSeat />} />
                <Route
                  path="manager/seat-types"
                  element={<ManagerSeatType />}
                />
                <Route path="manager/staff" element={<ManagerStaff />} />

                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* STAFF */}
              <Route
                element={
                  <ProtectedRoute type="employee" allowedRoles={["STAFF"]} />
                }
              >
                <Route path="staff/dashboard" element={<StaffDashboard />} />
                <Route path="staff/sell" element={<SellTickets />} />

                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>
          </Route>

          {/* REDIRECT */}
          <Route index element={<Navigate to="/employee/redirect" replace />} />
        </Route>

        {/* ================= ROLE REDIRECT ================= */}
        <Route path="/employee/redirect" element={<RoleRedirect />} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
