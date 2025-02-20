// src/App.jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { SavedActivitiesProvider } from './context/SavedActivitiesContext';
import MainLayout from './components/layout/MainLayout';

const App = () => {
  return (
    <AuthProvider>
      <SavedActivitiesProvider>
        <MainLayout />
      </SavedActivitiesProvider>
    </AuthProvider>
  );
};

export default App;