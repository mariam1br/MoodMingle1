// src/components/search/SearchBar.jsx
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for interests..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
};

export default SearchBar;