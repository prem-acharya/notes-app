import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Components/Authentication/AuthContext';
import PrivateRoute from './Components/Authentication/PrivateRoute';
import Login from './Components/Authentication/Login';
import Signup from './Components/Authentication/SignUp';
import Dashboard from './Components/Dashboard/Dashboard';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          {/* Redirect to dashboard as the default route if logged in, else to login */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
