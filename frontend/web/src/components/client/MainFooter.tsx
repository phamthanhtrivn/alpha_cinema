import React from 'react';
import { Container } from '../common/Layout';

const MainFooter: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-16 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tighter">
              <span className="text-alpha-blue italic">alpha</span>
              <span className="text-alpha-orange">CINEMA</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">Hệ thống rạp chiếu phim hiện đại hàng đầu Việt Nam.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Quy định & Điều khoản</h4>
            <ul className="text-slate-500 text-sm space-y-3">
              <li><a href="#" className="hover:text-alpha-blue">Điều khoản chung</a></li>
              <li><a href="#" className="hover:text-alpha-blue">Chính sách thanh toán</a></li>
              <li><a href="#" className="hover:text-alpha-blue">Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Liên kết</h4>
            <ul className="text-slate-500 text-sm space-y-3">
              <li><a href="#" className="hover:text-alpha-blue">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-alpha-blue">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-alpha-blue">Liên hệ quảng cáo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Chăm sóc khách hàng</h4>
            <p className="text-slate-800 font-bold text-lg mb-1">1900 2224</p>
            <p className="text-slate-500 text-sm italic">Hỗ trợ 24/7</p>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 alpha Cinema. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default MainFooter;
