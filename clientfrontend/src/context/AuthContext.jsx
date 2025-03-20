import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'https://moodmingle-backend.onrender.com';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Comprehensive user authentication check
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("CHECKING AUTHENTICATION STATUS");
        
        // Enhanced request with more comprehensive error handling
        const response = await axios.get(`${API_BASE_URL}/current-user`, {
          withCredentials: true,
          timeout: 10000, // 10-second timeout
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        console.log("Current user response:", response.data);

        const fetchedUser = response.data.user;

        // More stringent user validation
        const isValidUser = fetchedUser && 
                             !fetchedUser.isGuest && 
                             fetchedUser.username !== 'Guest' && 
                             fetchedUser.username;

        if (isValidUser) {
          console.log("AUTHENTICATED USER DETECTED:", fetchedUser.username);
          setUser(fetchedUser);
          setIsLoggedIn(true);
          
          // Fetch user interests after authentication
          await fetchUserInterests();
        } else {
          console.log("NO VALID USER - SETTING LOGGED OUT STATE");
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("AUTHENTICATION CHECK FAILED:", error);
        
        // Detailed error logging
        if (error.response) {
          console.error("Response Error:", error.response.data);
          console.error("Status Code:", error.response.status);
        } else if (error.request) {
          console.error("No Response Received:", error.request);
        } else {
          console.error("Error Setting Up Request:", error.message);
        }

        setUser(null);
        setIsLoggedIn(false);
      } finally {
        // Always set loading to false, ensuring UI can render
        setIsLoading(false);
      }
    };

    // Immediate authentication check
    checkAuthStatus();
  }, []);

  const fetchUserInterests = async () => {
    try {
      console.log("Fetching user interests");
      
      const response = await axios.get(`${API_BASE_URL}/get-interests`, {
        withCredentials: true,
        timeout: 10000
      });
      
      console.log("Interests fetch response:", response.data);
      
      if (response.data.success) {
        // Update user with fetched interests
        setUser(prevUser => ({
          ...prevUser,
          interests: response.data.interests || []
        }));

        return { 
          success: true, 
          interests: response.data.interests || [] 
        };
      } else {
        console.warn("Failed to fetch interests:", response.data.error);
        return { 
          success: false, 
          error: response.data.error || "Could not retrieve interests" 
        };
      }
    } catch (error) {
      console.error("Interests Fetch Error:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || "Failed to fetch interests" 
      };
    }
  };

  const login = async (credentials) => {
    try {
      console.log("Attempting login:", credentials.emailOrUsername);
      
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: credentials.emailOrUsername,
        password: credentials.password
      }, {
        withCredentials: true,
        timeout: 10000
      });

      console.log("Login response:", response.data);

      if (response.data.success) {
        const loginUser = response.data.user;
        
        setUser(loginUser);
        setIsLoggedIn(true);
        
        // Fetch interests post-login
        await fetchUserInterests();
        
        return { 
          success: true, 
          user: loginUser 
        };
      } else {
        console.warn("Login failed:", response.data.error);
        return { 
          success: false, 
          error: response.data.error || "Login unsuccessful" 
        };
      }
    } catch (error) {
      console.error("Login Error:", error);
      
      // Detailed error handling
      const errorMessage = error.response?.data?.error || 
                           error.message || 
                           "An unexpected error occurred during login";
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const signup = async (userData) => {
    try {
      console.log("Attempting signup with:", userData);
      
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName
      }, {
        withCredentials: true,
        timeout: 10000
      });

      console.log("Signup response:", response.data);
      
      if (response.data.success) {
        const signupUser = response.data.user;
        
        setUser(signupUser);
        setIsLoggedIn(true);
        
        // Fetch interests post-signup
        await fetchUserInterests();
        
        return { 
          success: true, 
          user: signupUser 
        };
      } else {
        console.warn("Signup failed:", response.data.error);
        return { 
          success: false, 
          error: response.data.error || "Signup unsuccessful" 
        };
      }
    } catch (error) {
      console.error("Signup Error:", error);
      
      const errorMessage = error.response?.data?.error || 
                           error.message || 
                           "An unexpected error occurred during signup";
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/logout`, {}, { 
        withCredentials: true,
        timeout: 10000
      });
      
      console.log('Logout response:', response.data);
      
      setUser(null);
      setIsLoggedIn(false);
      // Reset state or perform a page refresh
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUserInterests = async () => {
    if (isLoggedIn) {
      return await fetchUserInterests();
    }
    return { success: false, error: "User not logged in" };
  };
    
  const updateUserProfile = async (profileData) => {
    if (user) {
      try {
        console.log('Updating profile with data:', profileData);
        console.log('Current user state before update:', user);
        
        const response = await axios.put(`${API_BASE_URL}/update-profile`, {
          username: user.username,
          ...profileData
        }, {
          withCredentials: true,
          timeout: 10000
        });
        
        console.log('Update profile response:', response.data);
        
        if (response.data.success) {
          // Update the user state with the new profile data
          setUser((prevUser) => {
            const updated = { ...prevUser, ...profileData };
            console.log('Updated user state:', updated);
            return updated;
          });
          return { success: true };
        }
        return { success: false, error: response.data.error };
      } catch (error) {
        console.error('Error updating profile', error);
        console.error('Error response:', error.response?.data);
        return { success: false, error: "Failed to update profile" };
      }
    }
    return { success: false, error: "User not logged in" };
  };
  
  const executeSql = async (query) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/execute-sql`, { query }, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error executing SQL:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || "SQL execution failed" 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        signup,
        logout,
        updateUserInterests,
        updateUserProfile,
        isLoading,
        executeSql,
        fetchUserInterests
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};