import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '../components/client/MainHeader';
import MainFooter from '../components/client/MainFooter';
import Chatbot from '../components/client/Chatbot';
import CartDrawer from '../components/client/CartDrawer';
import NotificationWebSocketListener from '../components/client/NotificationWebSocketListener';

const MainLayout: React.FC = () => {

  return (
    <div className="min-h-screen bg-alpha-dark flex flex-col">
      <NotificationWebSocketListener />
      <MainHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Chatbot />
      <CartDrawer />
      <MainFooter />
    </div>
  );
};

export default MainLayout;
