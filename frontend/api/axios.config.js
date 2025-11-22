import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config);
      } catch (refreshError) {
        console.error("Token refresh failed!");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
