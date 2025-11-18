import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/axios.config.js";
import {
  getCurrentUser,
  getUserFromStorage,
  isAuthenticated,
} from "../api/services/authServices.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr && userStr !== "undefined" && userStr !== "null") {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            setIsLoggedIn(true);
          }

          // Always fetch fresh user data from server
          const response = await apiClient.get("/users/profile");

          if (response && response.user) {
            setUser(response.user);
            setIsLoggedIn(true);
            localStorage.setItem("user", JSON.stringify(response.user));
          }
        } catch (error) {
          console.error("Auth Check Failed: ", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setUser(null);
          setIsLoggedIn(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user || userData);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  const value = {
    user,
    loading: isLoading,
    isLoggedIn,
    handleLogin,
    handleLogout,
    updateUser,
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
