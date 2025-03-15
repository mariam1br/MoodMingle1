// src/pages/DiscoverPage.jsx
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/search/SearchBar';
import InterestTags from '../components/search/InterestTags';
import ActivityGrid from '../components/activities/ActivityGrid';
import ActivityCard from '../components/activities/ActivityCard';
import { useAuth } from '../context/AuthContext';

const DiscoverPage = () => {
  const { user, updateUserInterests } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedInterests, setGeneratedInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);

  // Load user interests if logged in
  useEffect(() => {
    if (user && user.interests) {
      setUserInterests(user.interests);
    }
  }, [user]);

  const handleGenerateActivities = async (selectedInterests) => {
    setIsLoading(true);
    setGeneratedInterests(selectedInterests);
    
    // If logged in, save the interests to user profile
    if (user) {
      // Update both local state and context
      setUserInterests(selectedInterests);
      updateUserInterests(selectedInterests);
    }
    
    try {
      // In a real application, you would make an API call here
      // For now, we'll simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock activities based on selected interests
      const mockActivities = selectedInterests.flatMap(interest => {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto"> 
        <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <SearchBar onAddInterest={(interest) => {
              document.dispatchEvent(new CustomEvent('addInterest', { detail: interest }));
            }} />
            <InterestTags 
              onGenerateActivities={handleGenerateActivities} 
              initialInterests={userInterests}
            />
          </div>
        </section>
        
        {user && (
          <div className="bg-purple-50 rounded-xl p-4 mb-8 text-sm sm:text-base">
            <p className="text-purple-600">
              Welcome back, <strong>{user.displayName}</strong>! 
              {userInterests.length > 0 
                ? ` Your saved interests: ${userInterests.join(', ')}`
                : ' Start adding interests to get personalized activity suggestions.'}
            </p>
          </div>
        )}
        
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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