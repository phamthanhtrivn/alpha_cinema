import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/employee/AdminHeader';
import Sidebar from '@/components/employee/Sidebar';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';

const AdminLayout: React.FC = () => {
  const { role } = useSelector(selectAuth);

  useEffect(() => {
    if (role === 'ADMIN' || role === 'MANAGER') {
      document.title = 'Quản lý hệ thống rạp phim | Alpha Cinema';
    } else if (role === 'STAFF') {
      document.title = 'Hệ thống bán vé & Dịch vụ | Alpha Cinema';
    } else {
      document.title = 'Hệ thống Alpha Cinema';
    }
  }, [role]);

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
