import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Menu, LogOut, UserCircle, History } from "lucide-react";
import { Container } from "../common/Layout";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth } from "@/store/slices/authSlice";
import { userService } from "@/services/user.service";
import {toast} from "react-toastify";

const MainHeader: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const handleLogout = () => {
    const handle = async () => {
      const data = await userService.logout();
      
      if (data.success) {
        toast.success("Đăng xuất thành công");
        dispatch(logout());
        navigate("/");
      }
    };
    handle();
  };

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <Container>
        <div className="flex justify-between items-center h-20">
          {/* 1. LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter">
              <span className="text-alpha-blue italic">alpha</span>
              <span className="text-alpha-orange">CINEMA</span>
            </Link>
          </div>

          {/* 2. MENU LINKS (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-10 text-slate-700 font-semibold uppercase text-xs tracking-wider">
            <Link to="/" className="hover:text-alpha-blue transition-colors">
              Trang Chủ
            </Link>
            <Link to="#" className="hover:text-alpha-blue transition-colors">
              Lịch Chiếu
            </Link>
            <Link to="#" className="hover:text-alpha-blue transition-colors">
              Phim Đang Chiếu
            </Link>
            <Link to="#" className="hover:text-alpha-blue transition-colors">
              Khuyến Mãi
            </Link>
          </div>

          {/* 3. USER ACTIONS & SEARCH */}
          <div className="flex items-center space-x-6">
            <button className="text-slate-400 hover:text-alpha-blue transition-colors">
              <Search size={22} />
            </button>

            {user ? (
              /* --- KHI ĐÃ ĐĂNG NHẬP --- */
              <div className="relative group flex items-center space-x-3 cursor-pointer py-2">
                {/* Avatar & Info */}
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <User size={24} className="text-slate-400" />
                </div>

                <div className="hidden md:block">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-sm leading-tight">
                      {user?.fullName || "Khách hàng"}
                    </span>
                  </div>
                </div>

                {/* DROPDOWN MENU */}
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <Link
                    to="/account"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <UserCircle size={18} className="text-slate-700" />
                    <span className="text-sm font-bold text-slate-700">
                      Tài Khoản
                    </span>
                  </Link>

                  <Link
                    to="/history"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-50"
                  >
                    <History size={18} className="text-slate-700" />
                    <span className="text-sm font-bold text-slate-700">
                      Lịch Sử
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors border-t border-slate-50 text-red-500"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-bold">Đăng Xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              /* --- KHI CHƯA ĐĂNG NHẬP --- */
              <Link
                to="/login"
                className="flex items-center space-x-2 text-slate-700 font-bold hover:text-alpha-orange transition-colors group"
              >
                <div className="p-2 border border-slate-200 rounded-full group-hover:border-alpha-orange transition-colors">
                  <User size={20} />
                </div>
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Menu Icon */}
            <button className="md:hidden text-slate-700">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default MainHeader;
