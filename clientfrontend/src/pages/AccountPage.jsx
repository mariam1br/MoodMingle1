// src/pages/AccountPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSavedActivities } from '../context/SavedActivitiesContext';
import { User, Heart, Settings, LogOut } from 'lucide-react';
import AccountSettings from '../components/account/AccountSettings';
import ActivityCard from '../components/activities/ActivityCard';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { savedActivities } = useSavedActivities();
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect to login if not logged in
  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          <p className="text-gray-600">{user?.memberSince || 'February 2024'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Interests</h3>
          {user?.interests && user.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No interests added yet</p>
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-2">Activity Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">{savedActivities.length}</p>
            <p className="text-sm text-gray-500">Saved Activities</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Friends</p>
          </div>
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
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Discover Activities
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const InterestsSection = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Interests</h2>
      {user?.interests && user.interests.length > 0 ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {interest}
              </span>
            ))}
          </div>
          <p className="text-gray-600">
            These interests are used to generate personalized activity recommendations for you.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Update Interests
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 text-lg mb-2">No interests added yet</p>
          <p className="text-gray-400 mb-4">
            Adding interests helps us recommend activities that match your preferences.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Interests
          </button>
        </div>
      )}
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
              onClick={() => setActiveTab('interests')}
              className={`py-4 px-1 inline-flex items-center border-b-2 ${
                activeTab === 'interests'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="mr-2" size={20} />
              Interests
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
          {activeTab === 'interests' && <InterestsSection />}
          {activeTab === 'settings' && <AccountSettings />}
        </div>
        {/* Logout Section */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={handleLogout}
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