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
          const user = localStorage.getItem("user");
          setUser(JSON.parse(user));

          const response = await apiClient.get("/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(response.data.user);
          setIsLoggedIn(true);
          setIsLoading(false);
        } catch (error) {
          console.error("Auth Check Failed: ", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setUser(null);
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
