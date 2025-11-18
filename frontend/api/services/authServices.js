import apiClient from "../axios.config";

// ==================== REGISTER ====================
export const register = async (userData) => {
  try {
    const fromData = new FormData();

    fromData.append("username", userData.username);
    fromData.append("email", userData.email);
    fromData.append("password", userData.password);
    fromData.append("fullName", userData.fullName);

    if (userData.avatar) {
      fromData.append("avatar", userData.avatar);
    }
    if (userData.coverImage) {
      fromData.append("coverImage", userData.coverImage);
    }

    const response = await apiClient.post("/users/signup", FormData, {
      header: { "Content-Type": "multipart/from-data" },
    });

    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data;
  } catch (err) {
    console.log("Register Error:", err);
    throw err;
  }
};

// ==================== LOGIN ====================
export const login = async (credentials) => {
  try {
    const response = await apiClient.post("/users/login", credentials);

    // Axios interceptor already unwrapped response.data
    // So response = { user, accessToken, refreshToken }
    const { user, accessToken, refreshToken } = response;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response;
  } catch (err) {
    console.log("Login Error: ", err);
    throw err;
  }
};

// ==================== LOGOUT ====================

export const logout = async () => {
  try {
    await apiClient.post("/users/logout");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    window.location.href = "/login";
  } catch (err) {
    console.log("Logout Error: ", errr);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    window.location.href = "/login";
  }
};

// ==================== GET CURRENT USER ====================

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/users/profile");

    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  } catch (err) {
    console.log("Get user Error: ", err);
    throw err;
  }
};

// ==================== REFRESH TOKEN ====================

export const refreshAccessToken = async () => {
  try {
    const response = await apiClient.post("/user/refresh-token");

    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
  } catch (err) {
    console.log("Refresh Token Error: ", err);
    throw err;
  }
};

// ==================== CHECK IF LOGGED IN ====================
export const isAuthenticated = async () => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");

  return !!(token && user);
};

// ==================== GET USER FROM STORAGE ====================
export const getUserFromStorage = async () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
