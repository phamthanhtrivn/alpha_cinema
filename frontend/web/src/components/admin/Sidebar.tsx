import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  User,
  Package,
  Calendar,
  Users,
  Contact,
  Star,
  Ticket,
  Tag,
  DollarSign,
  MapPin,
  LogOut,
  CalendarCog
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const Sidebar: React.FC = () => {
  const location = useLocation();
  // const { role } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    // 1. Tổng quan
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin/dashboard', roles: ['ADMIN', 'EMPLOYEE'] },

    // 2. Nội dung (Core data)
    { icon: <Film size={18} />, label: 'Quản lý Phim', path: '/admin/movies', roles: ['ADMIN', 'EMPLOYEE'] },
    { icon: <User size={18} />, label: 'Quản lý Nghệ sĩ', path: '/admin/artists', roles: ['ADMIN', 'EMPLOYEE'] },

    // 3. Hệ thống rạp & vận hành
    { icon: <MapPin size={18} />, label: 'Quản lý Rạp phim', path: '/admin/cinemas', roles: ['ADMIN'] },
    { icon: <Calendar size={18} />, label: 'Quản lý Lịch chiếu', path: '/admin/schedules', roles: ['ADMIN', 'EMPLOYEE'] },
    { icon: <DollarSign size={18} />, label: 'Quản lý Giá vé', path: '/admin/prices', roles: ['ADMIN'] },

    // 4. Kinh doanh (bán hàng)
    { icon: <Ticket size={18} />, label: 'Quản lý Đơn hàng', path: '/admin/orders', roles: ['ADMIN', 'EMPLOYEE'] },
    { icon: <CalendarCog size={18} />, label: 'Quản lý Nghỉ lễ', path: '/admin/holidays', roles: ['ADMIN', 'EMPLOYEE'] },
    { icon: <Package size={18} />, label: 'Quản lý Sản phẩm', path: '/admin/products', roles: ['ADMIN', 'EMPLOYEE'] },
    { icon: <Tag size={18} />, label: 'Quản lý Khuyến mãi', path: '/admin/promotions', roles: ['ADMIN', 'EMPLOYEE'] },

    // 5. Người dùng
    { icon: <Users size={18} />, label: 'Quản lý Khách hàng', path: '/admin/customers', roles: ['ADMIN', 'EMPLOYEE'] },
    { icon: <Contact size={18} />, label: 'Quản lý Nhân viên', path: '/admin/staff', roles: ['ADMIN'] },

    // 6. Feedback
    { icon: <Star size={18} />, label: 'Quản lý Đánh giá', path: '/admin/reviews', roles: ['ADMIN', 'EMPLOYEE'] },
  ];

  // const filteredMenu = menuItems.filter(item => item.roles.includes(role));
  const filteredMenu = menuItems;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl h-screen">
      <div className="p-6">
        <Link to="/admin" className="text-xl font-black tracking-tighter text-sky-400 flex items-center space-x-2">
          <Film className="text-white" />
          <span>ALPHA <span className="text-gray-400 font-light italic text-sm">ADMIN</span></span>
        </Link>
      </div>

      <nav className="grow px-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {filteredMenu.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 px-4 py-3 w-full text-gray-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors">
          <LogOut size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
