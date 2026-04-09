import React from 'react';
import { Link } from 'react-router-dom';

const CustomerLogin: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white py-20">
      <div className="max-w-md w-full border border-slate-100 bg-white p-12 rounded-3xl shadow-2xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-alpha-blue italic uppercase tracking-tighter mb-2">Đăng Nhập</h2>
          <div className="h-1 w-12 bg-alpha-orange mx-auto"></div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-12 border-2 border-slate-100 rounded-xl bg-slate-50 focus-within:border-alpha-blue transition-colors"></div>
            <div className="h-12 border-2 border-slate-100 rounded-xl bg-slate-50 focus-within:border-alpha-blue transition-colors"></div>
          </div>

          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
            <label className="flex items-center space-x-2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
              <span>Ghi nhớ</span>
            </label>
            <a href="#" className="text-alpha-blue hover:text-alpha-orange">Quên mật khẩu?</a>
          </div>

          <button className="w-full bg-alpha-blue py-4 rounded-xl font-black text-white hover:bg-slate-900 transition-all transform active:scale-95 shadow-lg shadow-blue-50">
            BẮT ĐẦU TRẢI NGHIỆM
          </button>
        </div>

        <div className="mt-12 text-center text-sm font-bold text-slate-400">
          Chưa có tài khoản? <Link to="#" className="text-alpha-orange hover:underline decoration-2 underline-offset-4">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
