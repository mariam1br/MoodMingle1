// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import Header from './Header';
import DiscoverPage from '../../pages/DiscoverPage';
import AccountPage from '../../pages/AccountPage';
import { useAuth } from '../../context/AuthContext';
import { useSavedActivities } from '../../context/SavedActivitiesContext';
import ActivityCard from '../activities/ActivityCard';

const MainLayout = () => {
  const [currentTab, setCurrentTab] = useState('discover');
  const { isLoggedIn } = useAuth();
  const { savedActivities } = useSavedActivities();

  const SavedActivitiesView = () => (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Saved Activities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedActivities.length > 0 ? (
          savedActivities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-xl shadow-sm text-center">
            <Heart size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No saved activities yet</p>
            <p className="text-gray-400">
              Activities you save will appear here. Click the heart icon on any activity to save it for later.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="pt-16"> {/* Added padding-top to account for fixed header */}
        {currentTab === 'discover' && <DiscoverPage />}
        {currentTab === 'saved' && <SavedActivitiesView />}
        {currentTab === 'account' && isLoggedIn && <AccountPage />}
      </main>
    </div>
  );
};

export default MainLayout;