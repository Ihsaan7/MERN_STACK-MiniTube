import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Usage in routes:
<Route
  path="/upload"
  element={
    <ProtectedRoute>
      <UploadPage />
    </ProtectedRoute>
  }
/>;
