import apiClient from "../axios.config";

// ==================== REGISTER ====================
export const register = async (userData) => {
  try {
    const formData = new FormData();

    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("fullName", userData.fullName);

    if (userData.avatar) {
      formData.append("avatar", userData.avatar);
    }
    if (userData.coverImage) {
      formData.append("coverImage", userData.coverImage);
    }

    const response = await apiClient.post("/users/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Response from backend: just the user object (no tokens)
    // Axios interceptor unwraps response.data, so response = createdUser
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== LOGIN ====================
export const login = async (credentials) => {
  try {
    const response = await apiClient.post("/users/login", credentials);

    // Response structure: { statusCode, data: { user, accessToken, refreshToken }, message, success }
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  } catch (err) {
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

// ==================== GET WATCH HISTORY ====================
export const getWatchHistory = async () => {
  try {
    const response = await apiClient.get("/users/watch-history");
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== UPDATE USER DETAILS ====================
export const updateUserDetails = async (userData) => {
  try {
    const response = await apiClient.post("/users/update-detail", userData);
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== UPDATE PASSWORD ====================
export const updatePassword = async (passwordData) => {
  try {
    const response = await apiClient.patch(
      "/users/update-password",
      passwordData
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== UPDATE AVATAR ====================
export const updateAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await apiClient.patch("/users/update-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

// ==================== UPDATE COVER IMAGE ====================
export const updateCoverImage = async (coverImageFile) => {
  try {
    const formData = new FormData();
    formData.append("coverImage", coverImageFile);

    const response = await apiClient.patch(
      "/users/update-coverImage",
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
