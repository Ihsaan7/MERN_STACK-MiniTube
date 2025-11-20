import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Sidebar from "../components/layout/Sidebar";
import { getAllVideos } from "../api/services/video.services";

const HomePage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await getAllVideos({ page: 1, limit: 20 });
      setVideos(response.data.videos || []);
      setError("");
    } catch (error) {
      setError("Failed to load videos");
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
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

  return (
    <Layout>
      <div className="flex">
        {/* Reusable Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

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
                Home
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

            {error && (
              <div
                className={`mb-6 p-4 border-l-4 border-red-500 animate-[slideIn_0.3s_ease-out] ${
                  isDark ? "bg-red-950/50" : "bg-red-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDark ? "text-red-400" : "text-red-700"
                  }`}
                >
                  {error}
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr py-12">
                {[...Array(8)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`border overflow-hidden animate-pulse transition-all duration-200 ${
                      isDark
                        ? "bg-neutral-900 border-neutral-800"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <div className="relative w-full h-48 bg-neutral-800 dark:bg-neutral-700" />
                    <div className="p-4">
                      <div className="h-5 w-3/4 bg-neutral-700 dark:bg-neutral-600 rounded mb-3" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-700 dark:bg-neutral-600" />
                        <div className="h-4 w-1/2 bg-neutral-700 dark:bg-neutral-600 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-12 bg-neutral-700 dark:bg-neutral-600 rounded" />
                        <div className="h-3 w-6 bg-neutral-700 dark:bg-neutral-600 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div
                className={`border p-12 text-center transition-all duration-300 ${
                  isDark
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200 shadow-lg"
                }`}
              >
                <svg
                  className={`w-16 h-16 mx-auto mb-4 ${
                    isDark ? "text-neutral-700" : "text-neutral-300"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p
                  className={`text-lg mb-2 ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  No videos yet!
                </p>
                <p
                  className={`mb-6 ${
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Be the first to upload a video
                </p>
                <button
                  onClick={() => navigate("/upload")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Upload Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    className={`border overflow-hidden transition-all duration-200 cursor-pointer group ${
                      isDark
                        ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                        : "bg-white border-neutral-200 hover:border-neutral-300 shadow-md hover:shadow-xl"
                    }`}
                    onClick={() => navigate(`/video/${video._id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 font-medium rounded">
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
                          className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
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
                        className={`flex flex-wrap items-center gap-2 text-xs font-medium ${
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

export default HomePage;
