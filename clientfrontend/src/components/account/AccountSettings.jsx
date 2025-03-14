// src/components/account/AccountSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AccountSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
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
      setFormData({
        email: user.email || '',
        displayName: user.displayName || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: '', type: '' });
    
    // In a real app, this would be validated more thoroughly
    if (!formData.displayName.trim()) {
      setStatus({
        message: 'Display name is required',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }
    
    // Update user profile
    const result = updateUserProfile({
      displayName: formData.displayName,
      location: formData.location
    });
    
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
    
    setIsLoading(false);
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setStatus({ message: '', type: '' });
    }, 3000);
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
              Email cannot be changed for demo accounts
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <p className="text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
              Demo Account (Limited functionality)
            </p>
          </div>
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