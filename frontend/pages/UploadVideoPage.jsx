import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/layout/Layout";
import apiClient from "../api/axios.config";

const UploadVideoPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [isPublished, setIsPublished] = useState(true);

  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle text input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle video file selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max as per backend)
      if (file.size > 5 * 1024 * 1024) {
        setError("Video file must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file");
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        setError("Thumbnail must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Validate form
  const validateForm = () => {
    const { title, description } = formData;

    if (!title || !description) {
      setError("Title and description are required!");
      return false;
    }

    if (!videoFile) {
      setError("Please select a video file");
      return false;
    }

    if (!thumbnail) {
      setError("Please select a thumbnail");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("videoFile", videoFile);
      uploadData.append("thumbnail", thumbnail);
      uploadData.append("isPublished", isPublished);

      const response = await apiClient.post(
        "/videos/upload-video",
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response) {
        // Redirect to home or video page after successful upload
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            {/* Simple Spinner */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className={`absolute inset-0 border-4 ${
                isDark ? "border-neutral-800" : "border-neutral-200"
              }`}></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 animate-spin"></div>
            </div>

            {/* Loading Text */}
            <h2
              className={`text-xl font-bold tracking-tight mb-2 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Uploading Video
            </h2>
            <p
              className={`text-sm font-semibold ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Please wait while we process your video...
            </p>
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
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => navigate("/home")}
            className={`flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-2 border font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base ${
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
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Upload Video
            </h1>
            <p
              className={`font-semibold text-sm sm:text-base ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              Share your content with the world
            </p>
          </div>
          {/* Upload Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {error && (
                  <div
                    className={`p-3 sm:p-4 border ${
                      isDark
                        ? "bg-red-950/20 border-red-900/50 text-red-400"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <p className="font-semibold text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {/* Video Details Section */}
                <div
                  className={`border p-4 sm:p-6 ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-200 shadow-md"
                  }`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
                      isDark ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    Video Details
                  </h2>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label
                        className={`block font-bold mb-2 text-sm ${
                          isDark ? "text-neutral-300" : "text-neutral-700"
                        }`}
                      >
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isDark
                            ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600"
                            : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400"
                        }`}
                        placeholder="Enter a descriptive title"
                        maxLength={100}
                        required
                      />
                      <p
                        className={`text-xs mt-1 font-semibold ${
                          isDark ? "text-neutral-500" : "text-neutral-500"
                        }`}
                      >
                        {formData.title.length}/100 characters
                      </p>
                    </div>

                    <div>
                      <label
                        className={`block font-bold mb-2 text-sm ${
                          isDark ? "text-neutral-300" : "text-neutral-700"
                        }`}
                      >
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                          isDark
                            ? "bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600"
                            : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400"
                        }`}
                        placeholder="Tell viewers about your video"
                        rows={4}
                        maxLength={500}
                        required
                      />
                      <p
                        className={`text-xs mt-1 font-semibold ${
                          isDark ? "text-neutral-500" : "text-neutral-500"
                        }`}
                      >
                        {formData.description.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video File Section */}
                <div
                  className={`border p-4 sm:p-6 ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-200 shadow-md"
                  }`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
                      isDark ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    Video File
                  </h2>

                  <div
                    className={`border-2 border-dashed p-4 sm:p-8 text-center transition-colors ${
                      isDark
                        ? "border-neutral-700 hover:border-orange-500"
                        : "border-neutral-300 hover:border-orange-500"
                    }`}
                  >
                    <svg
                      className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 ${
                        isDark ? "text-neutral-600" : "text-neutral-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      id="videoFile"
                      required
                    />
                    <label htmlFor="videoFile" className="cursor-pointer">
                      <span
                        className={`block font-bold mb-2 text-sm sm:text-base break-all px-2 ${
                          isDark ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {videoFile ? videoFile.name : "Select video file"}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        Click to browse or drag and drop
                      </span>
                    </label>
                  </div>

                  {videoPreview && (
                    <div className="mt-6">
                      <p
                        className={`text-sm font-bold mb-3 ${
                          isDark ? "text-neutral-300" : "text-neutral-700"
                        }`}
                      >
                        Preview
                      </p>
                      <video
                        src={videoPreview}
                        controls
                        className={`w-full border ${
                          isDark
                            ? "border-neutral-800 bg-black"
                            : "border-neutral-300"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Thumbnail Section */}
                <div
                  className={`border p-4 sm:p-6 ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-white border-neutral-200 shadow-md"
                  }`}
                >
                  <h2
                    className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
                      isDark ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    Thumbnail
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div
                      className={`border-2 border-dashed p-4 sm:p-6 text-center transition-colors ${
                        isDark
                          ? "border-neutral-700 hover:border-orange-500"
                          : "border-neutral-300 hover:border-orange-500"
                      }`}
                    >
                      <svg
                        className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${
                          isDark ? "text-neutral-600" : "text-neutral-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="thumbnail"
                        required
                      />
                      <label htmlFor="thumbnail" className="cursor-pointer">
                        <span
                          className={`block font-bold text-xs sm:text-sm mb-1 ${
                            isDark ? "text-white" : "text-neutral-900"
                          }`}
                        >
                          Upload Thumbnail
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isDark ? "text-neutral-400" : "text-neutral-600"
                          }`}
                        >
                          JPG, PNG (16:9 ratio)
                        </span>
                      </label>
                    </div>

                    {thumbnailPreview && (
                      <div>
                        <p
                          className={`text-sm font-bold mb-2 ${
                            isDark ? "text-neutral-300" : "text-neutral-700"
                          }`}
                        >
                          Preview
                        </p>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          className={`w-full aspect-video object-cover border ${
                            isDark ? "border-neutral-800" : "border-neutral-300"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div
                    className={`border p-4 sm:p-6 ${
                      isDark
                        ? "bg-neutral-900 border-neutral-800"
                        : "bg-white border-neutral-200 shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`font-bold text-sm sm:text-base ${
                          isDark ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        Uploading...
                      </span>
                      <span className={`font-bold text-sm sm:text-base text-orange-500`}>
                        {uploadProgress}%
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 sm:h-3 overflow-hidden ${
                        isDark ? "bg-neutral-800" : "bg-neutral-200"
                      }`}
                    >
                      <div
                        className="bg-orange-500 h-2 sm:h-3 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div
                className={`border p-4 sm:p-6 lg:sticky lg:top-6 ${
                  isDark
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-white border-neutral-200 shadow-md"
                }`}
              >
                <h2
                  className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Visibility
                </h2>

                {/* Publish Toggle */}
                <div
                  className={`p-3 sm:p-4 border mb-4 sm:mb-6 ${
                    isDark
                      ? "border-neutral-800 bg-neutral-950"
                      : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm sm:text-base ${
                          isDark ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {isPublished ? "Public" : "Private"}
                      </p>
                      <p
                        className={`text-xs font-semibold mt-1 ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        {isPublished
                          ? "Everyone can watch your video"
                          : "Only you can watch your video"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPublished(!isPublished)}
                      className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 flex-shrink-0 items-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        isPublished
                          ? "bg-orange-500"
                          : isDark
                          ? "bg-neutral-700"
                          : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform bg-white transition-transform ${
                          isPublished ? "translate-x-6 sm:translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:bg-neutral-600 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4"
                >
                  {loading ? "Uploading..." : "Upload Video"}
                </button>

                {/* Info */}
                <div
                  className={`text-xs font-semibold space-y-1.5 sm:space-y-2 ${
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  <p>• Your video will be processed after upload</p>
                  <p>• Maximum file size: 5MB</p>
                  <p>• Supported formats: MP4, AVI, MOV</p>
                </div>
              </div>
            </div>
          </div>
          {/* ...existing code... */}
        </div>
      </div>
    </Layout>
  );
};

export default UploadVideoPage;
