// src/pages/AccountPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSavedActivities } from '../context/SavedActivitiesContext';
import { User, Heart, Settings, LogOut } from 'lucide-react';
import AccountSettings from '../components/account/AccountSettings';
import ActivityCard from '../components/activities/ActivityCard';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const { savedActivities } = useSavedActivities();
  const [activeTab, setActiveTab] = useState('profile');

  const ProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-purple-100 p-4 rounded-full">
          <User size={40} className="text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.displayName || 'User Name'}</h2>
          <p className="text-gray-500">{user?.email || 'email@example.com'}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Location</h3>
          <p className="text-gray-600">{user?.location || 'Not set'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Member Since</h3>
          <p className="text-gray-600">February 2024</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Interests</h3>
          <p className="text-gray-600">{savedActivities.length} Saved Activities</p>
        </div>
      </div>
    </div>
  );

  const SavedActivitiesSection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Saved Activities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedActivities.length > 0 ? (
          savedActivities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Account Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Account">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 inline-flex items-center border-b-2 ${
                activeTab === 'profile'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="mr-2" size={20} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 px-1 inline-flex items-center border-b-2 ${
                activeTab === 'saved'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="mr-2" size={20} />
              Saved Activities {savedActivities.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                  {savedActivities.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 inline-flex items-center border-b-2 ${
                activeTab === 'settings'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="mr-2" size={20} />
              Settings
            </button>
          </nav>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'saved' && <SavedActivitiesSection />}
          {activeTab === 'settings' && <AccountSettings />}
        </div>

        {/* Logout Section */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={logout}
            className="flex items-center text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;