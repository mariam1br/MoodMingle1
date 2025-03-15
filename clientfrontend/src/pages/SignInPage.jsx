// src/pages/SignInPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignInPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const { login, signup, users } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    username: '',
    location: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    setError('');
  };

  const validateSignUp = () => {
    // Check required fields
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    // Check password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Check username format (alphanumeric with underscores)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    if (isSignIn) {
      // Sign In logic
      const loginData = {
        // Support login with either email or username
        email: formData.emailOrUsername,
        username: formData.emailOrUsername,
        password: formData.password
      };
      
      const result = login(loginData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } else {
      // Sign Up logic
      if (validateSignUp()) {
        const result = signup({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          location: formData.location
        });
        
        if (result.success) {
          setSuccess('Account created successfully! Redirecting...');
          // Allow the success message to display briefly before redirecting
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError(result.error || 'Failed to create account');
        }
      }
    }
    
    setIsLoading(false);
  };

  const handleGuestAccess = () => {
    navigate('/');
  };

  // Helper to display available test accounts
  const showTestAccounts = () => {
    if (isSignIn && !error) {
      return (
        <div className="mt-2 text-sm text-gray-500">
          <p>Test accounts:</p>
          <ul className="list-disc pl-5">
            {users.slice(0, 2).map(user => (
              <li key={user.id}>
                Username: <strong>{user.username}</strong> or Email: <strong>{user.email}</strong> 
                <br />Password: <strong>{user.password}</strong>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  // Toggle between sign in and sign up modes
  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setError('');
    setSuccess('');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Toggle between Sign In and Sign Up */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`pb-4 px-4 text-sm font-medium ${
                isSignIn 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => toggleMode()}
            >
              Sign In
            </button>
            <button
              className={`pb-4 px-4 text-sm font-medium ${
                !isSignIn 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => toggleMode()}
            >
              Sign Up
            </button>
          </div>
          
          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-start">
              <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Letters, numbers, and underscores only</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="emailOrUsername"
                      value={formData.emailOrUsername}
                      onChange={handleChange}
                      placeholder="Enter email or username"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                {/* Test account information */}
                {showTestAccounts()}
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : isSignIn ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          {/* Guest Access */}
          <button
            onClick={handleGuestAccess}
            className="w-full border border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;