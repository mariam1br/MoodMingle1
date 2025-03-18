// src/components/account/AccountSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AccountSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    location: ''
  });
  
  const [status, setStatus] = useState({
    message: '',
    type: '' // 'success' or 'error'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Set form data when user changes
  useEffect(() => {
    if (user) {
      console.log('AccountSettings - Setting form data from user:', user);
      setFormData({
        email: user.email || '',
        name: user.name || '',
        username: user.username || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to: ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: '', type: '' });
    
    console.log('Submitting form with data:', formData);
    
    // Validate fields
    if (!formData.name.trim()) {
      setStatus({
        message: 'Name is required',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setStatus({
        message: 'Username is required',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }
    
    // Update user profile
    try {
      console.log('Calling updateUserProfile with:', {
        name: formData.name,
        username: formData.username,
        location: formData.location
      });
      
      const result = await updateUserProfile({
        name: formData.name,
        username: formData.username,
        location: formData.location
      });
      
      console.log('Update profile result:', result);
      
      if (result.success) {
        setStatus({
          message: 'Profile updated successfully',
          type: 'success'
        });
      } else {
        setStatus({
          message: result.error || 'Failed to update profile',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setStatus({
        message: 'An error occurred while updating profile',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setStatus({ message: '', type: '' });
      }, 3000);
    }
  };

  return (
    <section>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
        
        {/* Status message */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={true}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="your@email.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              disabled={true}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your Name"
            />
            <p className="mt-1 text-xs text-gray-500">
              This name will be displayed throughout the app
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              disabled={true}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your_username"
            />
            <p className="mt-1 text-xs text-gray-500">
              Username cannot be changed
            </p>
            {/* <p className="mt-1 text-xs text-gray-500">
              Choose a unique username (letters, numbers, and underscores only)
            </p> */}
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              disabled={true}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="City, Country"
            />
          </div> */}
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AccountSettings;