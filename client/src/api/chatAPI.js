import { apiClient } from "./apiClient";
import { userAPI } from "./userAPI";

export const chatAPI = {
  getMessageHistory: async (userId, params = {}) => {
    try {
      if (!userId) throw new Error("User ID is required");

      // Set default pagination parameters if not provided
      const defaultParams = {
        page: 1,
        limit: 50,
        ...params,
      };

      const response = await apiClient.get(`/chat/messages/${userId}`, {
        params: defaultParams,
      });

      // Extract messages from the response
      const messages =
        response?.data?.messages || response?.data?.data?.messages || [];

      return {
        data: {
          messages,
          hasMore: messages.length === defaultParams.limit,
          page: defaultParams.page,
        },
      };
    } catch (error) {
      console.error("Error fetching message history:", error);
      throw error;
    }
  },

  sendMessage: async (recipientId, content) => {
    try {
      if (!recipientId) throw new Error("Recipient ID is required");
      if (!content || !content.trim())
        throw new Error("Message content is required");

      const response = await apiClient.post("/chat/send", {
        recipientId,
        content: content.trim(),
      });

      return {
        data: response?.data?.data?.message || response?.data?.message,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  markAsRead: async (messageId) => {
    try {
      if (!messageId) throw new Error("Message ID is required");
      const response = await apiClient.put(`/chat/messages/${messageId}/read`);
      return {
        data: response?.data?.data?.message || response?.data?.message,
      };
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiClient.get("/chat/unread");
      // Handle different response formats
      const count =
        response?.data?.count ||
        response?.count ||
        (response?.data?.data && response.data.data.count) ||
        0;

      return {
        data: {
          count: count,
        },
      };
    } catch (error) {
      console.error("Error getting unread count:", error);
      return {
        data: {
          count: 0,
        },
      };
    }
  },

  getUserInfo: async (userId) => {
    try {
      if (!userId) throw new Error("User ID is required");
      const user = await userAPI.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return { data: user };
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  },

  getConversations: async () => {
    try {
      // Get current user first
      const currentUser = await userAPI.getProfile();

      // Get chat users with their last messages and unread counts
      const response = await apiClient.get("/chat/users");

      // Extract users directly from the response data
      const users = response?.data?.users || [];

      // Transform the users data into conversations format
      const conversations = users.map((user) => ({
        _id: `chat_${user._id}`,
        participants: [currentUser, user],
        lastMessage: user.lastMessage
          ? {
              _id: Date.now().toString(), // Temporary ID if not provided
              content: user.lastMessage.content,
              createdAt: user.lastMessage.createdAt,
              sender: user.lastMessage.isFromUser ? currentUser : user,
              recipient: user.lastMessage.isFromUser ? user : currentUser,
            }
          : null,
        updatedAt: user.lastMessage?.createdAt || new Date().toISOString(),
        unreadCount: user.unreadCount || 0,
      }));

      return { data: { conversations } };
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return { data: { conversations: [] } };
    }
  },
};
