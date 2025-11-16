import { createContext, useState, useContext, useEffect } from "react";
import {
  getUserFromStorage,
  isAuthenticated,
  getCurrentUser,
} from "../api/services/authServices";

// ==================== 1. CREATE CONTEXT ====================
// Purpose: Create a "container" to hold auth data
const AuthContext = createContext(null);

// ==================== 2. AUTH PROVIDER ====================
// Purpose: Wraps your app and provides auth data to all components
export const AuthProvider = ({ children }) => {
  // State to store user data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state while checking auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first (fast)
        if (isAuthenticated()) {
          const storedUser = getUserFromStorage();
          setUser(storedUser);
          setIsLoggedIn(true);

          // Verify with backend (optional, but good practice)
          try {
            const response = await getCurrentUser();
            setUser(response.data.user); // Update with fresh data
          } catch (error) {
            // Token might be invalid, logout
            console.error("Auth verification failed");
            handleLogout();
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false); // Done checking
      }
    };

    checkAuth();
  }, []); // Run once on mount

  // Function to set user after login/register
  const handleLogin = (userData) => {
    setUser(userData.user);
    setIsLoggedIn(true);
  };

  // Function to clear user on logout
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  // Function to update user data
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  // Value object - this is what all components can access
  const value = {
    user, // Current user object
    isLoggedIn, // Boolean - is user logged in?
    loading, // Boolean - is auth check in progress?
    handleLogin, // Function - call after successful login
    handleLogout, // Function - call to logout
    updateUser, // Function - update user data (e.g., after profile update)
  };

  // Don't render children until auth check is complete
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // Provide the auth data to all children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==================== 3. useAuth HOOK ====================
// Purpose: Easy way to access auth data in any component
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Make sure this hook is used inside AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export default AuthContext;
