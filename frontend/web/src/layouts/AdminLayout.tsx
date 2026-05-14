import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/employee/AdminHeader';
import Sidebar from '@/components/employee/Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-grow flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-grow overflow-auto p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
