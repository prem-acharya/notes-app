import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logo from "../../assets/logo1.png";

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div class="relative h-screen">
        <img
          src={logo}
          alt="logo"
          class="absolute inset-0 mx-auto my-auto opacity-25"
        />
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
