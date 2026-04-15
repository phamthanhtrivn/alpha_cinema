import React from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu } from 'lucide-react';
import { Container } from '../common/Layout';

const MainHeader: React.FC = () => {
  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <Container>
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter">
              <span className="text-alpha-blue italic">alpha</span>
              <span className="text-alpha-orange">CINEMA</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10 text-slate-700 font-semibold uppercase text-xs tracking-wider">
            <Link to="/" className="hover:text-alpha-blue transition-colors">Trang Chủ</Link>
            <Link to="#" className="hover:text-alpha-blue transition-colors">Lịch Chiếu</Link>
            <Link to="#" className="hover:text-alpha-blue transition-colors">Phim Đang Chiếu</Link>
            <Link to="#" className="hover:text-alpha-blue transition-colors">Khuyến Mãi</Link>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-slate-400 hover:text-alpha-blue transition-colors"><Search size={22} /></button>
            <Link to="/login" className="flex items-center space-x-2 text-slate-700 font-bold hover:text-alpha-orange transition-colors group">
              <div className="p-2 border border-slate-200 rounded-full group-hover:border-alpha-orange transition-colors">
                <User size={20} />
              </div>
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
            <button className="md:hidden text-slate-700"><Menu size={24} /></button>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default MainHeader;
