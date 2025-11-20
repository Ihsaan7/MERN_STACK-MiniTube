import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAllVideos } from "../api/services/video.services";
import Layout from "../components/layout/Layout";
import { useTheme } from "../context/ThemeContext";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const query = searchParams.get("q") || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query) {
      searchVideos();
    } else {
      setVideos([]);
      setLoading(false);
    }
  }, [query]);

  const searchVideos = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllVideos({ query, limit: 50 });
      setVideos(response.data?.videos || []);
    } catch (err) {
      setError("Failed to search videos");
      console.error(err);
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
    return views || 0;
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
      <div
        className={`min-h-screen ${
          isDark ? "bg-neutral-950" : "bg-neutral-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              {query ? `Search results for "${query}"` : "Search"}
            </h1>
            {!loading && videos.length > 0 && (
              <p
                className={`mt-2 text-sm font-medium ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Found {videos.length} {videos.length === 1 ? "video" : "videos"}
              </p>
            )}
          </div>

          {/* Loading State - Responsive Skeleton Grid */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8 animate-pulse">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className={`border overflow-hidden transition-all duration-200 ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-200 shadow-md"
                  }`}
                >
                  {/* Thumbnail skeleton */}
                  <div className="relative overflow-hidden">
                    <div className="w-full h-48 bg-neutral-700/30 dark:bg-neutral-800/60" />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded w-12 h-5" />
                  </div>
                  {/* Info skeleton */}
                  <div className="p-4">
                    <div
                      className={`h-5 w-3/4 mb-3 rounded bg-neutral-300/40 dark:bg-neutral-700/60`}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-300/40 dark:bg-neutral-700/60" />
                      <div className="h-4 w-1/3 rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-12 rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
                      <div className="h-3 w-3 rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
                      <div className="h-3 w-16 rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              className={`text-center py-16 ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
            >
              <p className="text-lg font-semibold">{error}</p>
            </div>
          )}

          {/* No Results State */}
          {!loading && !error && query && videos.length === 0 && (
            <div
              className={`text-center py-20 ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              <svg
                className={`w-20 h-20 mx-auto mb-6 ${
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                No results found
              </h2>
              <p className="mb-6">Try searching for something else</p>
            </div>
          )}

          {/* No Query State */}
          {!loading && !query && (
            <div
              className={`text-center py-20 ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              <svg
                className={`w-20 h-20 mx-auto mb-6 ${
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                Start searching
              </h2>
              <p>Enter a search term to find videos</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className={`border overflow-hidden cursor-pointer transition-all duration-300 group ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                      : "bg-white border-neutral-200 hover:border-neutral-300 shadow-md hover:shadow-xl"
                  }`}
                  style={{ willChange: "transform, box-shadow" }}
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
                      className={`font-semibold line-clamp-2 mb-3 ${
                        isDark ? "text-white" : "text-neutral-900"
                      } transition-colors duration-200`}
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
                        } transition-colors duration-200`}
                      >
                        {video.owner?.fullName || video.owner?.username}
                      </p>
                    </div>

                    {/* Stats */}
                    <div
                      className={`flex items-center gap-2 text-xs font-medium ${
                        isDark ? "text-neutral-500" : "text-neutral-500"
                      } transition-colors duration-200`}
                    >
                      <span>{formatViews(video.view)} views</span>
                      <span>•</span>
                      <span>{timeAgo(video.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchResultsPage;
