import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/employee/Sidebar';
import AdminHeader from '../components/employee/AdminHeader';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
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
