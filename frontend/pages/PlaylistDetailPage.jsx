import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/layout/Layout";
import {
  getSinglePlaylist,
  removeVideoFromPlaylist,
} from "../api/services/playlist.services";

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingVideo, setRemovingVideo] = useState(null);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getSinglePlaylist(playlistId);
      console.log("Playlist detail response:", response);
      setPlaylist(response.data);
    } catch (err) {
      console.error("Error fetching playlist:", err);
      setError(err.response?.data?.message || "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!confirm("Remove this video from the playlist?")) {
      return;
    }

    try {
      setRemovingVideo(videoId);
      await removeVideoFromPlaylist(playlistId, videoId);
      await fetchPlaylist();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove video");
    } finally {
      setRemovingVideo(null);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div
          className={`min-h-screen flex items-center justify-center ${
            isDark ? "bg-neutral-950" : "bg-neutral-50"
          }`}
        >
          <div className="text-center">
            <div
              className={`animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4`}
            />
            <p className={isDark ? "text-neutral-400" : "text-neutral-600"}>
              Loading playlist...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !playlist) {
    return (
      <Layout>
        <div
          className={`min-h-screen flex items-center justify-center ${
            isDark ? "bg-neutral-950" : "bg-neutral-50"
          }`}
        >
          <div className="text-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              {error || "Playlist not found"}
            </h3>
            <button
              onClick={() => navigate("/playlists")}
              className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
            >
              Back to Playlists
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwner = user?._id === playlist.owner?._id;

  return (
    <Layout>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-neutral-950" : "bg-neutral-50"
        }`}
      >
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/playlists")}
              className={`flex items-center gap-2 mb-4 transition-colors ${
                isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Playlists
            </button>

            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1
                    className={`text-4xl font-bold ${
                      isDark ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {playlist.name}
                  </h1>
                  {!playlist.isPublic && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm font-semibold border border-yellow-500/30">
                      PRIVATE
                    </span>
                  )}
                </div>
                <p
                  className={`text-lg mb-4 ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  {playlist.description}
                </p>
                <div
                  className={`flex items-center gap-4 text-sm ${
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  <span className="flex items-center gap-2">
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
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                    {playlist.videoCount || 0} videos
                  </span>
                  <span>•</span>
                  <span>Created {formatDate(playlist.createdAt)}</span>
                  {playlist.owner && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() =>
                          navigate(`/channel/${playlist.owner.username}`)
                        }
                        className="hover:text-orange-500 transition-colors"
                      >
                        by {playlist.owner.fullName || playlist.owner.username}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Videos Section */}
          {!playlist.videos || playlist.videos.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className={`mx-auto w-24 h-24 mb-4 ${
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                No videos in this playlist
              </h3>
              <p
                className={`mb-6 ${
                  isDark ? "text-neutral-500" : "text-neutral-500"
                }`}
              >
                {isOwner
                  ? "Add videos to this playlist from the video player"
                  : "This playlist is empty"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {playlist.videos.map((video, index) => (
                <div
                  key={video._id}
                  className={`flex gap-4 border p-4 transition-all duration-200 hover:scale-[1.01] ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                      : "bg-white border-neutral-200 hover:border-neutral-300 shadow-md hover:shadow-lg"
                  }`}
                >
                  {/* Index Number */}
                  <div
                    className={`flex items-center justify-center w-8 ${
                      isDark ? "text-neutral-500" : "text-neutral-400"
                    }`}
                  >
                    <span className="font-semibold">{index + 1}</span>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => navigate(`/video/${video._id}`)}
                    className="relative w-60 aspect-video flex-shrink-0 cursor-pointer group overflow-hidden"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 font-semibold">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                    {!video.isPublished && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold">
                        UNPUBLISHED
                      </div>
                    )}
                  </div>

                  {/* Video Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => navigate(`/video/${video._id}`)}
                      className={`text-lg font-semibold mb-2 cursor-pointer hover:text-orange-500 transition-colors line-clamp-2 ${
                        isDark ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {video.title}
                    </h3>
                    {video.description && (
                      <p
                        className={`text-sm mb-3 line-clamp-2 ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        {video.description}
                      </p>
                    )}
                    <div
                      className={`flex items-center gap-4 text-sm ${
                        isDark ? "text-neutral-500" : "text-neutral-500"
                      }`}
                    >
                      {video.owner && (
                        <button
                          onClick={() =>
                            navigate(`/channel/${video.owner.username}`)
                          }
                          className="flex items-center gap-2 hover:text-orange-500 transition-colors"
                        >
                          <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{video.owner.fullName}</span>
                        </button>
                      )}
                      {video.view !== undefined && (
                        <>
                          <span>•</span>
                          <span>
                            {video.view.toLocaleString()} view
                            {video.view !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remove Button (only for owner) */}
                  {isOwner && (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleRemoveVideo(video._id)}
                        disabled={removingVideo === video._id}
                        className={`px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors disabled:opacity-50 ${
                          removingVideo === video._id ? "cursor-wait" : ""
                        }`}
                      >
                        {removingVideo === video._id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlaylistDetailPage;
