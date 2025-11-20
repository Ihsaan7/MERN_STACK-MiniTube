import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAllVideos,
  deleteVideo,
  updateVideoContent,
  togglePublishStatus,
} from "../api/services/video.services";
import { toggleSubscribe } from "../api/services/subscription.services";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/ui/Toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";

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
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Video management states
  const [editingVideo, setEditingVideo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });

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
      setToast({
        message: "Failed to subscribe. Please try again.",
        type: "error",
      });
    }
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
    setEditThumbnailPreview(video.thumbnail);
    setEditThumbnail(null);
    setShowEditModal(true);
    setActionMessage({ type: "", text: "" });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditThumbnail(file);
      setEditThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle || !editDescription) {
      setActionMessage({ type: "error", text: "Please fill all fields" });
      return;
    }

    try {
      setActionLoading(true);
      await updateVideoContent(editingVideo._id, {
        title: editTitle,
        description: editDescription,
        thumbnail: editThumbnail,
      });

      setActionMessage({ type: "success", text: "Video updated successfully" });
      setTimeout(() => {
        setShowEditModal(false);
        fetchChannelData(); // Refresh videos
      }, 1500);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update video",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVideo = (videoId) => {
    setConfirmDialog({
      message: "Are you sure you want to delete this video?",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await deleteVideo(videoId);
          setToast({ message: "Video deleted successfully", type: "success" });
          fetchChannelData(); // Refresh videos
        } catch (err) {
          setToast({
            message: err.response?.data?.message || "Failed to delete video",
            type: "error",
          });
        } finally {
          setActionLoading(false);
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleTogglePublish = async (video) => {
    try {
      setActionLoading(true);
      await togglePublishStatus(video._id);
      setActionMessage({
        type: "success",
        text: `Video ${
          video.isPublished ? "unpublished" : "published"
        } successfully`,
      });
      fetchChannelData(); // Refresh videos
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to toggle publish status",
      });
    } finally {
      setActionLoading(false);
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
    // Responsive skeleton loader for channel page
    return (
      <Layout>
        <div
          className={`min-h-screen ${
            isDark ? "bg-neutral-950" : "bg-neutral-50"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Banner skeleton */}
            <div className="relative h-48 md:h-64 mb-8 animate-pulse">
              <div className="w-full h-full rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
            </div>
            {/* Channel info skeleton */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8 animate-pulse">
              <div className="w-32 h-32 rounded-full bg-neutral-300/40 dark:bg-neutral-700/60" />
              <div className="flex-1 flex flex-col gap-4">
                <div className="h-8 w-1/3 rounded bg-neutral-300/40 dark:bg-neutral-700/60 mb-2" />
                <div className="h-5 w-1/4 rounded bg-neutral-300/40 dark:bg-neutral-700/60 mb-2" />
                <div className="h-5 w-1/2 rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
              </div>
              <div className="h-10 w-32 rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
            </div>
            {/* Videos grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr animate-pulse">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className={`border overflow-hidden transition-all duration-200 ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-200 shadow-md"
                  }`}
                >
                  <div className="relative overflow-hidden">
                    <div className="w-full h-48 bg-neutral-700/30 dark:bg-neutral-800/60" />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded w-12 h-5" />
                  </div>
                  <div className="p-4">
                    <div className="h-5 w-3/4 mb-3 rounded bg-neutral-300/40 dark:bg-neutral-700/60" />
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
          </div>
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
              channelData?.coverImage ? "" : "pt-16"
            } pb-8 border-b ${
              isDark ? "border-neutral-800" : "border-neutral-200"
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <img
                src={channelData?.avatar || "/default-avatar.png"}
                alt={channelData?.username}
                className={`w-32 h-32 rounded-full border-4 shadow-xl object-cover relative z-10 ${
                  channelData?.coverImage ? "-mt-20" : ""
                } ${isDark ? "border-neutral-950" : "border-white"}`}
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
                        className={`border overflow-hidden transition-all duration-200 group relative ${
                          isDark
                            ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                            : "bg-white border-neutral-200 hover:border-neutral-300 shadow-md hover:shadow-xl"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/video/${video._id}`)}
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 font-medium">
                            {formatDuration(video.duration)}
                          </div>
                          {!video.isPublished && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 font-bold">
                              UNPUBLISHED
                            </div>
                          )}
                        </div>

                        {/* Video Info */}
                        <div className="p-4">
                          <h4
                            className={`font-semibold tracking-tight line-clamp-2 mb-2 cursor-pointer ${
                              isDark ? "text-white" : "text-neutral-900"
                            }`}
                            onClick={() => navigate(`/video/${video._id}`)}
                          >
                            {video.title}
                          </h4>

                          {/* Stats */}
                          <div
                            className={`flex items-center gap-2 text-xs font-semibold mb-3 ${
                              isDark ? "text-neutral-500" : "text-neutral-500"
                            }`}
                          >
                            <span>{formatViews(video.view)} views</span>
                            <span>•</span>
                            <span>{timeAgo(video.createdAt)}</span>
                          </div>

                          {/* Action Buttons (Own Channel Only) */}
                          {isOwnChannel && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditVideo(video);
                                }}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 px-3 font-semibold transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePublish(video);
                                }}
                                className={`flex-1 text-xs py-2 px-3 font-semibold transition-colors ${
                                  video.isPublished
                                    ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                }`}
                              >
                                {video.isPublished ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVideo(video._id);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 font-semibold transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
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

      {/* Edit Video Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-neutral-900" : "bg-white"
            }`}
          >
            <div className="p-6">
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                Edit Video
              </h2>

              {/* Message */}
              {actionMessage.text && (
                <div
                  className={`p-3 mb-4 border ${
                    actionMessage.type === "success"
                      ? isDark
                        ? "bg-green-950/20 border-green-900/50 text-green-400"
                        : "bg-green-50 border-green-200 text-green-700"
                      : isDark
                      ? "bg-red-950/20 border-red-900/50 text-red-400"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {actionMessage.text}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Thumbnail */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Thumbnail
                  </label>
                  <img
                    src={editThumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover border-2 border-orange-500 mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className={`w-full px-3 py-2 border text-sm ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? "text-neutral-500" : "text-neutral-500"
                    }`}
                  >
                    Leave empty to keep current thumbnail
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-4 py-2 border ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 border resize-none ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-600 text-white py-3 font-semibold transition-all duration-200"
                  >
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setActionMessage({ type: "", text: "" });
                    }}
                    disabled={actionLoading}
                    className={`flex-1 border py-3 font-semibold transition-colors ${
                      isDark
                        ? "border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onCancel}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </Layout>
  );
};

export default ChannelPage;
