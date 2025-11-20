import apiClient from "../axios.config";

// ==================== UPLOAD VIDEO ====================
export const uploadVideo = async (videoData) => {
  try {
    const formData = new FormData();
    formData.append("title", videoData.title);
    formData.append("description", videoData.description);
    formData.append("videoFile", videoData.videoFile);
    formData.append("thumbnail", videoData.thumbnail);

    const response = await apiClient.post("/videos/upload-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== GET ALL VIDEOS ====================
export const getAllVideos = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      query = "",
      sortBy = "",
      sortType = "",
      userId = "",
    } = params;

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(query && { query }),
      ...(sortBy && { sortBy }),
      ...(sortType && { sortType }),
      ...(userId && { userId }),
    });

    const response = await apiClient.get(`/videos?${queryParams}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== GET SINGLE VIDEO ====================
export const getVideo = async (videoId) => {
  try {
    const response = await apiClient.get(`/videos/watch/${videoId}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== DELETE VIDEO ====================
export const deleteVideo = async (videoId) => {
  try {
    const response = await apiClient.delete(`/videos/remove-video/${videoId}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== INCREMENT VIDEO VIEW ====================
export const incrementVideoView = async (videoId) => {
  try {
    const response = await apiClient.post(`/videos/increment-view/${videoId}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== UPDATE VIDEO PUBLISH STATUS ====================
export const togglePublishStatus = async (videoId) => {
  try {
    const response = await apiClient.patch(`/videos/update-publish/${videoId}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== UPDATE VIDEO CONTENT ====================
export const updateVideoContent = async (videoId, contentData) => {
  try {
    const formData = new FormData();
    formData.append("title", contentData.title);
    formData.append("description", contentData.description);
    if (contentData.thumbnail) {
      formData.append("thumbnail", contentData.thumbnail);
    }

    const response = await apiClient.patch(
      `/videos/update-content/${videoId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};
