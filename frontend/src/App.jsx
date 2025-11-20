import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import UploadVideoPage from "../pages/UploadVideoPage";
import VideoPlayerPage from "../pages/VideoPlayerPage";
import ChannelPage from "../pages/ChannelPage";
import SearchResultsPage from "../pages/SearchResultsPage";
import SubscriptionsPage from "../pages/SubscriptionsPage";
import WatchHistoryPage from "../pages/WatchHistoryPage";
import LikedVideosPage from "../pages/LikedVideosPage";
import SettingsPage from "../pages/SettingsPage";
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

      {/* Protected Route - Video Player */}
      <Route
        path="/video/:videoId"
        element={
          <ProtectedRoute>
            <VideoPlayerPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - Channel Page */}
      <Route
        path="/channel/:username"
        element={
          <ProtectedRoute>
            <ChannelPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - My Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ChannelPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - Search Results */}
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchResultsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - Subscriptions */}
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <SubscriptionsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - Watch History */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <WatchHistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - Liked Videos */}
      <Route
        path="/liked-videos"
        element={
          <ProtectedRoute>
            <LikedVideosPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Route - Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
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
