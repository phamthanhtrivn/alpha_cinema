import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const AdminHeader: React.FC = () => {
  const { role } = useSelector((state: RootState) => state.auth);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-96">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm..." 
          className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-gray-500 hover:text-sky-600">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 leading-tight">Phạm Thành Trí</p>
            <p className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</p>
          </div>
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold border-2 border-sky-400">
            PTT
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
