// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

// Dummy users for testing
const dummyUsers = [
  {
    id: "user1",
    email: "user@example.com",
    password: "password123",
    displayName: "Test User",
    location: "New York, USA",
    interests: ["Outdoor Adventures", "Sports"],
    memberSince: "February 2024"
  },
  {
    id: "mariam",
    email: "mariam@example.com",
    password: "password12",
    displayName: "Mariam Ibrahim",
    location: "Calgary, CA",
    interests: ["Horror Movies", "Reading"],
    memberSince: "March 2024"
  }
];

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check for saved user session on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('moodmingle_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (credentials) => {
    // Find user by email
    const foundUser = dummyUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (foundUser) {
      // Create a copy without the password for security
      const { password, ...safeUserData } = foundUser;
      
      // Store in state
      setUser(safeUserData);
      setIsLoggedIn(true);
      
      // Save to localStorage for session persistence
      localStorage.setItem('moodmingle_user', JSON.stringify(safeUserData));
      
      return { success: true, user: safeUserData };
    } else {
      return { success: false, error: "Invalid email or password" };
    }
  };

  const logout = () => {
    // Reset user state
    setIsLoggedIn(false);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('moodmingle_user');
    localStorage.removeItem('previousInterests');
    
    // Reset any other stored user data
    localStorage.removeItem('savedActivities');
    
    // Also clear any user-specific saved activities
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('savedActivities_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Force a page refresh to ensure all components reset
    window.location.href = '/';
  };

  const updateUserInterests = (interests) => {
    if (user) {
      const updatedUser = {
        ...user,
        interests: interests
      };
      
      setUser(updatedUser);
      localStorage.setItem('moodmingle_user', JSON.stringify(updatedUser));
      
      // In a real app, you would also make an API call to update the database
      console.log('Updating user interests in database:', interests);
    }
  };

  const updateUserProfile = (profileData) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...profileData
      };
      
      setUser(updatedUser);
      localStorage.setItem('moodmingle_user', JSON.stringify(updatedUser));
      
      // In a real app, you would also make an API call to update the database
      console.log('Updating user profile in database:', profileData);
      
      return { success: true };
    }
    return { success: false, error: "User not logged in" };
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        user, 
        login, 
        logout,
        updateUserInterests,
        updateUserProfile,
        dummyUsers // Exported for testing purposes
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);