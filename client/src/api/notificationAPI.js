import { apiClient } from "./apiClient";

export const notificationAPI = {
  getNotifications: async () => {
    return apiClient.get("/notifications");
  },

  markAsRead: async (notificationId) => {
    return apiClient.put(`/notifications/${notificationId}/mark-read`);
  },

  markAllAsRead: async () => {
    return apiClient.put("/notifications/mark-all-read");
  },

  getUnreadCount: async () => {
    return apiClient.get("/notifications/unread-count");
  },
};
