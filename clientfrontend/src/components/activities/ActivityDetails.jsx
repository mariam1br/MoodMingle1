// src/components/activities/ActivityDetails.jsx
import React, { useEffect } from 'react';
import { X, MapPin, Sun, Share2, Heart } from 'lucide-react';
import { useSavedActivities } from '../../context/SavedActivitiesContext';

const ActivityDetails = ({ activity, onClose }) => {
  const { saveActivity, removeActivity, isActivitySaved } = useSavedActivities();
  const isSaved = isActivitySaved(activity.title);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSaveToggle = () => {
    if (isSaved) {
      removeActivity(activity.title);
    } else {
      saveActivity(activity);
    }
  };

  const handleShare = () => {
    // Create share text with activity details
    const shareText = `Check out this activity: ${activity.title}\nCategory: ${activity.category}\nLocation: ${activity.location}\nWeather: ${activity.weather}\nDescription: ${activity.description}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText)
      .then(() => {
        alert('Activity details copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy text to clipboard.');
      });
  };

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={handleModalClick}
      >
        <div className="relative">
          {/* Header */}
          <div className="bg-purple-600 p-4 sm:p-6 rounded-t-xl text-white sticky top-0 z-10">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 p-1 rounded-full hover:bg-white/10"
              aria-label="Close details"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-1 pr-8">{activity.title}</h2>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Details with labels */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Category:</p>
                <p className="text-gray-700">{activity.category}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Location:</p>
                <div className="flex items-center text-gray-700">
                  <MapPin size={18} className="mr-2 text-purple-500 flex-shrink-0" />
                  {activity.location}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Weather:</p>
                <div className="flex items-center text-gray-700">
                  <Sun size={18} className="mr-2 text-purple-500 flex-shrink-0" />
                  {activity.weather}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Description:</p>
                <p className="text-gray-700">{activity.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button 
                onClick={handleShare}
                className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Share2 size={18} className="mr-2" />
                Share
              </button>
              <button 
                onClick={handleSaveToggle}
                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center ${
                  isSaved 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'bg-purple-50 text-purple-600 border border-purple-200'
                }`}
              >
                <Heart 
                  size={18} 
                  className="mr-2"
                  fill={isSaved ? "currentColor" : "none"}
                />
                {isSaved ? 'Remove from Saved' : 'Save Activity'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;