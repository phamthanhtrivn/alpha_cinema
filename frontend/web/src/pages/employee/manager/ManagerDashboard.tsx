import React from 'react';

const ManagerDashBoard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
        <div className="text-sm text-gray-500">Hôm nay: 25/03/2026</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 border border-gray-200 bg-white rounded-lg p-4 shadow-sm flex flex-col justify-center">
            <span className="text-gray-400 text-xs uppercase font-bold tracking-widest">Stats {i}</span>
            <span className="text-xl font-bold text-gray-900 mt-1">N/A</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 border border-gray-200 bg-white rounded-lg p-6 shadow-sm flex items-center justify-center italic text-gray-400">
          Biểu đồ doanh thu
        </div>
        <div className="h-64 border border-gray-200 bg-white rounded-lg p-6 shadow-sm flex items-center justify-center italic text-gray-400">
          Danh sách giao dịch mới
        </div>
      </div>
    </div>
  );
};

export default ManagerDashBoard;
