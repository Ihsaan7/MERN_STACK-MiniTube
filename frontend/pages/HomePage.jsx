import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getAllVideos } from "../api/services/video.services";

const HomePage = () => {
  const { user } = useAuth();
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
      console.log("Full Response:", response);
      console.log("Response.data:", response.data);
      console.log("Videos array:", response.data?.videos);

      // The axios interceptor returns response.data, which contains { videos, page, limit, totalPages, totalVideos }
      setVideos(response.data?.videos || response.videos || []);
    } catch (err) {
      setError("Failed to load videos");
      console.error("Error fetching videos:", err);
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
      <div className="container mx-auto px-4 py-8">
        {/* User Welcome Section */}
        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-4">
              <img
                src={user?.avatar || "https://via.placeholder.com/80"}
                alt={user?.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {user?.fullName}!
                </h2>
                <p className="text-gray-600">@{user?.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Feed Section */}
        <div>
          <h3 className="text-2xl font-bold mb-6">All Videos</h3>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">📹 No videos yet!</p>
              <p className="text-gray-400 mb-6">
                Be the first to upload a video
              </p>
              <button
                onClick={() => navigate("/upload")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Upload Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/video/${video._id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2">
                      {video.title}
                    </h4>

                    {/* Channel Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={
                          video.owner?.avatar ||
                          "https://via.placeholder.com/32"
                        }
                        alt={video.owner?.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <p className="text-sm text-gray-600">
                        {video.owner?.fullName || video.owner?.username}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
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
      </div>
    </Layout>
  );
};

export default HomePage;
