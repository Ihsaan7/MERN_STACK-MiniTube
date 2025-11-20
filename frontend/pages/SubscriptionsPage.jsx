import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMySubscriptions } from "../api/services/subscription.services";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

const SubscriptionsPage = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMySubscriptions();

      // Backend returns paginated result with docs array
      // Each doc has structure: { channel: { username, fullName, avatar, subscribersCount }, subscribedAt }
      const channels = response.data?.docs?.map((item) => item.channel) || [];
      setSubscriptions(channels);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError(err.response?.data?.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = (username) => {
    // Prevent redirecting to own channel
    if (user && username === user.username) {
      // Optionally show a toast or do nothing
      return;
    }
    navigate(`/channel/${username}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr py-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`border animate-pulse rounded-lg transition-all duration-200 ${
                  isDark
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 dark:bg-neutral-700 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-2/3 bg-neutral-800 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-neutral-800 dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
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
      <div className="max-w-7xl mx-auto px-6 py-8">
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

        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Subscriptions
          </h1>
          <p
            className={`text-base font-semibold ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            {subscriptions.length > 0
              ? `${subscriptions.length} channel${
                  subscriptions.length !== 1 ? "s" : ""
                }`
              : "No subscriptions yet"}
          </p>
        </div>

        {/* Subscriptions Grid */}
        {subscriptions.length === 0 ? (
          <div
            className={`border p-12 text-center ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-neutral-50 border-neutral-200"
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              No subscriptions yet
            </h3>
            <p
              className={`mb-6 ${
                isDark ? "text-neutral-500" : "text-neutral-500"
              }`}
            >
              Subscribe to channels to see them here
            </p>
            <button
              onClick={() => navigate("/home")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Explore Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subscriptions.map((subscription) => (
              <div
                key={subscription._id}
                onClick={() => handleChannelClick(subscription.username)}
                className={`group border cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  isDark
                    ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-xl hover:shadow-orange-500/10"
                    : "bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xl"
                }`}
              >
                {/* Avatar */}
                <div className="p-6 pb-4">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img
                      src={
                        subscription.avatar || "https://via.placeholder.com/128"
                      }
                      alt={subscription.fullName}
                      className="w-full h-full rounded-full object-cover border-4 border-orange-500 transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Verified Badge (if needed later) */}
                    <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Channel Info */}
                  <div className="text-center">
                    <h3
                      className={`text-lg font-bold mb-1 line-clamp-1 ${
                        isDark ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {subscription.fullName}
                    </h3>
                    <p
                      className={`text-sm mb-2 ${
                        isDark ? "text-neutral-400" : "text-neutral-600"
                      }`}
                    >
                      @{subscription.username}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-neutral-500" : "text-neutral-500"
                      }`}
                    >
                      {subscription.subscribersCount || 0} subscriber
                      {subscription.subscribersCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* View Channel Button */}
                <div
                  className={`border-t px-6 py-4 text-center transition-colors ${
                    isDark
                      ? "border-neutral-800 bg-neutral-950/50 group-hover:bg-orange-500/10"
                      : "border-neutral-200 bg-neutral-50 group-hover:bg-orange-50"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isDark
                        ? "text-neutral-400 group-hover:text-orange-500"
                        : "text-neutral-600 group-hover:text-orange-600"
                    }`}
                  >
                    View Channel
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubscriptionsPage;
