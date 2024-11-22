import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getVideo,
  incrementVideoView,
  getAllVideos,
} from "../api/services/video.services";
import { likeVideo, likeComment } from "../api/services/like.services";
import { toggleSubscribe } from "../api/services/subscription.services";
import {
  addComment,
  getAllComments,
  updateComment,
  deleteComment,
} from "../api/services/comment.services";
import {
  getUserPlaylists,
  addVideoToPlaylist,
} from "../api/services/playlist.services";
import Layout from "../components/layout/Layout";
import { timeAgo } from "../utils/timeAgo";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/ui/Toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";

const VideoPlayerPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchVideo();
    fetchComments();
    setHasIncrementedView(false); // Reset on video change
    // Fetch subscription state
    if (user && videoId) {
      fetchSubscriptionState();
    }
  }, [videoId, user]);

  const fetchSubscriptionState = async () => {
    try {
      // video.owner?._id is not available until video is loaded, so fetch after video
      const videoData = await getVideo(videoId);
      const ownerId =
        videoData.data?.video?.owner?._id || videoData.data?.owner?._id;
      if (!ownerId || user?._id === ownerId) {
        setIsSubscribed(false);
        return;
      }
      // Get all channels the user is subscribed to
      const subRes = await import("../api/services/subscription.services");
      const response = await subRes.getMySubscriptions();
      // response.data.docs is an array of channels
      const docs = response.data?.docs || [];
      const isSubbed = docs.some((item) => item.channel?._id === ownerId);
      setIsSubscribed(isSubbed);
    } catch (err) {
      setIsSubscribed(false);
    }
  };
  // Fetch related videos after video is loaded for better sorting
  useEffect(() => {
    if (video) {
      fetchRelatedVideos();
    }
  }, [video?._id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVideo(videoId);

      const videoData = response.data?.video || response.data;
      setVideo(videoData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await getAllComments(videoId);

      // Backend returns paginated data: { docs, totalDocs, limit, page, etc }
      const commentsData = response.data?.docs || response.data?.comments || [];

      // Ensure it's always an array
      if (Array.isArray(commentsData)) {
        setComments(commentsData);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
      setComments([]); // Set empty array on error
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      setRelatedLoading(true);
      const response = await getAllVideos({ page: 1, limit: 20 });
      const allVideos = response.data.videos || [];

      // Filter out current video and sort by relevance
      let filtered = allVideos.filter((v) => v._id !== videoId);

      // If current video is loaded, prioritize same channel videos
      if (video) {
        filtered.sort((a, b) => {
          // Same owner gets priority
          const aIsSameOwner = a.owner?._id === video.owner?._id ? 1 : 0;
          const bIsSameOwner = b.owner?._id === video.owner?._id ? 1 : 0;
          if (aIsSameOwner !== bIsSameOwner) return bIsSameOwner - aIsSameOwner;

          // Then by views
          return (b.view || 0) - (a.view || 0);
        });
      }

      setRelatedVideos(filtered.slice(0, 10));
    } catch (err) {
      console.error("Failed to load related videos:", err);
      setRelatedVideos([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      await toggleSubscribe(video.owner._id);
      const newSubscribedState = !isSubscribed;
      setIsSubscribed(newSubscribedState);

      // Show confetti animation when subscribing
      if (newSubscribedState) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Update subscriber count
      setVideo({
        ...video,
        owner: {
          ...video.owner,
          subscribersCount: isSubscribed
            ? (video.owner.subscribersCount || 1) - 1
            : (video.owner.subscribersCount || 0) + 1,
        },
      });
    } catch (err) {
      console.error("Subscribe error:", err);
      setToast({
        message: "Failed to subscribe. Please try again.",
        type: "error",
      });
    }
  };

  const handleLike = async () => {
    try {
      await likeVideo(videoId);
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);

      // Update like count
      setVideo({
        ...video,
        likesCount: newLikedState
          ? (video.likesCount || 0) + 1
          : (video.likesCount || 1) - 1,
      });
    } catch (err) {
      console.error("Like error:", err);
      setToast({
        message: "Failed to like video. Please try again.",
        type: "error",
      });
    }
  };

  const handleDislike = async () => {
    try {
      // Note: Backend doesn't have separate dislike - using like toggle
      if (!isDisliked) {
        await likeVideo(videoId);
      }
      setIsDisliked(!isDisliked);
    } catch (err) {
      console.error("Dislike error:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await addComment(videoId, comment);

      // Add the new comment to the list
      const newComment = response.data?.comment || {
        _id: Date.now(),
        content: comment,
        owner: {
          username: user.username,
          avatar: user.avatar,
          fullName: user.fullName,
        },
        createdAt: new Date().toISOString(),
      };

      setComments([newComment, ...comments]);
      setComment("");
    } catch (err) {
      console.error("Comment error:", err);
      setToast({
        message: "Failed to add comment. Please try again.",
        type: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Just now";

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
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

  const timeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Just now";
    const seconds = Math.floor((new Date() - date) / 1000);
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

  const handleVideoPlay = async () => {
    if (!hasIncrementedView) {
      try {
        await incrementVideoView(videoId);
        setHasIncrementedView(true);
        // Update local view count
        setVideo((prev) => ({
          ...prev,
          view: (prev.view || 0) + 1,
        }));
      } catch (err) {
        console.error("Failed to increment view:", err);
      }
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentText.trim()) return;

    try {
      await updateComment(commentId, editingCommentText);

      // Update comment in local state
      setComments(
        comments.map((c) =>
          c._id === commentId ? { ...c, content: editingCommentText } : c
        )
      );

      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (err) {
      console.error("Failed to update comment:", err);
      setToast({
        message: "Failed to update comment. Please try again.",
        type: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleDeleteComment = (commentId) => {
    setConfirmDialog({
      message: "Are you sure you want to delete this comment?",
      onConfirm: async () => {
        try {
          await deleteComment(commentId);
          // Remove comment from local state
          setComments(comments.filter((c) => c._id !== commentId));
          setToast({
            message: "Comment deleted successfully",
            type: "success",
          });
        } catch (err) {
          console.error("Failed to delete comment:", err);
          setToast({
            message: "Failed to delete comment. Please try again.",
            type: "error",
          });
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId);
      // Toggle like in UI (simplified - in production, fetch like status from backend)
      setComments(
        comments.map((c) =>
          c._id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: (c.likesCount || 0) + (c.isLiked ? -1 : 1),
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const handleOpenPlaylistModal = async () => {
    setShowPlaylistModal(true);
    setPlaylistsLoading(true);
    try {
      const response = await getUserPlaylists();
      setPlaylists(response.data || []);
    } catch (err) {
      console.error("Failed to load playlists:", err);
      alert("Failed to load playlists");
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setAddingToPlaylist(playlistId);
      await addVideoToPlaylist(playlistId, videoId);
      alert("Video added to playlist!");
    } catch (err) {
      console.error("Failed to add to playlist:", err);
      alert(err.response?.data?.message || "Failed to add video to playlist");
    } finally {
      setAddingToPlaylist(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Video Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-black aspect-video animate-pulse rounded-lg" />
              <div className="h-8 w-3/4 bg-neutral-800 dark:bg-neutral-700 rounded mb-4 animate-pulse" />
              <div className="flex gap-4">
                <div className="h-10 w-24 bg-neutral-800 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-10 w-24 bg-neutral-800 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-10 w-24 bg-neutral-800 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
              <div className="h-5 w-1/2 bg-neutral-800 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-neutral-800 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="h-6 w-32 bg-neutral-800 dark:bg-neutral-700 rounded mb-6 animate-pulse" />
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex gap-2 mb-4 animate-pulse">
                  <div className="w-32 h-20 bg-neutral-800 dark:bg-neutral-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-neutral-800 dark:bg-neutral-700 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-800 dark:bg-neutral-700 rounded" />
                    <div className="h-3 w-1/3 bg-neutral-800 dark:bg-neutral-700 rounded" />
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

  if (!video) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p
            className={`text-xl ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            Video not found
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className={`flex items-center gap-2 mb-6 px-4 py-2 border font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
            isDark
              ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="bg-black aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                src={video.videoFile}
                poster={video.thumbnail}
                onPlay={handleVideoPlay}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Title */}
            <h1
              className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              {video.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border text-sm sm:text-base font-semibold transition-all duration-200 ${
                  isLiked
                    ? "border-orange-500 bg-orange-500 text-white"
                    : isDark
                    ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill={isLiked ? "currentColor" : "none"}
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
                <span>{video.likesCount || 0}</span>
              </button>

              {/* Share Button */}
              <button
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border text-sm sm:text-base font-semibold transition-all duration-200 ${
                  isDark
                    ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>Share</span>
              </button>

              {/* Add to Playlist Button */}
              <button
                onClick={handleOpenPlaylistModal}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border text-sm sm:text-base font-semibold transition-all duration-200 ${
                  isDark
                    ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Save</span>
              </button>
            </div>

            {/* Views and Description */}
            <div>
              <div
                className={`flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                <span>{formatViews(video.view || 0)} views</span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
              <p
                className={`text-xs sm:text-sm font-medium leading-relaxed ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                {video.description}
              </p>
            </div>

            {/* Channel Info */}
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 py-4 mt-4 border-t ${
                isDark ? "border-neutral-800" : "border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <img
                  src={video.owner?.avatar || "/default-avatar.png"}
                  alt={video.owner?.username}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  onClick={() => {
                    if (user && video.owner?.username !== user.username) {
                      navigate(`/channel/${video.owner?.username}`);
                    }
                  }}
                />
                <div>
                  <h3
                    className={`font-semibold cursor-pointer transition-colors ${
                      isDark
                        ? "text-white hover:text-neutral-300"
                        : "text-neutral-900 hover:text-neutral-600"
                    }`}
                    onClick={() => {
                      if (user && video.owner?.username !== user.username) {
                        navigate(`/channel/${video.owner?.username}`);
                      }
                    }}
                  >
                    {video.owner?.fullName || video.owner?.username}
                  </h3>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-neutral-500" : "text-neutral-600"
                    }`}
                  >
                    {video.owner?.subscribersCount || 0} subscribers
                  </p>
                </div>
              </div>

              {/* Subscribe Button */}
              {user?._id !== video.owner?._id && (
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={handleSubscribe}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                      isSubscribed
                        ? isDark
                          ? "bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700"
                          : "bg-neutral-200 text-neutral-900 border border-neutral-300 hover:bg-neutral-300"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {isSubscribed && (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>

                  {/* Confetti Animation */}
                  {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 animate-confetti"
                          style={{
                            left: "50%",
                            top: "50%",
                            backgroundColor: [
                              "#f97316",
                              "#fb923c",
                              "#fdba74",
                              "#fed7aa",
                            ][i % 4],
                            animationDelay: `${i * 50}ms`,
                            transform: `rotate(${i * 18}deg) translateY(-${
                              20 + i * 5
                            }px)`,
                            opacity: 0,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <h2
                className={`text-xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {comments.length} Comments
              </h2>

              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="flex gap-3">
                  <img
                    src={user?.avatar || "/default-avatar.png"}
                    alt={user?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={`w-full px-4 py-3 border-b-2 transition-colors focus:outline-none ${
                        isDark
                          ? "bg-transparent border-neutral-800 text-white placeholder-neutral-600 focus:border-orange-500"
                          : "bg-transparent border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500"
                      }`}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setComment("")}
                        className={`px-4 py-2 font-semibold transition-colors ${
                          isDark
                            ? "text-neutral-400 hover:bg-neutral-900"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        className="px-4 py-2 bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {Array.isArray(comments) &&
                  comments.map((commentItem) => (
                    <div key={commentItem._id} className="flex gap-3">
                      <img
                        src={commentItem.owner?.avatar || "/default-avatar.png"}
                        alt={commentItem.owner?.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-sm ${
                                isDark ? "text-white" : "text-neutral-900"
                              }`}
                            >
                              {commentItem.owner?.username}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                isDark ? "text-neutral-500" : "text-neutral-500"
                              }`}
                            >
                              {commentItem.createdAt
                                ? timeAgo(commentItem.createdAt)
                                : ""}
                            </span>
                          </div>

                          {/* Edit/Delete buttons - only show for own comments */}
                          {user?._id === commentItem.owner?._id &&
                            editingCommentId !== commentItem._id && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handleEditComment(
                                      commentItem._id,
                                      commentItem.content
                                    )
                                  }
                                  className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                                    isDark
                                      ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                                  }`}
                                  title="Edit comment"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(commentItem._id)
                                  }
                                  className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                                    isDark
                                      ? "text-red-400 hover:text-red-300 hover:bg-red-950"
                                      : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  }`}
                                  title="Delete comment"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                        </div>

                        {/* Comment content or edit form */}
                        {editingCommentId === commentItem._id ? (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                              className={`w-full px-4 py-3 border-b-2 font-medium transition-colors focus:outline-none ${
                                isDark
                                  ? "bg-transparent border-neutral-800 text-white placeholder-neutral-600 focus:border-orange-500"
                                  : "bg-transparent border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500"
                              }`}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={handleCancelEdit}
                                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                                  isDark
                                    ? "text-neutral-400 hover:bg-neutral-900"
                                    : "text-neutral-600 hover:bg-neutral-100"
                                }`}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(commentItem._id)}
                                disabled={!editingCommentText.trim()}
                                className="px-4 py-2 text-sm bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`text-sm font-medium mb-3 text-left leading-relaxed ${
                                isDark ? "text-neutral-300" : "text-neutral-700"
                              }`}
                            >
                              {commentItem.content}
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleLikeComment(commentItem._id)
                                }
                                className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                                  commentItem.isLiked
                                    ? "text-orange-500 bg-orange-500/10"
                                    : isDark
                                    ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill={
                                    commentItem.isLiked
                                      ? "currentColor"
                                      : "none"
                                  }
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
                                <span>{commentItem.likesCount || 0}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <h3
              className={`font-bold text-lg mb-4 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Related Videos
            </h3>

            {relatedLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : relatedVideos.length === 0 ? (
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-neutral-500" : "text-neutral-500"
                }`}
              >
                No related videos found
              </p>
            ) : (
              <div className="space-y-3">
                {relatedVideos.map((relatedVideo) => (
                  <div
                    key={relatedVideo._id}
                    onClick={() => navigate(`/video/${relatedVideo._id}`)}
                    className={`flex gap-2 cursor-pointer group transition-all duration-200 ${
                      isDark ? "hover:bg-neutral-900" : "hover:bg-neutral-50"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-40 h-24 shrink-0 overflow-hidden">
                      <img
                        src={relatedVideo.thumbnail}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {relatedVideo.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 font-medium">
                          {formatDuration(relatedVideo.duration)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-semibold line-clamp-2 mb-1 ${
                          isDark ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {relatedVideo.title}
                      </h4>
                      <p
                        className={`text-xs font-medium mb-1 ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        {relatedVideo.owner?.username || "Unknown"}
                      </p>
                      <div
                        className={`text-xs font-medium ${
                          isDark ? "text-neutral-500" : "text-neutral-500"
                        }`}
                      >
                        <span>{formatViews(relatedVideo.view || 0)} views</span>
                        {relatedVideo.createdAt && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{timeAgo(relatedVideo.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md border ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Save to Playlist
                </h2>
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className={`p-1 transition-colors ${
                    isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {playlistsLoading ? (
                <div className="py-8 text-center">
                  <div
                    className={`animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto`}
                  />
                </div>
              ) : playlists.length === 0 ? (
                <div className="py-8 text-center">
                  <p
                    className={`mb-4 ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    No playlists yet
                  </p>
                  <button
                    onClick={() => {
                      setShowPlaylistModal(false);
                      navigate("/playlists");
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                  >
                    Create Playlist
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist._id}
                      onClick={() => handleAddToPlaylist(playlist._id)}
                      disabled={addingToPlaylist === playlist._id}
                      className={`w-full flex items-center justify-between p-3 border transition-colors text-left ${
                        addingToPlaylist === playlist._id
                          ? "opacity-50 cursor-wait"
                          : isDark
                          ? "border-neutral-800 hover:bg-neutral-800"
                          : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <svg
                          className={`w-5 h-5 shrink-0 ${
                            isDark ? "text-neutral-400" : "text-neutral-600"
                          }`}
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
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate ${
                              isDark ? "text-white" : "text-neutral-900"
                            }`}
                          >
                            {playlist.name}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-neutral-500" : "text-neutral-500"
                            }`}
                          >
                            {playlist.videoCount || 0} video
                            {playlist.videoCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {addingToPlaylist === playlist._id && (
                        <div
                          className={`animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}">
                <button
                  onClick={() => {
                    setShowPlaylistModal(false);
                    navigate("/playlists");
                  }}
                  className={`w-full px-4 py-2 border font-semibold transition-colors ${
                    isDark
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  Manage Playlists
                </button>
              </div>
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
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </Layout>
  );
};

export default VideoPlayerPage;
