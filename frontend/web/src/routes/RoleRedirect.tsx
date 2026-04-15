import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectRole, selectIsAuthenticated } from "@/store/slices/authSlice";

const RoleRedirect = () => {
  const role = useSelector(selectRole);
  const isAuth = useSelector(selectIsAuthenticated);

  if (!isAuth) {
    return <Navigate to="/employee/login" replace />;
  }

  if (role === "ADMIN") {
    return <Navigate to="/employee/admin/dashboard" replace />;
  }

  if (role === "MANAGER") {
    return <Navigate to="/employee/manager/dashboard" replace />;
  }

  if (role === "STAFF") {
    return <Navigate to="/employee/staff/dashboard" replace />;
  }

  if (role === "CUSTOMER") {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/employee/login" replace />;
};

export default RoleRedirect;