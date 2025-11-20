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
      <div className="flex">
        {/* Left Sidebar - Same as HomePage */}
        <aside
          className={`w-64 h-screen border-r sticky top-0 hidden lg:block overflow-y-auto ${
            isDark
              ? "bg-neutral-950 border-neutral-800"
              : "bg-white border-neutral-200"
          }`}
        >
          <nav className="p-4 space-y-1">
            {/* Home */}
            <button
              onClick={() => navigate("/home")}
              className={`w-full flex items-center gap-4 px-4 py-3 font-medium transition-colors ${
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Home</span>
            </button>

            {/* Subscriptions */}
            <button
              onClick={() => navigate("/subscriptions")}
              className={`w-full flex items-center gap-4 px-4 py-3 font-medium transition-colors ${
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Subscriptions</span>
            </button>

            <div
              className={`my-4 border-t ${
                isDark ? "border-neutral-800" : "border-neutral-200"
              }`}
            />

            {/* Library */}
            <button
              onClick={() => navigate("/library")}
              className={`w-full flex items-center gap-4 px-4 py-3 font-medium transition-colors ${
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Library</span>
            </button>

            {/* History - Active */}
            <button
              onClick={() => navigate("/history")}
              className={`w-full flex items-center gap-4 px-4 py-3 font-medium transition-colors ${
                isDark
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-900"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Watch History</span>
            </button>

            {/* Liked Videos */}
            <button
              onClick={() => navigate("/liked-videos")}
              className={`w-full flex items-center gap-4 px-4 py-3 font-medium transition-colors ${
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span>Liked Videos</span>
            </button>

            <div
              className={`my-4 border-t ${
                isDark ? "border-neutral-800" : "border-neutral-200"
              }`}
            />

            {/* Your Channel */}
            <button
              onClick={() => navigate("/profile")}
              className={`w-full flex items-center gap-4 px-4 py-3 font-medium transition-colors ${
                isDark
                  ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Your Channel</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-[1800px] mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h3
                  className={`text-3xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Watch History
                </h3>
                <div
                  className={`px-4 py-2 border font-semibold ${
                    isDark
                      ? "border-neutral-700 text-neutral-300"
                      : "border-neutral-300 text-neutral-700"
                  }`}
                >
                  {videos.length} {videos.length === 1 ? "video" : "videos"}
                </div>
              </div>

              {/* Videos Grid */}
              {videos.length === 0 ? (
                <div
                  className={`border p-12 text-center ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-200"
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
                    className={`mb-6 font-semibold ${
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
                  {videos.map((video) => (
                    <div
                      key={video._id}
                      onClick={() => handleVideoClick(video._id)}
                      className={`border overflow-hidden transition-all duration-200 cursor-pointer group ${
                        isDark
                          ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                          : "bg-white border-neutral-200 hover:border-neutral-300 shadow-md hover:shadow-xl"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            video.thumbnail ||
                            "https://via.placeholder.com/320x180"
                          }
                          alt={video.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 font-medium">
                          {formatDuration(video.duration)}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h4
                          className={`font-semibold tracking-tight line-clamp-2 mb-3 ${
                            isDark ? "text-white" : "text-neutral-900"
                          }`}
                        >
                          {video.title}
                        </h4>

                        {/* Channel Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={
                              video.owner?.avatar ||
                              "https://via.placeholder.com/32"
                            }
                            alt={video.owner?.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <p
                            className={`text-sm font-medium ${
                              isDark ? "text-neutral-400" : "text-neutral-600"
                            }`}
                          >
                            {video.owner?.fullName || video.owner?.username}
                          </p>
                        </div>

                        {/* Stats */}
                        <div
                          className={`flex items-center gap-2 text-xs font-medium ${
                            isDark ? "text-neutral-500" : "text-neutral-500"
                          }`}
                        >
                          <span>{formatViews(video.view || 0)} views</span>
                          <span>•</span>
                          <span>{timeAgo(video.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default WatchHistoryPage;
