// src/pages/DiscoverPage.jsx
import React, { useState } from 'react';
import SearchBar from '../components/search/SearchBar';
import InterestTags from '../components/search/InterestTags';
import ActivityGrid from '../components/activities/ActivityGrid';
import ActivityCard from '../components/activities/ActivityCard';

const DiscoverPage = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedInterests, setGeneratedInterests] = useState([]);

  const handleGenerateActivities = async (selectedInterests) => {
    setIsLoading(true);
    setGeneratedInterests(selectedInterests);
    
    // Here you would normally make an API call to your backend
    // which would then call the LLM to generate activities
    // For now we'll simulate it with a timeout
    
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, let's generate some mock activities based on the interests
      const mockActivities = selectedInterests.flatMap(interest => {
        // Generate 1-2 activities per interest
        return [
          {
            title: `${interest} Workshop`,
            category: interest,
            location: "Local Community Center",
            weather: "Indoor",
            description: `Join fellow ${interest} enthusiasts for a hands-on workshop experience.`
          },
          {
            title: `${interest} Meetup`,
            category: interest,
            location: "Downtown",
            weather: "Any",
            description: `Connect with others who share your passion for ${interest}.`
          }
        ];
      });
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error generating activities:', error);
      // You might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto"> 
        <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <SearchBar onAddInterest={(interest) => {
              // This will be passed to InterestTags
              document.dispatchEvent(new CustomEvent('addInterest', { detail: interest }));
            }} />
            <InterestTags onGenerateActivities={handleGenerateActivities} />
          </div>
        </section>
        
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        )}
        
        {generatedInterests.length > 0 && !isLoading && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activities based on your interests</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {generatedInterests.map((interest, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>
      )}
      
      {activities.length === 0 && !isLoading && (
        <ActivityGrid />
      )}
    </div>
  );
};

export default DiscoverPage;