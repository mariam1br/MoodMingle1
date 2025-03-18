// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavedActivities } from '../../context/SavedActivitiesContext';

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { savedActivities } = useSavedActivities();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add debugging to see user object
  console.log('Header - Current user:', user);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      logout();
    } else {
      navigate('/signin');
      setIsMobileMenuOpen(false);
    }
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Safely get display name
  const getDisplayName = () => {
    if (!user) return 'Account';
    
    // Try name first, then username as fallback
    if (user.name) return user.name;
    if (user.displayName) return user.displayName;
    if (user.username) return user.username;
    return 'Account';
  };

  // Safely get first name for compact display
  const getFirstName = () => {
    const fullName = getDisplayName();
    // Only try to split if it's likely a full name (contains space)
    if (fullName && fullName.includes(' ')) {
      return fullName.split(' ')[0];
    }
    return fullName;
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigateTo('/')}
            className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
          >
            MoodMingle
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button 
              className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              onClick={() => navigateTo('/')}
            >
              Discover
            </button>

            <button 
              className="px-3 py-1.5 rounded-lg text-sm flex items-center text-gray-600 hover:bg-gray-50"
              onClick={() => navigateTo('/saved')}
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
                onClick={() => navigateTo('/account')}
              >
                <User size={16} className="mr-1.5" />
                {getFirstName()}
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 mt-3 space-y-3">
            <button 
              className="w-full px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 flex items-center"
              onClick={() => navigateTo('/')}
            >
              Discover
            </button>

            <button 
              className="w-full px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 flex items-center"
              onClick={() => navigateTo('/saved')}
            >
              <Heart size={16} className="mr-2" />
              Saved
              {savedActivities.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full text-xs">
                  {savedActivities.length}
                </span>
              )}
            </button>

            {isLoggedIn && (
              <button 
                className="w-full px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-50 flex items-center"
                onClick={() => navigateTo('/account')}
              >
                <User size={16} className="mr-2" />
                {getDisplayName()}
              </button>
            )}

            <button 
              className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center"
              onClick={handleAuthClick}
            >
              <LogIn size={16} className="mr-2" />
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;