// src/components/layout/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavedActivities } from '../../context/SavedActivitiesContext';

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { savedActivities } = useSavedActivities();

  const handleAuthClick = () => {
    if (isLoggedIn) {
      logout();
      navigate('/');
    } else {
      navigate('/signin');
    }
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-right justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
          >
            MoodMingle
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              onClick={() => navigate('/')}
            >
              Discover
            </button>

            <button 
              className="px-3 py-1.5 rounded-lg text-sm flex items-center text-gray-600 hover:bg-gray-50"
              onClick={() => navigate('/saved')}
            >
              <Heart size={16} className="mr-1.5" />
              Saved
              {savedActivities.length > 0 && (
                <span className="ml-1.5 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full text-xs">
                  {savedActivities.length}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <button 
                className="px-3 py-1.5 rounded-lg text-sm flex items-center text-gray-600 hover:bg-gray-50"
                onClick={() => navigate('/account')}
              >
                <User size={16} className="mr-1.5" />
                Account
              </button>
            ) : null}

            <button 
              className="ml-2 px-4 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm flex items-center transition-colors"
              onClick={handleAuthClick}
            >
              <LogIn size={16} className="mr-1.5" />
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;