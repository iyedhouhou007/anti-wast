import { apiClient } from "./apiClient";
import { chatAPI } from "./chatAPI";

export const userAPI = {
  register: async (userData) => {
    let response;

    try {
      if (userData instanceof FormData) {
        response = await apiClient.post("/auth/register", userData);
      } else {
        const data = {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          phone_number: userData.phone_number,
          address: userData.address,
          address: userData.address,
        };
        response = await apiClient.post("/auth/register", data);
      }

      if (response?.token) {
        localStorage.setItem("token", response.token);
      }
      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      return response;
      return response;
    } catch (error) {
      console.error("Registration API error:", error.response?.data || error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);

      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      return response;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    localStorage.removeItem("token");
    return response;
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get("/user/me");
      return response?.user || response?.data?.user || response;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      if (!userId) throw new Error("User ID is required");

      // Get users from chat endpoint which includes user details
      const response = await apiClient.get("/chat/users");
      let chatUsers = [];

      if (response?.data?.users) {
        chatUsers = response.data.users;
      } else if (response?.users) {
        chatUsers = response.users;
      } else if (Array.isArray(response)) {
        chatUsers = response;
      }

      // Find the specific user
      const user = chatUsers.find((u) => u._id === userId);

      if (!user) {
        // If user not found in chat users, try getting from all users
        const allUsersResponse = await apiClient.get("/user/all");
        let allUsers = [];

        if (allUsersResponse?.data?.users) {
          allUsers = allUsersResponse.data.users;
        } else if (allUsersResponse?.users) {
          allUsers = allUsersResponse.users;
        } else if (Array.isArray(allUsersResponse)) {
          allUsers = allUsersResponse;
        }

        const userFromAll = allUsers.find((u) => u._id === userId);
        if (!userFromAll) {
          throw new Error("User not found");
          throw new Error("User not found");
        }
        return userFromAll;
      }

      return user;
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw error;
    }
  },

  updateProfile: async (updateData) => {
    try {
      // Map frontend field names to match exactly what backend expects
      const requestBody = {};

      // Backend expects 'name' instead of 'username'
      if (updateData.username !== undefined) {
        requestBody.name = updateData.username;
      }

      // Email field name matches
      if (updateData.email !== undefined) {
        requestBody.email = updateData.email;
      }

      // Backend expects 'phone_number' instead of 'phone'
      if (updateData.phone !== undefined) {
        requestBody.phone_number = updateData.phone;
      }

      // Backend expects 'photo_url' for photos
      if (updateData.photo_url !== undefined) {
        requestBody.photo_url = updateData.photo_url;
      }

      const response = await apiClient.put("/user/profile", requestBody);

      // Extract user data from response
      const serverUserData =
        response?.data?.user || response?.user || response?.data || response;

      if (!serverUserData) {
        throw new Error("No user data received from server");
      }

      // Map the server response back to frontend field names
      const mappedUserData = {
        ...serverUserData,
        username: serverUserData.name || serverUserData.username,
        phone: serverUserData.phone_number || serverUserData.phone,
        photo: serverUserData.photo_url || serverUserData.photo,
        // Preserve other fields
        _id: serverUserData._id,
        email: serverUserData.email,
        createdAt: serverUserData.createdAt,
        location: serverUserData.location,
      };

      return mappedUserData;
    } catch (error) {
      console.error("Profile update error:", {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  updateProfilePhoto: async (photoUrl) => {
    try {
      const response = await apiClient.put("/user/profile", {
        photo_url: photoUrl,
      });
      return response?.data?.user || response?.data || response;
    } catch (error) {
      console.error("Error updating profile photo:", error);
      throw error;
    }
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    return apiClient.put("/user/password", {
      currentPassword,
      newPassword,
    });
  },

  searchUsers: async (query) => {
    return apiClient.get("/user/search", {
      params: { q: query },
    });
  },

  requestPasswordReset: async (email) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token, newPassword) => {
    return apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
  },

  verifyEmail: async (token) => {
    return apiClient.post("/auth/verify-email", { token });
  },

  getUnreadMessagesCount: async () => {
    try {
      const response = await chatAPI.getUnreadCount();
      // Make sure we return the count in the expected format
      return {
        count: response?.data?.count || 0,
      };
    } catch (error) {
      console.error("Error getting unread messages count:", error);
      return { count: 0 };
    }
  },
};
