import apiClient from "../axios.config";

// ==================== LIKE VIDEO ====================
export const likeVideo = async (videoId) => {
  try {
    const response = await apiClient.post(`/likes/like-video/${videoId}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== LIKE COMMENT ====================
export const likeComment = async (commentId) => {
  try {
    const response = await apiClient.post(`/likes/like-comment/${commentId}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== GET LIKED VIDEOS ====================
export const getLikedVideos = async () => {
  try {
    const response = await apiClient.get("/likes/get-liked-video");
    return response;
  } catch (err) {
    throw err;
  }
};
