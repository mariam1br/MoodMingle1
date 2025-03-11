// src/components/search/InterestTags.jsx
import React, { useState } from 'react';

const InterestTags = () => {
  const [interests, setInterests] = useState([]);

  const suggestedInterests = [
    'Horror Movies', 'Outdoor Adventures', 'Art & Crafts', 
    'Local Events', 'Sports', 'Reading', 'Gaming'
  ];

  const addInterest = (interest) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div>
      {/* Selected Interest Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {interests.map((interest, index) => (
          <span
            key={index}
            className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm flex items-center"
          >
            {interest}
            <button
              onClick={() => removeInterest(interest)}
              className="ml-2 text-purple-400 hover:text-purple-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Suggested Interests */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Suggested Interests</h3>
        <div className="flex flex-wrap gap-2">
          {suggestedInterests.map((interest, index) => (
            <button
              key={index}
              onClick={() => addInterest(interest)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm"
              disabled={interests.includes(interest)}
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