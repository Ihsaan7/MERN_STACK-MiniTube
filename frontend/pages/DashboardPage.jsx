import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/layout/Layout";
import {
  getChannelStats,
  getChannelVideos,
} from "../api/services/dashboard.services";

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, videosResponse] = await Promise.all([
        getChannelStats(),
        getChannelVideos(),
      ]);

      console.log("Stats response:", statsResponse);
      console.log("Videos response:", videosResponse);

      setStats(statsResponse.data);

      // Ensure videos is always an array
      const videosData = videosResponse.data;
      if (Array.isArray(videosData)) {
        setVideos(videosData);
      } else if (videosData?.videos && Array.isArray(videosData.videos)) {
        setVideos(videosData.videos);
      } else if (videosData?.docs && Array.isArray(videosData.docs)) {
        setVideos(videosData.docs);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString() || "0";
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
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="space-y-8">
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-6 animate-pulse ${
                    isDark ? "bg-neutral-900" : "bg-neutral-100"
                  }`}
                >
                  <div className="h-8 w-2/3 bg-neutral-800 dark:bg-neutral-700 rounded mb-4" />
                  <div className="h-4 w-1/2 bg-neutral-800 dark:bg-neutral-700 rounded" />
                </div>
              ))}
            </div>
            {/* Table skeleton */}
            <div className="rounded-lg border overflow-x-auto">
              <div className="min-w-[600px]">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 border-b p-4 animate-pulse ${
                      isDark ? "border-neutral-800" : "border-neutral-200"
                    }`}
                  >
                    <div
                      className={`w-24 h-16 rounded bg-neutral-800 dark:bg-neutral-700`}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-neutral-800 dark:bg-neutral-700 rounded" />
                      <div className="h-3 w-1/2 bg-neutral-800 dark:bg-neutral-700 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-neutral-800 dark:bg-neutral-700 rounded" />
                    <div className="h-4 w-12 bg-neutral-800 dark:bg-neutral-700 rounded" />
                    <div className="h-4 w-12 bg-neutral-800 dark:bg-neutral-700 rounded" />
                    <div className="h-4 w-20 bg-neutral-800 dark:bg-neutral-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
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
            <p
              className={`text-xl mb-4 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              {error}
            </p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-neutral-950" : "bg-neutral-50"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/home")}
            className={`flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-2 border text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Channel Analytics
            </h1>
            <p
              className={`text-sm sm:text-base font-semibold ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
            >
              Track your channel's performance
            </p>
          </div>

          {/* Info Banner */}
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 border ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 ${
                  isDark ? "text-orange-500" : "text-orange-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p
                  className={`text-xs sm:text-sm font-bold mb-1 ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Published Videos Only
                </p>
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  These statistics only include your published videos. Private
                  videos are not counted in the metrics below.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Total Views */}
            <div
              className={`border p-4 sm:p-6 ${
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-neutral-200 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-500/10 border border-orange-500/20">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              </div>
              <h3
                className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {formatNumber(stats?.totalViews || 0)}
              </h3>
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Total Views
              </p>
            </div>

            {/* Total Subscribers */}
            <div
              className={`border p-4 sm:p-6 ${
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-neutral-200 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-500/10 border border-orange-500/20">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3
                className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {formatNumber(stats?.totalSubscribers || 0)}
              </h3>
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Subscribers
              </p>
            </div>

            {/* Total Likes */}
            <div
              className={`border p-4 sm:p-6 ${
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-neutral-200 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-500/10 border border-orange-500/20">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500"
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
                </div>
              </div>
              <h3
                className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {formatNumber(stats?.totalLikes || 0)}
              </h3>
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Total Likes
              </p>
            </div>

            {/* Total Videos */}
            <div
              className={`border p-4 sm:p-6 ${
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-neutral-200 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-500/10 border border-orange-500/20">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500"
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
                </div>
              </div>
              <h3
                className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {stats?.totalVideos || 0}
              </h3>
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                Total Videos
              </p>
            </div>
          </div>

          {/* Recent Videos Table */}
          <div
            className={`border ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200 shadow-md"
            }`}
          >
            <div className="p-4 sm:p-6 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}">
              <h2
                className={`text-xl sm:text-2xl font-bold ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                Your Videos
              </h2>
            </div>
            <div className="overflow-x-auto">
              {videos.length === 0 ? (
                <div className="p-12 text-center">
                  <svg
                    className={`mx-auto w-16 h-16 mb-4 ${
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
                  <p
                    className={`text-lg mb-4 ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    No videos uploaded yet
                  </p>
                  <button
                    onClick={() => navigate("/upload")}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                  >
                    Upload Video
                  </button>
                </div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead
                    className={`${isDark ? "bg-neutral-800" : "bg-neutral-50"}`}
                  >
                    <tr>
                      <th
                        className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        Video
                      </th>
                      <th
                        className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        Views
                      </th>
                      <th
                        className={`px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        Likes
                      </th>
                      <th
                        className={`px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        Comments
                      </th>
                      <th
                        className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        Uploaded
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark ? "divide-neutral-800" : "divide-neutral-200"
                    }`}
                  >
                    {Array.isArray(videos) &&
                      videos.map((video) => (
                        <tr
                          key={video._id}
                          className={`transition-colors ${
                            isDark
                              ? "hover:bg-neutral-800"
                              : "hover:bg-neutral-50"
                          }`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div
                              onClick={() => navigate(`/video/${video._id}`)}
                              className="flex items-center gap-2 sm:gap-4 cursor-pointer group"
                            >
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-20 sm:w-24 aspect-video object-cover group-hover:opacity-80 transition-opacity"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm sm:text-base font-semibold truncate group-hover:text-orange-500 transition-colors ${
                                    isDark ? "text-white" : "text-neutral-900"
                                  }`}
                                >
                                  {video.title}
                                </p>
                                <p
                                  className={`text-xs sm:text-sm truncate ${
                                    isDark
                                      ? "text-neutral-400"
                                      : "text-neutral-600"
                                  }`}
                                >
                                  {video.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span
                              className={`px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                                video.isPublished
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                  : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {video.isPublished ? "Published" : "Private"}
                            </span>
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 text-right text-sm font-semibold whitespace-nowrap ${
                              isDark ? "text-neutral-300" : "text-neutral-700"
                            }`}
                          >
                            {formatNumber(video.view || 0)}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 text-right text-sm font-semibold whitespace-nowrap ${
                              isDark ? "text-neutral-300" : "text-neutral-700"
                            }`}
                          >
                            {formatNumber(video.likesCount || 0)}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 text-right text-sm font-semibold whitespace-nowrap ${
                              isDark ? "text-neutral-300" : "text-neutral-700"
                            }`}
                          >
                            {formatNumber(video.commentsCount || 0)}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap ${
                              isDark ? "text-neutral-400" : "text-neutral-600"
                            }`}
                          >
                            {formatDate(video.createdAt)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
