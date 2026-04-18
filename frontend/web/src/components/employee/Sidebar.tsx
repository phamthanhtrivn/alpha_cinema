import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  Users,
  Calendar,
  MapPin,
  Armchair,
  Tag,
  Ticket,
  ShoppingCart,
  Building2,
  UserCog,
  Star,
  Gift,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectRole, logout } from "@/store/slices/authSlice";
import { userService } from "@/services/user.service";
import { toast } from "react-toastify";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const role = useSelector(selectRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const base = `/employee/${role.toLowerCase()}`;

  const menuItems = [
    // ===== DASHBOARD =====
    {
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      path: `${base}/dashboard`,
      roles: ["ADMIN", "MANAGER", "STAFF"],
    },

    // ===== ADMIN =====
    {
      icon: <UserCog size={18} />,
      label: "Nhân viên",
      path: "/employee/admin/staff",
      roles: ["ADMIN"],
    },
    {
      icon: <Film size={18} />,
      label: "Phim",
      path: "/employee/admin/movies",
      roles: ["ADMIN"],
    },
    {
      icon: <Users size={18} />,
      label: "Nghệ sĩ",
      path: "/employee/admin/artists",
      roles: ["ADMIN"],
    },
    {
      icon: <Building2 size={18} />,
      label: "Rạp phim",
      path: "/employee/admin/cinemas",
      roles: ["ADMIN"],
    },
    {
      icon: <Users size={18} />,
      label: "Khách hàng",
      path: "/employee/admin/customers",
      roles: ["ADMIN"],
    },
    {
      icon: <Calendar size={18} />,
      label: "Ngày lễ",
      path: "/employee/admin/holidays",
      roles: ["ADMIN"],
    },
    {
      icon: <ShoppingCart size={18} />,
      label: "Đơn hàng",
      path: "/employee/admin/orders",
      roles: ["ADMIN"],
    },
    {
      icon: <DollarSign size={18} />,
      label: "Giá vé",
      path: "/employee/admin/prices",
      roles: ["ADMIN"],
    },
    {
      icon: <Tag size={18} />,
      label: "Sản phẩm",
      path: "/employee/admin/products",
      roles: ["ADMIN"],
    },
    {
      icon: <Gift size={18} />,
      label: "Khuyến mãi",
      path: "/employee/admin/promotions",
      roles: ["ADMIN"],
    },
    {
      icon: <Star size={18} />,
      label: "Đánh giá",
      path: "/employee/admin/reviews",
      roles: ["ADMIN"],
    },
    {
      icon: <MapPin size={18} />,
      label: "Phòng chiếu",
      path: "/employee/admin/rooms",
      roles: ["ADMIN"],
    },
    {
      icon: <Calendar size={18} />,
      label: "Lịch chiếu",
      path: "/employee/admin/schedules",
      roles: ["ADMIN"],
    },
    {
      icon: <Armchair size={18} />,
      label: "Ghế",
      path: "/employee/admin/seats",
      roles: ["ADMIN"],
    },
    {
      icon: <Tag size={18} />,
      label: "Loại ghế",
      path: "/employee/admin/seat-types",
      roles: ["ADMIN"],
    },

    // ===== MANAGER =====
    {
      icon: <ShoppingCart size={18} />,
      label: "Đơn hàng",
      path: "/employee/manager/orders",
      roles: ["MANAGER"],
    },
    {
      icon: <Calendar size={18} />,
      label: "Lịch chiếu",
      path: "/employee/manager/schedules",
      roles: ["MANAGER"],
    },
    {
      icon: <MapPin size={18} />,
      label: "Phòng",
      path: "/employee/manager/rooms",
      roles: ["MANAGER"],
    },
    {
      icon: <Armchair size={18} />,
      label: "Ghế",
      path: "/employee/manager/seats",
      roles: ["MANAGER"],
    },
    {
      icon: <Tag size={18} />,
      label: "Loại ghế",
      path: "/employee/manager/seat-types",
      roles: ["MANAGER"],
    },
    {
      icon: <UserCog size={18} />,
      label: "Nhân viên",
      path: "/employee/manager/staff",
      roles: ["MANAGER"],
    },

    // ===== STAFF =====
    {
      icon: <Ticket size={18} />,
      label: "Bán vé",
      path: "/employee/staff/sell",
      roles: ["STAFF"],
    },
  ];

  const filteredMenu = menuItems.filter((item) => {
    return item.roles.includes(role);
  });

  const handleLogout = () => {
    const handle = async () => {
      const data = await userService.logout();

      if (data.success) {
        toast.success("Đăng xuất thành công");
        dispatch(logout());
        navigate("/employee/login");
      }
    };
    handle();
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen shadow-xl">
      {/* LOGO */}
      <div className="p-6 border-b border-slate-800">
        <Link
          to="/employee/redirect"
          className="text-xl font-black tracking-tight text-sky-400 flex items-center gap-2"
        >
          <Film />
          <span>
            ALPHA{" "}
            <span className="text-gray-400 text-sm italic">ADMIN</span>
          </span>
        </Link>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                      ? "bg-sky-600 text-white shadow"
                      : "text-gray-400 hover:bg-slate-800 hover:text-white"
                    }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;