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

  return (
    <Layout>
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
        <div className="container mx-auto px-6 py-12 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Upload Video
            </h1>
            <p className={`${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Share your content with the world
            </p>
          </div>

          <div className={`border p-8 transition-all duration-300 ${
            isDark 
              ? 'bg-neutral-900 border-neutral-800' 
              : 'bg-white border-neutral-200 shadow-lg'
          }`}>
            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-4 border-l-4 border-red-500 animate-[slideIn_0.3s_ease-out] ${
                isDark ? 'bg-red-950/50' : 'bg-red-50'
              }`}>
                <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
              </div>
            )}

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Uploading...
                  </span>
                  <span className={`text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    {uploadProgress}%
                  </span>
                </div>
                <div className={`w-full h-2 ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                  <div
                    className="bg-orange-500 h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="group">
                <label htmlFor="title" className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-neutral-300 group-focus-within:text-white' : 'text-neutral-700 group-focus-within:text-neutral-900'
                }`}>
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter video title"
                  className={`w-full px-4 py-3 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-900' 
                      : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white'
                  }`}
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="group">
                <label htmlFor="description" className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-neutral-300 group-focus-within:text-white' : 'text-neutral-700 group-focus-within:text-neutral-900'
                }`}>
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your video..."
                  rows="4"
                  className={`w-full px-4 py-3 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-900' 
                      : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white'
                  }`}
                  disabled={loading}
                />
              </div>

              {/* Two Column Grid for File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video File Upload */}
                <div className="group">
                  <label htmlFor="videoFile" className={`block text-sm font-medium mb-2 transition-colors ${
                    isDark ? 'text-neutral-300 group-focus-within:text-white' : 'text-neutral-700 group-focus-within:text-neutral-900'
                  }`}>
                    Video File * <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>(Max 5MB)</span>
                  </label>
                  <input
                    type="file"
                    id="videoFile"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className={`w-full px-4 py-3 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:cursor-pointer ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 text-white file:bg-orange-500 file:text-white hover:file:bg-orange-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-900' 
                        : 'bg-white border-neutral-300 text-neutral-900 file:bg-orange-500 file:text-white hover:file:bg-orange-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white'
                    }`}
                    disabled={loading}
                  />
                  {videoPreview && (
                    <div className="mt-4">
                      <video
                        src={videoPreview}
                        controls
                        className={`w-full max-h-48 border ${isDark ? 'border-neutral-800' : 'border-neutral-300'}`}
                      />
                    </div>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div className="group">
                  <label htmlFor="thumbnail" className={`block text-sm font-medium mb-2 transition-colors ${
                    isDark ? 'text-neutral-300 group-focus-within:text-white' : 'text-neutral-700 group-focus-within:text-neutral-900'
                  }`}>
                    Thumbnail * <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>(Max 5MB)</span>
                  </label>
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className={`w-full px-4 py-3 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:cursor-pointer ${
                      isDark 
                        ? 'bg-neutral-950 border-neutral-800 text-white file:bg-orange-500 file:text-white hover:file:bg-orange-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-900' 
                        : 'bg-white border-neutral-300 text-neutral-900 file:bg-orange-500 file:text-white hover:file:bg-orange-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white'
                    }`}
                    disabled={loading}
                  />
                  {thumbnailPreview && (
                    <div className="mt-4">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className={`w-full max-h-48 object-cover border ${isDark ? 'border-neutral-800' : 'border-neutral-300'}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-6 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}">
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className={`px-6 py-3 border font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isDark 
                      ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' 
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 font-semibold transition-all duration-200 ${
                    loading
                      ? isDark ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload Video"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadVideoPage;
