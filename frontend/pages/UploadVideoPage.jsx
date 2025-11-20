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
    // Responsive skeleton loader for upload video page
    return (
      <Layout>
        <div
          className={`min-h-screen transition-colors duration-300 ${
            isDark ? "bg-neutral-950" : "bg-neutral-50"
          }`}
        >
          <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="mb-8 animate-pulse">
              <div
                className={`h-10 w-1/3 mb-2 rounded bg-neutral-300/40 dark:bg-neutral-700/60`}
              ></div>
              <div
                className={`h-6 w-1/2 rounded bg-neutral-300/40 dark:bg-neutral-700/60`}
              ></div>
            </div>
            <div
              className={`border p-8 ${
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-neutral-200"
              }`}
            >
              <div className="space-y-6">
                <div className="h-10 w-full rounded bg-neutral-300/40 dark:bg-neutral-700/60"></div>
                <div className="h-24 w-full rounded bg-neutral-300/40 dark:bg-neutral-700/60"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-48 w-full rounded bg-neutral-300/40 dark:bg-neutral-700/60"></div>
                  <div className="h-48 w-full rounded bg-neutral-300/40 dark:bg-neutral-700/60"></div>
                </div>
                <div className="h-16 w-full rounded bg-neutral-300/40 dark:bg-neutral-700/60"></div>
                <div className="h-12 w-full rounded bg-neutral-300/40 dark:bg-neutral-700/60"></div>
              </div>
            </div>
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
        <div className="container mx-auto px-6 py-12 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1
              className={`text-4xl font-bold mb-2 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Upload Video
            </h1>
            <p
              className={`${isDark ? "text-neutral-400" : "text-neutral-600"}`}
            >
              Share your content with the world
            </p>
          </div>
          {/* ...existing code... */}
        </div>
      </div>
    </Layout>
  );
};

export default UploadVideoPage;
