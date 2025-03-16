// src/pages/DiscoverPage.jsx
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/search/SearchBar';
import InterestTags from '../components/search/InterestTags';
import ActivityCard from '../components/activities/ActivityCard';
import { useAuth } from '../context/AuthContext';
import axios from "axios";
  

const DiscoverPage = () => {
  const { user, updateUserInterests } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedInterests, setGeneratedInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  // Load user interests if logged in
  useEffect(() => {
    if (user && user.interests) {
      setUserInterests(user.interests);
    }
  }, [user]);

  const handleGenerateActivities = async (selectedInterests) => {
    // If no interests are selected, clear activities
    if (selectedInterests.length === 0) {
      setActivities([]);
      setGeneratedInterests([]);
      setHasGenerated(false);
      return;
    }

    setIsLoading(true);
    setGeneratedInterests(selectedInterests);

    // If logged in, save the interests to user profile
    if (user) {
      // Update both local state and context
      setUserInterests(selectedInterests);
      updateUserInterests(selectedInterests);
    }

    try {
      // Make an API call to the deployed backend
      const response = await fetch('http://127.0.0.1:5000/api/get-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: selectedInterests,
          location: "Calgary", // Replace with dynamic location if available
          weather: "Sunny" // Replace with dynamic weather if available
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Transform the response into the format expected by the frontend
      const transformedActivities = [
        ...data.recommendations.outdoor_activities,
        ...data.recommendations.indoor_activities,
        ...data.recommendations.local_events
      ].map(activity => ({
        title: activity.name,
        category: activity.genre,
        location: activity.location,
        weather: activity.weather,
        description: activity.description
      }));

      setActivities(transformedActivities);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle interest changes from InterestTags component
  const handleInterestsChange = (updatedInterests) => {
    // Only update activities if we had previously generated them
    // This prevents clearing when we haven't generated anything yet
    if (hasGenerated && updatedInterests.length === 0) {
      setActivities([]);
      setGeneratedInterests([]);
      setHasGenerated(false);
    }
  };

  // Fetch weather data based on user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await axios.post("http://127.0.0.1:5000/get_weather", {
              latitude,
              longitude,
            });

            setLocation(response.data.location);
            setWeather(response.data.weather);
          } catch (err) {
            setError("Failed to fetch weather data.");
          }
        },
        () => setError("Location access denied.")
      );
    } else {
      setError("Geolocation is not supported.");
    }
  }, []);

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
              onInterestsChange={handleInterestsChange}
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
        
        {generatedInterests.length > 0 && !isLoading && hasGenerated && (
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
      
      {activities.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>
      )}
      
      {!isLoading && !hasGenerated && (
        <div className="text-center py-12">
          <div className="text-purple-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Add your interests and discover activities</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter your interests above and click "Generate Activities" to see personalized activity recommendations.
          </p>
        </div>
      )}
    </div>
  );
};


export default DiscoverPage;