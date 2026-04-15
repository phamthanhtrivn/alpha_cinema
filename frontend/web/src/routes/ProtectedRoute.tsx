import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectRole,
} from "@/store/slices/authSlice";
import type { UserRole } from "@/types/user";

interface Props {
  type: "public" | "client" | "employee";
  allowedRoles?: UserRole[];
}

const EMPLOYEE_ROLES: UserRole[] = ["ADMIN", "MANAGER", "STAFF"];

const ProtectedRoute = ({ type, allowedRoles }: Props) => {
  const isAuth = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const location = useLocation();

  // =========================
  // PUBLIC ROUTE
  // =========================
  if (type === "public") {
    if (isAuth && EMPLOYEE_ROLES.includes(role)) {
      return <Navigate to="/employee/redirect" replace />;
    }
    return <Outlet />;
  }

  // =========================
  // NOT AUTH
  // =========================
  if (!isAuth) {
    if (type === "employee") {
      return (
        <Navigate
          to="/employee/login"
          state={{ from: location }}
          replace
        />
      );
    }

    if (type === "client") {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
  }

  // =========================
  // CLIENT
  // =========================
  if (type === "client") {
    if (EMPLOYEE_ROLES.includes(role)) {
      return <Navigate to="/employee/redirect" replace />;
    }

    if (role !== "CUSTOMER") {
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }

    return <Outlet />;
  }

  // =========================
  // EMPLOYEE
  // =========================
  if (type === "employee") {
    if (role === "CUSTOMER") {
      return <Navigate to="/" replace />;
    }

    if (!EMPLOYEE_ROLES.includes(role)) {
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/employee/redirect" replace />;
    }

    return <Outlet />;
  }

  return <Outlet />;
};

export default ProtectedRoute;