import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'https://moodmingle-backend.onrender.com';

// Set axios default to include credentials
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, forceUpdate] = useState(); // Used to force re-renders when needed

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/current-user`, {
          withCredentials: true, // Important for session cookies
        });

        console.log('Current user response:', response.data);

        const fetchedUser = response.data.user;

        if (fetchedUser && !fetchedUser.isGuest) {
          // If there is a logged-in user, set the user and mark them as logged in
          
          // Ensure interests property exists, even if empty
          const userWithDefaultInterests = {
            ...fetchedUser,
            interests: fetchedUser.interests || []
          };
          
          setUser(userWithDefaultInterests);
          setIsLoggedIn(true);
          
          // Fetch user interests if not already included in user data
          if (!fetchedUser.interests || fetchedUser.interests.length === 0) {
            console.log('No interests in user data, fetching separately');
            
            // Add a small delay to ensure the session is established
            setTimeout(() => {
              fetchUserInterests();
            }, 500);
          } else {
            console.log('Interests already in user data:', fetchedUser.interests);
          }
        } else {
          // If the user is a guest or none exists, ensure logged out state
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user session', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchUserInterests = async () => {
    try {
      console.log('Fetching interests for user');
      
      const response = await axios.get(`${API_BASE_URL}/get-interests`, {
        withCredentials: true
      });
      
      console.log('Fetched interests response:', response.data);
      
      if (response.data.success) {
        // Update user state with interests
        setUser(prevUser => {
          const updatedUser = {
            ...prevUser,
            interests: response.data.interests || []
          };
          console.log('Updated user with interests:', updatedUser);
          return updatedUser;
        });
        
        return { success: true, interests: response.data.interests };
      } else {
        console.error('Failed to fetch interests:', response.data.error);
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Error fetching interests:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || "Failed to fetch interests" 
      };
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: credentials.emailOrUsername, // Send as username to match backend
        password: credentials.password
      }, {
        withCredentials: true, // Important for session cookies
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        // Ensure interests property exists (should be included directly in the response now)
        const userWithInterests = {
          ...response.data.user,
          interests: response.data.user.interests || []
        };
        
        console.log('User with interests from login:', userWithInterests);
        
        setUser(userWithInterests);
        setIsLoggedIn(true);
        
        // No need to fetch interests separately - they should be included in the login response
        
        return { success: true, user: userWithInterests };
      } else {
        return { success: false, error: response.data.error || "Login failed" };
      }
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.error || "An error occurred during login" 
      };
    }
  };

  const signup = async (userData) => {
    try {
      console.log('Attempting signup with:', userData);
      
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName
      }, {
        withCredentials: true,
      });

      console.log('Signup response:', response.data);
      
      if (response.data.success) {
        // Ensure interests property exists (should be empty for new users)
        const userWithInterests = {
          ...response.data.user,
          interests: response.data.user.interests || []
        };
        
        // Auto-login after successful signup
        setUser(userWithInterests);
        setIsLoggedIn(true);
        
        return { success: true, user: userWithInterests };
      } else {
        return { success: false, error: response.data.error || "Signup failed" };
      }
    } catch (error) {
      console.error('Signup failed:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.error || "An error occurred during signup" 
      };
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/logout`, {}, { 
        withCredentials: true 
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

  // Function to update user data (like when interests change)
  const updateUser = (userData) => {
    setUser(prevUser => {
      if (!prevUser) return userData;
      
      // Create updated user object
      const updatedUser = {
        ...prevUser,
        ...userData
      };
      
      console.log('Updated user in AuthContext:', updatedUser);
      
      // Force a re-render to ensure components using the user object update
      forceUpdate(Date.now());
      
      return updatedUser;
    });
  };

  // Updated to use the fetching function
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
          withCredentials: true
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
  
  // Testing function to execute SQL (used fo development mode purposes)
  const executeSql = async (query) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/execute-sql`, { query });
      return response.data;
    } catch (error) {
      console.error('Error executing SQL:', error);
      return { success: false, error: error.response?.data?.error || "SQL execution failed" };
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
        updateUser,
        isLoading,
        executeSql
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);