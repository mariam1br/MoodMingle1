import React, { useState, useEffect } from 'react';
import SearchBar from '../components/search/SearchBar';
import InterestTags from '../components/search/InterestTags';
import ActivityCard from '../components/activities/ActivityCard';
import { useAuth } from '../context/AuthContext';
import axios from "axios";
  
const API_BASE_URL = "https://moodmingle-backend.onrender.com"; 

// Set axios default to include credentials
axios.defaults.withCredentials = true;

const DiscoverPage = () => {
  const { user, updateUserInterests } = useAuth();
  console.log('DiscoverPage - Current user:', user);
  
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedInterests, setGeneratedInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState({ condition: null, temperature: null });
  const [errorMessage, setErrorMessage] = useState("");

  // Load user interests if logged in
  useEffect(() => {
    const loadUserInterests = async () => {
      if (user) {
        console.log('User is logged in, checking interests');
        
        if (user.interests && user.interests.length > 0) {
          console.log('Setting user interests from user object:', user.interests);
          const uniqueInterests = [...new Set(user.interests)];
          setUserInterests(uniqueInterests);
        } else {
          console.log('No interests found in user object, trying to fetch them');
          // Try to update interests from backend
          try {
            const result = await updateUserInterests();
            if (result.success && result.interests && result.interests.length > 0) {
              console.log('Fetched interests from API:', result.interests);
              setUserInterests(result.interests);
            } else {
              console.log('No interests found from API');
            }
          } catch (error) {
            console.error('Error fetching user interests:', error);
          }
        }
      } else {
        console.log('No user logged in');
      }
    };
    
    loadUserInterests();
  }, [user, updateUserInterests]);

  const handleGenerateActivities = async (selectedInterests) => {
    setErrorMessage("");
    const uniqueInterests = [...new Set(selectedInterests)];
    console.log('Generating activities with interests:', uniqueInterests);
    
    if (uniqueInterests.length === 0) {
      setErrorMessage("Please select at least one interest");
      return;
    }
    
    setGeneratedInterests(uniqueInterests);
    setUserInterests(uniqueInterests);
    setHasGenerated(false);
    setIsLoading(true);
  
    try {
      if (user) {
        console.log('Saving interests to database for user:', user.username);
        const response = await axios.post(
          `${API_BASE_URL}/save-interests`,
          { interests: uniqueInterests },
          { withCredentials: true }
        );
  
        if (!response.data.success) {
          console.error("Failed to save interests:", response.data.error);
          // Don't clear user interests on error - just log it
        }
      }
  
      // Fetch activity recommendations
      console.log('Fetching activity recommendations with:', { 
        interests: uniqueInterests, 
        location, 
        weather: weather?.condition,
        temperature: weather?.temperature,
      });
      
      const response = await fetch(`${API_BASE_URL}/get-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important for maintaining session
        body: JSON.stringify({
          interests: uniqueInterests,
          location: location || "Unknown",
          weather: weather?.condition || "Any",
          temperature: weather?.temperature || 20,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate recommendations");
      }
  
      const data = await response.json();
      console.log('Received recommendations:', data);

      // Check if there's an error in the response
      if (data.error) {
        throw new Error(data.error);
      }

      // Defensive coding to handle unexpected data structures
      const transformedActivities = [];
      
      // Safely add outdoor activities if they exist
      if (data.recommendations && 
          data.recommendations.outdoor_activities && 
          Array.isArray(data.recommendations.outdoor_activities)) {
        transformedActivities.push(...data.recommendations.outdoor_activities);
      }
      
      // Safely add indoor activities if they exist
      if (data.recommendations && 
          data.recommendations.indoor_activities && 
          Array.isArray(data.recommendations.indoor_activities)) {
        transformedActivities.push(...data.recommendations.indoor_activities);
      }
      
      // Safely add local events if they exist
      if (data.recommendations && 
          data.recommendations.local_events && 
          Array.isArray(data.recommendations.local_events)) {
        transformedActivities.push(...data.recommendations.local_events);
      }
      
      // Check if we received any activities
      if (transformedActivities.length === 0) {
        throw new Error("No activities were found for your interests. Please try again with different interests.");
      }
      
      // Map the combined activities with fallback values
      const mappedActivities = transformedActivities.map((activity) => ({
        title: activity.name || "Unknown Activity",
        category: activity.genre || "Other",
        location: activity.location || "Unknown",
        weather: activity.weather || "Any",
        description: activity.description || "No description available",
      }));
      
      console.log('Transformed activities:', mappedActivities);
      setActivities(mappedActivities);
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating activities:", error);
      setErrorMessage(error.message || "Failed to generate activities. Please try again with different interests.");
      
      // Clear activities on error rather than using fallbacks
      setActivities([]);
      setHasGenerated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Update location when the user types in the SearchBar
  const handleLocationChange = (newLocation) => {
    console.log('User updated location:', newLocation);
    setLocation(newLocation);
  };

  const handleInterestsChange = (updatedInterests) => {
    console.log('Interests changed:', updatedInterests);
    if (hasGenerated && updatedInterests.length === 0) {
      console.log('Clearing activities due to empty interests');
      setActivities([]);
      setGeneratedInterests([]);
      setHasGenerated(false);
    }
  };

  const handleAddInterest = (interest) => {
    const normalizedInterest = interest.trim().toLowerCase();
    console.log('Adding interest:', interest, 'normalized:', normalizedInterest);
    
    const isDuplicate = userInterests.some(
      existingInterest => existingInterest.toLowerCase() === normalizedInterest
    );
    
    if (!isDuplicate && normalizedInterest) {
      console.log('Adding new interest to list:', interest.trim());
      document.dispatchEvent(new CustomEvent('addInterest', { detail: interest.trim() }));
    } else if (isDuplicate) {
      console.log('Interest already exists in list:', interest);
      setErrorMessage("This interest is already in your list.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Got user coordinates:', latitude, longitude);

          try {
            const response = await axios.post(`${API_BASE_URL}/get_weather`, {
              latitude,
              longitude,
            });

            console.log('Weather data received:', response.data);
            setLocation(response.data.location);
            setWeather({
              condition: response.data.weather.condition,
              temperature: response.data.weather.temperature,
            });
          } catch (err) {
            console.error("Weather fetch error:", err);
            setErrorMessage("Failed to fetch weather data.");
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setErrorMessage("Location access denied.");
        }
      );
    }
  }, []);
  
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto"> 
        <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <SearchBar onAddInterest={handleAddInterest} 
              location={location}
              onLocationChange={handleLocationChange}/>
            <InterestTags 
              onGenerateActivities={handleGenerateActivities}
              onInterestsChange={handleInterestsChange}
              initialInterests={userInterests}
            />
          </div>
        </section>
        
        {user && (
          <div className="bg-purple-50 rounded-xl p-4 mb-8 text-sm sm:text-base text-center">
            {console.log('Rendering welcome message with user:', user)}
            <p className="text-purple-600">
              Welcome back, <strong>{user.name || user.username}</strong>! 
              {user.interests && user.interests.length > 0 && (
                <span> We've loaded your saved interests.</span>
              )}
            </p>
          </div>
        )}
        
        {/* Display error message if any */}
        {errorMessage && (
          <div className="bg-red-50 rounded-xl p-4 mb-8 text-sm sm:text-base">
            <p className="text-red-600">{errorMessage}</p>
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