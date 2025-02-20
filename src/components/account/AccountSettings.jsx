// src/components/account/AccountSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AccountSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    displayName: user?.displayName || '',
    location: user?.location || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your@email.com"
            />
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
          <button 
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </section>
  );
};

export default AccountSettings;