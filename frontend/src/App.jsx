import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import UploadVideoPage from "../pages/UploadVideoPage";
import ProtectedRoute from "../components/ProtectedRoutes";

function App() {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Public Route - Register */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Route - Home */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - Upload Video */}
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadVideoPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
