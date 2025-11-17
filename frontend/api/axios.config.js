import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:800/api/v1",
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request: ", config.method, config.url);
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
          "http://localhost:8000/api/v1/refresh-token",
          {},
          { withCredentials: true }
        );

        const newToken = response.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        error.config.header.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config);
      } catch (refreshError) {
        console.error("Token refresh failed!");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    console.log("Response Error: ", error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
