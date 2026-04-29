import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '../components/client/MainHeader';
import MainFooter from '../components/client/MainFooter';
import { selectAuth } from '@/store/slices/authSlice';
import { useSelector } from 'react-redux';

const MainLayout: React.FC = () => {
  const auth = useSelector(selectAuth);

  console.log(auth);
  
  

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
