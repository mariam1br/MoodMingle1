// src/components/layout/Header.jsx
import React from 'react';
import { User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ currentTab, setCurrentTab }) => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-purple-600">MoodMingle</h1>
          <nav className="flex items-center space-x-4">
            <button 
              className={`px-4 py-2 rounded-lg ${currentTab === 'discover' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
              onClick={() => setCurrentTab('discover')}
            >
              Discover
            </button>
            {isLoggedIn && (
              <button 
                className={`px-4 py-2 rounded-lg ${currentTab === 'account' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
                onClick={() => setCurrentTab('account')}
              >
                <User size={20} className="inline mr-2" />
                Account
              </button>
            )}
            <button 
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center"
              onClick={isLoggedIn ? logout : () => setCurrentTab('login')}
            >
              <LogIn size={20} className="inline mr-2" />
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;