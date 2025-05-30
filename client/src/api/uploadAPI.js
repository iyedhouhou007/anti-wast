import { apiClient } from "./apiClient";

export const uploadAPI = {
  uploadSingleImage: async (image) => {
    const formData = new FormData();
    formData.append("image", image);

    return apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadMultipleImages: async (images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });

    return apiClient.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteImage: async (filename) => {
    return apiClient.delete(`/upload/${filename}`);
  },

  getImageUrl: (filename) => {
    if (!filename) return "/no-image.png";
    return `${import.meta.env.VITE_API_BASE_URL}/uploads/${filename}`;
  },

  // Helper function specifically for avatar URLs
  getAvatarUrl: (user) => {
    if (!user) return "/no-image.png";
    const avatarField = user.photo || user.avatar || user.profilePicture;
    if (!avatarField) return "@no-image.png";
    return `${import.meta.env.VITE_API_BASE_URL}/uploads/${avatarField}`;
  },
};
