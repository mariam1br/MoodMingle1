// src/pages/DiscoverPage.jsx
import React from 'react';
import SearchBar from '../components/search/SearchBar';
import InterestTags from '../components/search/InterestTags';
import ActivityGrid from '../components/activities/ActivityGrid';

const DiscoverPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto"> 
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <SearchBar />
            <InterestTags />
          </div>
        </section>
      </div>
      <ActivityGrid />
    </div>
  );
};

export default DiscoverPage;