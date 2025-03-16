// src/context/SavedActivitiesContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SavedActivitiesContext = createContext(null);

export const SavedActivitiesProvider = ({ children }) => {
  const [savedActivities, setSavedActivities] = useState([]);
  const { user } = useAuth();
  
  // Load saved activities when user changes
  useEffect(() => {
    if (user) {
      // If user is logged in, try to load their saved activities
      const userSavedActivities = localStorage.getItem(`savedActivities_${user.id}`);
      if (userSavedActivities) {
        setSavedActivities(JSON.parse(userSavedActivities));
      } else {
        // Reset to empty if no saved activities found for user
        setSavedActivities([]);
      }
    } else {
      // If no user (logged out), reset to empty
      setSavedActivities([]);
    }
  }, [user]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`savedActivities_${user.id}`, JSON.stringify(savedActivities));
    }
  }, [savedActivities, user]);

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
    if (user) {
      localStorage.removeItem(`savedActivities_${user.id}`);
    }
  };

  return (
    <SavedActivitiesContext.Provider value={{ 
      savedActivities, 
      saveActivity, 
      removeActivity,
      isActivitySaved,
      clearAllActivities
    }}>
      {children}
    </SavedActivitiesContext.Provider>
  );
};

export const useSavedActivities = () => useContext(SavedActivitiesContext);