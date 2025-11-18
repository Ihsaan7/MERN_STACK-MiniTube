import apiClient from "../axios.config";

// ==================== ADD COMMENT ====================
export const addComment = async (videoId, content) => {
  try {
    const response = await apiClient.post(`/comments/comment/${videoId}`, {
      content,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== GET ALL COMMENTS ====================
export const getAllComments = async (videoId) => {
  try {
    const response = await apiClient.get(`/comments/all-comment/${videoId}`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== UPDATE COMMENT ====================
export const updateComment = async (commentId, content) => {
  try {
    const response = await apiClient.patch(
      `/comments/update-comment/${commentId}`,
      {
        content,
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== DELETE COMMENT ====================
export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(
      `/comments/remove-comment/${commentId}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};
