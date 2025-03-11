// src/context/SavedActivitiesContext.jsx
import React, { createContext, useState, useContext } from 'react';

const SavedActivitiesContext = createContext(null);

export const SavedActivitiesProvider = ({ children }) => {
  const [savedActivities, setSavedActivities] = useState([]);

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

  return (
    <SavedActivitiesContext.Provider value={{ 
      savedActivities, 
      saveActivity, 
      removeActivity,
      isActivitySaved 
    }}>
      {children}
    </SavedActivitiesContext.Provider>
  );
};

export const useSavedActivities = () => useContext(SavedActivitiesContext);