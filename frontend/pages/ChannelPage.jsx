import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllVideos } from "../api/services/video.services";
import { toggleSubscribe } from "../api/services/subscription.services";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ChannelPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    fetchChannelData();
  }, [username]);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      setError("");

      // For now, viewing your own profile only (username param not used yet)
      // Always use the logged-in user's full data which includes coverImage
      setChannelData(user);

      // Fetch videos by this user
      const response = await getAllVideos({ userId: user?._id, limit: 50 });
      const videosData = response.data?.videos || [];
      setVideos(videosData);
    } catch (err) {
      setError("Failed to load channel data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      await toggleSubscribe(channelData._id);
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      console.error("Subscribe error:", err);
      alert("Failed to subscribe. Please try again.");
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p
            className={`text-xl mb-4 ${
              isDark ? "text-red-400" : "text-red-600"
            }`}
          >
            {error}
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const isOwnChannel = user?._id === channelData?._id;

  return (
    <Layout>
      <div
        className={`min-h-screen ${
          isDark ? "bg-neutral-950" : "bg-neutral-50"
        }`}
      >
        {/* Channel Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-orange-500 to-red-500">
          {channelData?.coverImage && (
            <img
              src={channelData.coverImage}
              alt="Channel Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Channel Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`${
              channelData?.coverImage ? "-mt-16" : "pt-8"
            } pb-6 border-b ${
              isDark ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <img
                src={channelData?.avatar || "/default-avatar.png"}
                alt={channelData?.username}
                className={`w-32 h-32 rounded-full border-4 shadow-xl object-cover ${
                  isDark ? "border-neutral-950" : "border-white"
                }`}
              />

              {/* Info and Actions */}
              <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1
                    className={`text-3xl font-bold tracking-tight ${
                      isDark ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {channelData?.fullName || channelData?.username}
                  </h1>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    @{channelData?.username}
                  </p>
                  <div
                    className={`flex items-center gap-4 mt-2 text-sm font-semibold ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    <span>
                      {channelData?.subscribersCount || 0} subscribers
                    </span>
                    <span>•</span>
                    <span>{videos.length} videos</span>
                  </div>
                </div>

                {/* Subscribe/Edit Button */}
                {isOwnChannel ? (
                  <button
                    onClick={() => navigate("/settings")}
                    className={`px-6 py-2 border font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isDark
                        ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Edit Channel
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    className={`px-6 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isSubscribed
                        ? isDark
                          ? "bg-neutral-800 text-white border border-neutral-700"
                          : "bg-neutral-100 text-neutral-900 border border-neutral-300"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className={`flex gap-8 mt-6 border-b ${
              isDark ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-3 font-semibold transition-colors relative ${
                activeTab === "videos"
                  ? isDark
                    ? "text-white"
                    : "text-neutral-900"
                  : isDark
                  ? "text-neutral-500 hover:text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Videos
              {activeTab === "videos" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-3 font-semibold transition-colors relative ${
                activeTab === "about"
                  ? isDark
                    ? "text-white"
                    : "text-neutral-900"
                  : isDark
                  ? "text-neutral-500 hover:text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              About
              {activeTab === "about" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === "videos" && (
              <>
                {videos.length === 0 ? (
                  <div
                    className={`text-center py-16 ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
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
                    <p className="text-lg font-semibold mb-2">No videos yet</p>
                    {isOwnChannel && (
                      <button
                        onClick={() => navigate("/upload")}
                        className="mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        Upload Your First Video
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                      <div
                        key={video._id}
                        className={`border overflow-hidden cursor-pointer transition-all duration-200 group ${
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
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 font-medium">
                            {formatDuration(video.duration)}
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-4">
                          <h4
                            className={`font-semibold tracking-tight line-clamp-2 mb-2 ${
                              isDark ? "text-white" : "text-neutral-900"
                            }`}
                          >
                            {video.title}
                          </h4>

                          {/* Stats */}
                          <div
                            className={`flex items-center gap-2 text-xs font-semibold ${
                              isDark ? "text-neutral-500" : "text-neutral-500"
                            }`}
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
              </>
            )}

            {activeTab === "about" && (
              <div
                className={`max-w-3xl ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-4 ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  About
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Username</p>
                    <p>@{channelData?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Full Name</p>
                    <p>{channelData?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Email</p>
                    <p>{channelData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Stats</p>
                    <p>
                      {videos.length} videos •{" "}
                      {channelData?.subscribersCount || 0} subscribers
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChannelPage;
