import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  updateUserDetails,
  updatePassword,
  updateAvatar,
  updateCoverImage,
} from "../api/services/authServices";
import Layout from "../components/layout/Layout";

const SettingsPage = () => {
  const { isDark } = useTheme();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [coverImagePreview, setCoverImagePreview] = useState(
    user?.coverImage || ""
  );

  // Loading & message states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      setMessage({ type: "error", text: "Please fill all fields" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await updateUserDetails({ fullName, email });

      // Update user in context and localStorage
      const updatedUser = { ...user, fullName, email };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage({
        type: "success",
        text: response.message || "Details updated successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill all password fields" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await updatePassword({ oldPassword, newPassword });

      setMessage({
        type: "success",
        text: response.message || "Password updated successfully",
      });
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setMessage({ type: "error", text: "Please select an avatar" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await updateAvatar(avatarFile);

      // Update user avatar in context and localStorage
      const updatedUser = { ...user, avatar: response.data.avatar };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage({
        type: "success",
        text: response.message || "Avatar updated successfully",
      });
      setAvatarFile(null);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoverImage = async (e) => {
    e.preventDefault();
    if (!coverImageFile) {
      setMessage({ type: "error", text: "Please select a cover image" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const response = await updateCoverImage(coverImageFile);

      // Update user cover image in context and localStorage
      const updatedUser = { ...user, coverImage: response.data.coverImage };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage({
        type: "success",
        text: response.message || "Cover image updated successfully",
      });
      setCoverImageFile(null);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update cover image",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Settings
          </h1>
          <p
            className={`text-base ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            Manage your account settings
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-4 mb-6 border ${
              message.type === "success"
                ? isDark
                  ? "bg-green-950/20 border-green-900/50 text-green-400"
                  : "bg-green-50 border-green-200 text-green-700"
                : isDark
                ? "bg-red-950/20 border-red-900/50 text-red-400"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Images Section */}
          <div
            className={`border p-6 ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Profile Images
            </h2>

            {/* Avatar */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Avatar
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={avatarPreview || "https://via.placeholder.com/100"}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
                />
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className={`w-full px-3 py-2 border text-sm ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                  />
                  <button
                    onClick={handleUpdateAvatar}
                    disabled={loading || !avatarFile}
                    className="mt-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-600 text-white px-4 py-2 font-semibold transition-all duration-200"
                  >
                    {loading ? "Updating..." : "Update Avatar"}
                  </button>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Cover Image
              </label>
              <div className="space-y-4">
                <div className="w-full h-48 overflow-hidden border-2 border-orange-500">
                  <img
                    src={
                      coverImagePreview || "https://via.placeholder.com/800x200"
                    }
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className={`w-full px-3 py-2 border text-sm ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                  />
                  <button
                    onClick={handleUpdateCoverImage}
                    disabled={loading || !coverImageFile}
                    className="mt-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-600 text-white px-4 py-2 font-semibold transition-all duration-200"
                  >
                    {loading ? "Updating..." : "Update Cover Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <form
            onSubmit={handleUpdateDetails}
            className={`border p-6 ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Account Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ""}
                  disabled
                  className={`w-full px-4 py-2 border cursor-not-allowed ${
                    isDark
                      ? "bg-neutral-800 border-neutral-700 text-neutral-500"
                      : "bg-neutral-100 border-neutral-300 text-neutral-500"
                  }`}
                />
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Username cannot be changed
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-600 text-white px-6 py-2 font-semibold transition-all duration-200"
              >
                {loading ? "Updating..." : "Update Details"}
              </button>
            </div>
          </form>

          {/* Change Password Section */}
          <form
            onSubmit={handleUpdatePassword}
            className={`border p-6 ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    isDark
                      ? "bg-neutral-950 border-neutral-800 text-white"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                  required
                  minLength={6}
                />
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Must be at least 6 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-600 text-white px-6 py-2 font-semibold transition-all duration-200"
              >
                {loading ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>

          {/* Back to Profile Button */}
          <button
            onClick={() => navigate("/profile")}
            className={`w-full py-3 border font-medium transition-colors ${
              isDark
                ? "border-neutral-800 text-neutral-300 hover:bg-neutral-900"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Back to Profile
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
