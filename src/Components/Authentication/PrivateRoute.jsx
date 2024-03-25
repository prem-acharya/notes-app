import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logo from "../../assets/logo1.png";
import LoadingBar from 'react-top-loading-bar'; // Import LoadingBar

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  return (
    <>
      <LoadingBar color="#0066ff" progress={loading ? 30 : 100} height={4} />
      {loading ? (
        <div className="relative h-screen">
          <img
            src={logo}
            alt="logo"
            className="absolute inset-0 mx-auto my-auto opacity-25" // Corrected class to className
          />
        </div>
      ) : currentUser ? (
        children
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
};

export default PrivateRoute;