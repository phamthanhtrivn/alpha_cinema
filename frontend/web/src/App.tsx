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
import AiPolicyManagement from "./pages/employee/admin/AiPolicyManagement";

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
import Movie from "./pages/employee/staff/Moive";
import CheckTicket from "./pages/employee/staff/CheckTicket";

// CLIENT
import Home from "./pages/client/Home";
import MovieDetail from "./pages/client/MovieDetail";
import ClientLogin from "./pages/client/ClientLogin";
import ForgetPassword from "./pages/client/ForgotPassword";
import ClientResgister from "./pages/client/ClientResgister";
import Profile from "./pages/client/customer/Profile";
import VerifyOtp from "./pages/client/VerifyOtp";
import ResetPassword from "./pages/client/ResetPassword";
import { Checkout } from "./pages/client/customer/Checkout";
import { CheckoutConfirm } from "./pages/client/customer/CheckoutConfirm";
import { PaymentFailed } from "./pages/client/customer/PaymentFailed";
import { PaymentSuccess } from "./pages/client/customer/PaymentSuccess";
import PrivacyPolicy from "./pages/client/PrivacyPolicy";
import PaymentPolicy from "./pages/client/PaymentPolicy";
import TermsAndConditions from "./pages/client/TermsAndConditions";
import AboutUs from "./pages/client/AboutUs";
import Recruitment from "./pages/client/Recruitment";
import MoviesPage from "./pages/client/Movies";
import StarShop from "./pages/client/StarShop";
import ProductDetail from "./pages/client/ProductDetail";

// REDIRECT
import RoleRedirect from "./routes/RoleRedirect";

import { useDispatch, useSelector } from "react-redux";
import { selectAuth, setCredentials } from "./store/slices/authSlice";
import { userService } from "./services/user.service";
import { useEffect } from "react";
import { Booking } from "./pages/client/customer/Booking";
import { store } from "./store";
import Cinematic from "./pages/client/customer/Cinematic";
import CinematicGenres from "./pages/client/customer/CinematicGenres";
import CinematicActorsDirectors from "./pages/client/customer/CinematicActorsDirectors";
import CinematicArtistDetail from "./pages/client/customer/CinematicArtistDetail";
import ScrollToTop from "./components/common/ScrollToTop";
import SellProduct from "./pages/employee/staff/SellProduct";

function App() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector(selectAuth);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          // Lấy token mới nhất từ store (có thể đã được Interceptor cập nhật)
          const latestToken = store.getState().auth.accessToken || accessToken;
          dispatch(
            setCredentials({
              user: response.data,
              accessToken: latestToken as string,
              role: response.data.role,
              cinemaId: response.data.cinemaId || null,
            }),
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, [accessToken, dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ================= CLIENT ================= */}
        <Route element={<MainLayout />}>
          {/* PUBLIC */}
          <Route element={<ProtectedRoute type="public" />}>
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/cinematic" element={<Cinematic />} />
            <Route path="/cinematic/genres" element={<CinematicGenres />} />
            <Route path="/cinematic/actors-directors" element={<CinematicActorsDirectors />} />
            <Route path="/cinematic/artist/:id" element={<CinematicArtistDetail />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/star-shop" element={<StarShop />} />
            <Route path="/star-shop/product/:id" element={<ProductDetail />} />
            <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />
            <Route path="/chinh-sach-thanh-toan" element={<PaymentPolicy />} />
            <Route path="/dieu-khoan-chung" element={<TermsAndConditions />} />
            <Route path="/ve-chung-toi" element={<AboutUs />} />
            <Route path="/tuyen-dung" element={<Recruitment />} />
          </Route>

          {/* CLIENT LOGIN */}
          <Route element={<ProtectedRoute type="guest" />}>
            <Route path="/login" element={<ClientLogin />} />

            <Route path="/register" element={<ClientResgister />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* CUSTOMER ONLY */}
          <Route
            element={
              <ProtectedRoute type="client" allowedRoles={["CUSTOMER"]} />
            }
          >
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route
              path="/booking/:id/checkout/:sessionId"
              element={<Checkout />}
            />
            <Route
              path="/booking/:id/checkout/:sessionId/confirm"
              element={<CheckoutConfirm />}
            />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
          </Route>
        </Route>

        {/* ================= EMPLOYEE ================= */}
        <Route path="/employee">
          {/* LOGIN */}
          <Route element={<ProtectedRoute type="guest" />}>
            <Route path="login" element={<Login />} />
          </Route>

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
                <Route path="admin/ai" element={<AiPolicyManagement />} />

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
                <Route path="staff/check-ticket" element={<CheckTicket />} />
                <Route path="staff/movies" element={<Movie />} />
                <Route path="staff/product" element={<SellProduct />} />

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
