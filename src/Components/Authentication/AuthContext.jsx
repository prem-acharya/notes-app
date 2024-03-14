import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../firebase'; // Assuming you set up Firebase authentication

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false); // Set loading to false once we get the user state
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading, // Include loading in the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
