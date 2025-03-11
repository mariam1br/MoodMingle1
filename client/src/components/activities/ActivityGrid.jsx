// src/components/activities/ActivityGrid.jsx
import React from 'react';
import ActivityCard from './ActivityCard';

const ActivityGrid = () => {
  // Mock data - this would typically come from an API
  const mockActivities = [
    {
      title: "Weekend Horror Movie Marathon",
      category: "Entertainment",
      location: "At Home",
      weather: "Any",
      description: "Curated selection of latest horror releases and classics"
    },
    {
      title: "Local Escape Room Challenge",
      category: "Adventure",
      location: "Downtown",
      weather: "Indoor",
      description: "60-minute horror-themed escape experience"
    },
    {
      title: "Nature Photography Walk",
      category: "Outdoor",
      location: "City Park",
      weather: "Sunny",
      description: "Guided nature walk with photography tips"
    }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockActivities.map((activity, index) => (
        <ActivityCard key={index} activity={activity} />
      ))}
    </section>
  );
};

export default ActivityGrid;