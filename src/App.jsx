// src/App.jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

const App = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;