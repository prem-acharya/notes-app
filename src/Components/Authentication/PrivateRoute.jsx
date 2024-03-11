// PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Make sure this hook correctly fetches auth status

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Assuming useAuth returns an object with currentUser

  return currentUser ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
