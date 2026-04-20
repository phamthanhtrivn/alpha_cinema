import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const AdminHeader: React.FC = () => {
  const { role, user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-2 py-2 shadow-sm">
      <div className="flex items-center space-x-3 pl-6">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {user?.fullName}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {role.toLowerCase()}
          </p>
        </div>
        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold border-2 border-sky-400">
          PTT
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
