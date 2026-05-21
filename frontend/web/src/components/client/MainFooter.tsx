import React from 'react';
import { Link } from "react-router-dom";
import { Container } from '../common/Layout';

const MainFooter: React.FC = () => {
  return (
    <footer className="bg-[#333333] py-16 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-slate-400">
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tighter">
              <span className="text-alpha-blue italic">alpha</span>
              <span className="text-alpha-orange">CINEMA</span>
            </h3>
            <p className="text-sm leading-relaxed">Hệ thống rạp chiếu phim hiện đại hàng đầu Việt Nam.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100 mb-6 uppercase text-xs tracking-widest">Quy định & Điều khoản</h4>
            <ul className="text-sm space-y-3">
              <li><Link to="/dieu-khoan-chung" className="hover:text-alpha-blue transition-colors">Điều khoản chung</Link></li>
              <li><Link to="/chinh-sach-thanh-toan" className="hover:text-alpha-blue transition-colors">Chính sách thanh toán</Link></li>
              <li><Link to="/chinh-sach-bao-mat" className="hover:text-alpha-blue transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-100 mb-6 uppercase text-xs tracking-widest">Liên kết</h4>
            <ul className="text-sm space-y-3">
              <li><Link to="/ve-chung-toi" className="hover:text-alpha-blue transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/tuyen-dung" className="hover:text-alpha-blue transition-colors">Tuyển dụng</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-100 mb-6 uppercase text-xs tracking-widest">Chăm sóc khách hàng</h4>
            <p className="text-slate-100 font-bold text-lg mb-1">1900 2224</p>
            <p className="text-xs italic opacity-70">Hỗ trợ 24/7</p>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-700 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 alpha Cinema. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default MainFooter;
