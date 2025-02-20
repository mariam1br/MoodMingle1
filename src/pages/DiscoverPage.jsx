// src/pages/DiscoverPage.jsx
import React from 'react';
import SearchBar from '../components/search/SearchBar';
import InterestTags from '../components/search/InterestTags';
import ActivityGrid from '../components/activities/ActivityGrid';

const DiscoverPage = () => {
  return (
    <>
      <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col space-y-4">
          <SearchBar />
          <InterestTags />
        </div>
      </section>
      <ActivityGrid />
    </>
  );
};

export default DiscoverPage;