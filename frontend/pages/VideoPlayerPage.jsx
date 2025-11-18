import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVideo } from "../api/services/video.services";
import { likeVideo } from "../api/services/like.services";
import { toggleSubscribe } from "../api/services/subscription.services";
import { addComment, getAllComments } from "../api/services/comment.services";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

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

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [videoId]);

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
      setComments(response.data?.comments || response.data || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const handleSubscribe = async () => {
    try {
      await toggleSubscribe(video.owner._id);
      setIsSubscribed(!isSubscribed);

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
      alert("Failed to subscribe. Please try again.");
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
      alert("Failed to like video. Please try again.");
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
      alert("Failed to add comment. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

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
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="bg-black aspect-video">
              <video
                className="w-full h-full"
                controls
                autoPlay
                src={video.videoFile}
                poster={video.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Title and Actions Row */}
            <div className="flex items-start justify-between gap-6">
              {/* Left: Title */}
              <h1
                className={`text-2xl font-bold tracking-tight flex-1 text-left ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {video.title}
              </h1>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Like Button (Combined Like/Dislike) */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 border font-semibold transition-all duration-200 ${
                    isLiked
                      ? "border-orange-500 bg-orange-500 text-white"
                      : isDark
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
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
                  className={`flex items-center gap-2 px-4 py-2 border font-semibold transition-all duration-200 ${
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Views and Description */}
            <div className="text-left">
              <div
                className={`flex items-center gap-2 text-sm font-medium mb-3 ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
              <p
                className={`text-sm font-medium leading-relaxed ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                {video.description}
              </p>
            </div>

            {/* Channel Info */}
            <div
              className={`flex items-center justify-between py-4 mt-4 border-t ${
                isDark ? "border-neutral-800" : "border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={video.owner?.avatar || "/default-avatar.png"}
                  alt={video.owner?.username}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  onClick={() => navigate(`/channel/${video.owner?.username}`)}
                />
                <div>
                  <h3
                    className={`font-semibold cursor-pointer transition-colors ${
                      isDark
                        ? "text-white hover:text-neutral-300"
                        : "text-neutral-900 hover:text-neutral-600"
                    }`}
                    onClick={() =>
                      navigate(`/channel/${video.owner?.username}`)
                    }
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
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <img
                      src={comment.owner?.avatar || "/default-avatar.png"}
                      alt={comment.owner?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-semibold text-sm ${
                            isDark ? "text-white" : "text-neutral-900"
                          }`}
                        >
                          {comment.owner?.username}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isDark ? "text-neutral-500" : "text-neutral-500"
                          }`}
                        >
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm mb-2 ${
                          isDark ? "text-neutral-300" : "text-neutral-700"
                        }`}
                      >
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                            isDark
                              ? "text-neutral-400 hover:text-white"
                              : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
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
                          <span>0</span>
                        </button>
                        <button
                          className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                            isDark
                              ? "text-neutral-400 hover:text-white"
                              : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                            />
                          </svg>
                        </button>
                        <button
                          className={`text-sm font-semibold transition-colors ${
                            isDark
                              ? "text-neutral-400 hover:text-white"
                              : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Suggested Videos */}
          <div className="lg:col-span-1">
            <h3
              className={`font-bold text-lg mb-4 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Suggested Videos
            </h3>
            <p
              className={`text-sm font-medium ${
                isDark ? "text-neutral-500" : "text-neutral-500"
              }`}
            >
              Coming soon...
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VideoPlayerPage;
