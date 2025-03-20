import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from "axios";
import { useAuth } from './AuthContext';

const SavedActivitiesContext = createContext(null);

const API_BASE_URL = "https://moodmingle-backend.onrender.com";

export const SavedActivitiesProvider = ({ children }) => {
  const [savedActivities, setSavedActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = useAuth();
  
  // Load saved activities when user changes
  useEffect(() => {
    const fetchSavedActivities = async () => {
      try {
        if (!user || user.isGuest) {
          console.log('No user or guest user - clearing saved activities');
          setSavedActivities([]);
          return;
        }
        
        setIsLoading(true);
        console.log('Fetching saved activities for user:', user.username);
        
        const response = await axios.get(`${API_BASE_URL}/saved-activities`, {
          withCredentials: true, // Important for session cookies
        });

        console.log("Saved activities response:", response.data);

        if (response.data.success) {
          if (Array.isArray(response.data.activities)) {
            setSavedActivities(response.data.activities);
          } else {
            console.error("Activities is not an array:", response.data.activities);
            setSavedActivities([]);
          }
        } else {
          console.error("Failed to fetch saved activities:", response.data.error);
          setSavedActivities([]);
        }
      } catch (error) {
        console.error("Error fetching saved activities:", error);
        setSavedActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if the user is logged in
    if (isLoggedIn && user) {
      fetchSavedActivities();
    } else {
      // Try to load from localStorage for guest users
      try {
        const storedActivities = localStorage.getItem('guestSavedActivities');
        if (storedActivities) {
          setSavedActivities(JSON.parse(storedActivities));
        }
      } catch (err) {
        console.error("Error loading saved activities from localStorage:", err);
      }
    }
  }, [user, isLoggedIn]);

  // Save activities to localStorage for guest users
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('guestSavedActivities', JSON.stringify(savedActivities));
    }
  }, [savedActivities, isLoggedIn]);

  const saveActivity = (activity) => {
    setSavedActivities(prev => {
      // Check if activity already exists
      const exists = prev.some(saved => saved.title === activity.title);
      if (!exists) {
        return [...prev, activity];
      }
      return prev;
    });
  };

  const removeActivity = (activityTitle) => {
    setSavedActivities(prev => 
      prev.filter(activity => activity.title !== activityTitle)
    );
  };

  const isActivitySaved = (activityTitle) => {
    return savedActivities.some(activity => activity.title === activityTitle);
  };

  const clearAllActivities = () => {
    setSavedActivities([]);
    localStorage.removeItem('guestSavedActivities');
  };

  return (
    <SavedActivitiesContext.Provider value={{ 
      savedActivities, 
      saveActivity, 
      removeActivity,
      isActivitySaved,
      clearAllActivities,
      isLoading
    }}>
      {children}
    </SavedActivitiesContext.Provider>
  );
};

export const useSavedActivities = () => useContext(SavedActivitiesContext);