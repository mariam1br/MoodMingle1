// src/components/search/InterestTags.jsx
import React, { useState, useEffect, useCallback } from 'react';

const InterestTags = ({ onGenerateActivities, onInterestsChange, initialInterests = [] }) => {
  const [interests, setInterests] = useState([]);
  const [previousInterests, setPreviousInterests] = useState([]);

  // Set initial interests when they change (e.g., user logs in)
  useEffect(() => {
    if (initialInterests && initialInterests.length > 0) {
      setInterests(initialInterests);
    }
  }, [initialInterests]);

  // Notify parent component when interests change - with a local state update
  // that doesn't block navigation
  useEffect(() => {
    if (onInterestsChange) {
      // Use setTimeout to avoid blocking the UI thread
      setTimeout(() => {
        onInterestsChange(interests);
      }, 0);
    }
  }, [interests, onInterestsChange]);

  // Define addInterest using useCallback before using it in useEffect
  const addInterest = useCallback((interest) => {
    if (!interests.includes(interest)) {
      setInterests(prev => [...prev, interest]);
    }
  }, [interests]);

  // Store interests in localStorage to persist between sessions
  useEffect(() => {
    const savedInterests = localStorage.getItem('previousInterests');
    if (savedInterests) {
      try {
        setPreviousInterests(JSON.parse(savedInterests));
      } catch (e) {
        console.error("Error parsing saved interests", e);
        setPreviousInterests([]);
      }
    }
  }, []);
  
  // Set up event listener for adding interests
  useEffect(() => {
    // Listen for the custom event to add an interest from SearchBar
    const handleAddInterestEvent = (event) => {
      addInterest(event.detail);
    };
    
    document.addEventListener('addInterest', handleAddInterestEvent);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('addInterest', handleAddInterestEvent);
    };
  }, [addInterest]);

  // Save previousInterests to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('previousInterests', JSON.stringify(previousInterests));
    } catch (e) {
      console.error("Error saving previous interests", e);
    }
  }, [previousInterests]);

  const suggestedInterests = [
    'Horror', 'Outdoors', 'Arts & Crafts', 
    'Events', 'Sports', 'Reading', 'Gaming'
  ];

  const removeInterest = (interest) => {
    setInterests(prev => prev.filter(i => i !== interest));
  };

  const removePreviousInterest = (interest) => {
    setPreviousInterests(prev => prev.filter(i => i !== interest));
  };

  const handleGenerateActivities = () => {
    // Call the onGenerateActivities prop with the current interests
    // without any additional logic that could block navigation
    onGenerateActivities(interests);
  };

  return (
    <div className="space-y-4">
      {/* Selected Interest Tags */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Current Interests</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {interests.length > 0 ? (
            interests.map((interest, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="ml-2 text-purple-400 hover:text-purple-600"
                  aria-label={`Remove ${interest}`}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No interests selected. Add some above or from suggestions below.</p>
          )}
        </div>
      </div>

      {/* Generate Activities Button */}
      <button
        onClick={handleGenerateActivities}
        className={`w-full py-2 px-4 rounded-lg transition-colors ${
          interests.length > 0
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        Generate Activities
      </button>

      {/* Previously Selected Interests */}
      {previousInterests.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Previous Interests</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {previousInterests.map((interest, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {interest}
                <button
                  onClick={() => removePreviousInterest(interest)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  aria-label={`Remove ${interest} from history`}
                >
                  ×
                </button>
                <button
                  onClick={() => addInterest(interest)}
                  className="ml-1 text-purple-400 hover:text-purple-600"
                  disabled={interests.includes(interest)}
                  aria-label={`Add ${interest} to current interests`}
                >
                  +
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Interests */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Suggested Interests</h3>
        <div className="flex flex-wrap gap-2">
          {suggestedInterests.map((interest, index) => (
            <button
              key={index}
              onClick={() => addInterest(interest)}
              className={`px-3 py-1 rounded-full text-sm ${
                interests.includes(interest)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              disabled={interests.includes(interest)}
              aria-label={`Add ${interest} to interests`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterestTags;