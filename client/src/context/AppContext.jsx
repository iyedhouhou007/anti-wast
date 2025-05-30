import { createContext, useContext, useState, useEffect } from "react";
import { socketService } from "../api/socketService";
import { userAPI } from "../api/userAPI";
import { notificationAPI } from "../api/notificationAPI";
import { SOCKET_EVENTS } from "../api/socketEvents";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const processApiResponse = (response) => {
    if (response?.data?.data) {
      return response.data.data;
    }
    if (response?.data) {
      return response.data;
    }
    return response;
  };

  const handleApiError = (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An error occurred";
    throw new Error(message);
  };

  const processUserData = (userData) => {
    if (!userData) return null;

    const user = userData.user || userData;

    if (user.avatar && !user.avatar.startsWith("http")) {
      user.avatar = `${import.meta.env.VITE_API_BASE_URL}/${user.avatar}`;
    }

    return user;
  };

  // Initialize user session
  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await userAPI.getProfile();

          if (userData) {
            setUser(processUserData(userData));

            // Load initial notifications and unread messages count
            try {
              const [notificationsData, unreadMessagesData] = await Promise.all(
                [
                  notificationAPI.getNotifications().then(processApiResponse),
                  userAPI.getUnreadMessagesCount(),
                ]
              );

              console.log(
                "Loaded initial unread messages count:",
                unreadMessagesData
              );

              const fetchedNotifications = Array.isArray(notificationsData)
                ? notificationsData
                : notificationsData?.notifications || [];
              setNotifications(fetchedNotifications);

              setUnreadMessages(unreadMessagesData?.count || 0);
              console.log(
                "Set unread messages count to:",
                unreadMessagesData?.count || 0
              );
            } catch (error) {
              console.error("Error loading initial data:", error);
            }
          } else {
            console.warn("No user data returned despite valid token");
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error initializing session:", error);
          if (error.response?.status === 401) {
            console.warn(
              "Token expired or invalid, removing from localStorage"
            );
            localStorage.removeItem("token");
          }
        }
      }
      setLoading(false);
    };

    initializeSession();
  }, []);

  // Handle socket connections and events
  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("User is set but no token found");
      return;
    }

    socketService.connect(token);

    // Chat events
    const messageHandler = (message) => {
      if (message.sender._id !== user._id) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    const messageReadHandler = ({ messageId, readBy }) => {
      if (readBy === user._id) {
        setUnreadMessages((prev) => Math.max(0, prev - 1));
      }
    };

    // Notification events
    const newNotificationHandler = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    const notificationReadHandler = (data) => {
      const notificationId = data.notificationId;
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    };

    const allNotificationsReadHandler = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    // Add event listeners
    const eventHandlers = {
      [SOCKET_EVENTS.CHAT_MESSAGE_NEW]: messageHandler,
      [SOCKET_EVENTS.CHAT_MESSAGE_READ]: messageReadHandler,
      [SOCKET_EVENTS.NOTIFICATION_NEW]: newNotificationHandler,
      [SOCKET_EVENTS.NOTIFICATION_READ]: notificationReadHandler,
      [SOCKET_EVENTS.NOTIFICATION_MARK_ALL_READ]: allNotificationsReadHandler,
    };

    // Register all event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketService.on(event, handler);
    });

    // Cleanup function
    return () => {
      // Unregister all event listeners
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socketService.off(event, handler);
      });
      socketService.disconnect();
    };
  }, [user]);

  const login = async (credentials) => {
    try {
      const response = await userAPI.login(credentials);
      const data = processApiResponse(response);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const userData = processUserData(data);
      setUser(userData);
      return data;
    } catch (error) {
      handleApiError(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setNotifications([]);
    setUnreadMessages(0);
    socketService.disconnect();
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      socketService.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      socketService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await userAPI.register(userData);
      const data = processApiResponse(response);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const processedUserData = processUserData(data);
      setUser(processedUserData);
      return data;
    } catch (error) {
      handleApiError(error);
    }
  };

  const value = {
    user,
    setUser,
    updateUser: (updates) => {
      if (typeof updates === "function") {
        setUser(updates);
      } else {
        setUser((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    },
    loading,
    notifications,
    unreadMessages,
    globalSearchTerm,
    setGlobalSearchTerm,
    login,
    logout,
    register,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
