// src/components/search/SearchBar.jsx
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const SearchBar = ({ onAddInterest }) => {
  const [location, setLocation] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      onAddInterest(interestInput.trim());
      setInterestInput('');
      e.preventDefault();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (interestInput.trim()) {
      onAddInterest(interestInput.trim());
      setInterestInput('');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your interests..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </form>
      </div>
      <div className="relative sm:w-auto w-full">
        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
};

export default SearchBar;