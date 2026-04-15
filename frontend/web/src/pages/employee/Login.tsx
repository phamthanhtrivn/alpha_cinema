import React from 'react';

const AdminLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-12 border border-slate-200 rounded shadow-xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tighter italic">ALPHA CINEMA <span className="text-slate-400 font-light">STAFF</span></h2>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-50 border border-slate-200 rounded"></div>
          <div className="h-10 bg-slate-50 border border-slate-200 rounded"></div>
          <button className="w-full bg-slate-900 py-3 rounded text-white font-bold hover:bg-slate-800">VÀO HỆ THỐNG</button>
        </div>
        <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Truy cập nội bộ an toàn
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
