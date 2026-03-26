import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '../components/customer/MainHeader';
import MainFooter from '../components/customer/MainFooter';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-alpha-dark flex flex-col">
      <MainHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <MainFooter />
    </div>
  );
};

export default MainLayout;
