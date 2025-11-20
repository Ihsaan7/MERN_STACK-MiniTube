import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWatchHistory } from "../api/services/authServices";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/layout/Layout";

const WatchHistoryPage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getWatchHistory();

      // Backend returns array of video objects with owner info
      setVideos(response.data || []);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      setError(err.response?.data?.message || "Failed to load watch history");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (!views && views !== 0) return "0";

    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p
              className={`text-lg font-medium ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Loading watch history...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div
            className={`border p-6 text-center ${
              isDark
                ? "bg-red-950/20 border-red-900/50 text-red-400"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <svg
              className="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-semibold">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Watch History
          </h1>
          <p
            className={`text-base ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            {videos.length > 0
              ? `${videos.length} video${videos.length !== 1 ? "s" : ""}`
              : "No videos watched yet"}
          </p>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div
            className={`border p-12 text-center ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <svg
              className={`w-24 h-24 mx-auto mb-6 ${
                isDark ? "text-neutral-700" : "text-neutral-300"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              No watch history yet
            </h3>
            <p
              className={`mb-6 ${
                isDark ? "text-neutral-500" : "text-neutral-500"
              }`}
            >
              Videos you watch will appear here
            </p>
            <button
              onClick={() => navigate("/home")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Explore Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                onClick={() => handleVideoClick(video._id)}
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isDark
                    ? "hover:shadow-xl hover:shadow-orange-500/10"
                    : "hover:shadow-xl"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden mb-3">
                  <img
                    src={
                      video.thumbnail || "https://via.placeholder.com/320x180"
                    }
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs font-semibold px-2 py-1">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex gap-3">
                  {/* Owner Avatar */}
                  <img
                    src={
                      video.owner?.avatar || "https://via.placeholder.com/40"
                    }
                    alt={video.owner?.username}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold mb-1 line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors ${
                        isDark ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {video.title}
                    </h3>
                    <p
                      className={`text-sm mb-1 ${
                        isDark ? "text-neutral-400" : "text-neutral-600"
                      }`}
                    >
                      {video.owner?.fullName}
                    </p>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-neutral-500" : "text-neutral-500"
                      }`}
                    >
                      <span>{formatViews(video.view)} views</span>
                      <span>•</span>
                      <span>{timeAgo(video.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WatchHistoryPage;
