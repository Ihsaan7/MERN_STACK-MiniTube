import apiClient from "../axios.config";

// ==================== TOGGLE SUBSCRIBE ====================
export const toggleSubscribe = async (channelId) => {
  try {
    const response = await apiClient.post(
      `/subs/toggle-subscribe/${channelId}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== GET MY SUBSCRIBERS ====================
export const getMySubscribers = async (channelId) => {
  try {
    const response = await apiClient.get(
      `/subs/get-my-subbed-channel/${channelId}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== GET CHANNELS I SUBSCRIBED TO ====================
export const getMySubscriptions = async () => {
  try {
    const response = await apiClient.get("/subs/get-me-subbed-channel");
    return response;
  } catch (err) {
    throw err;
  }
};
