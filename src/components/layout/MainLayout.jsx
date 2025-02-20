// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import Header from './Header';
import DiscoverPage from '../../pages/DiscoverPage';
import AccountPage from '../../pages/AccountPage';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const [currentTab, setCurrentTab] = useState('discover');
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === 'discover' ? (
          <DiscoverPage />
        ) : currentTab === 'account' && isLoggedIn ? (
          <AccountPage />
        ) : null}
      </main>
    </div>
  );
};

export default MainLayout;