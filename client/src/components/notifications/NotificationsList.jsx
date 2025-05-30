import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useApp } from "../../context/AppContext";
import { notificationAPI } from "../../api/notificationAPI";
import { socketService } from "../../api/socketService";
import LoadingSpinner from "../LoadingSpinner";
import "./NotificationsList.css";

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();

    // Setup socket listeners for real-time notifications
    socketService.onNewNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socketService.onNotificationRead((notificationId) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    });
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();

      const data = response?.data?.data || response?.data || response;

      const fetchedNotifications = Array.isArray(data)
        ? data
        : data?.notifications || [];

      setNotifications(fetchedNotifications);
      setError(null);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError(error.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      socketService.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => {
          if (n._id === notificationId) {
            return { ...n, read: true };
          }
          return n;
        })
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.message || "Failed to mark all notifications as read");
    }
  };

  const getNotificationContent = (notification) => {
    const username =
      notification.sender?.username ||
      notification.user?.username ||
      "Anonymous";

    switch (notification.type) {
      case "post_reserved":
        return {
          icon: "🔒",
          link: `/bread/${notification.post?._id}`,
          action: `${username} reserved your post`,
          title: "Post Reserved",
        };
      case "reservation_cancelled":
        return {
          icon: "🔓",
          link: `/bread/${notification.post?._id}`,
          action: `${username} cancelled their reservation`,
          title: "Reservation Cancelled",
        };
      case "new_message":
        return {
          icon: "💬",
          link: "/messages",
          action: `${username} sent you a message`,
          title: "New Message",
        };
      case "post_completed":
        return {
          icon: "✅",
          link: `/bread/${notification.post?._id}`,
          action: `${username} marked the exchange as completed`,
          title: "Exchange Completed",
        };
      default:
        return {
          icon: "📢",
          link: "#",
          action: `${username} interacted with your post`,
          title: "New Activity",
        };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-list">
        <div className="notifications-list-header">
          <h1 className="notifications-list-title">Notifications</h1>
        </div>
        <div className="notifications-list-loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-list">
        <div className="notifications-list-header">
          <h1 className="notifications-list-title">Notifications</h1>
        </div>
        <div className="notifications-list-error">
          <p className="notifications-list-error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-list">
      <div className="notifications-list-header">
        <h1 className="notifications-list-title">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="notifications-list-mark-all"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-list-empty">
          <div className="notifications-list-empty-icon">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "inherit" }}
            >
              notifications
            </span>
          </div>
          <h2 className="notifications-list-empty-text">
            No notifications yet
          </h2>
          <p className="notifications-list-empty-subtext">
            We'll notify you when something important happens in your
            bread-sharing journey!
          </p>
        </div>
      ) : (
        <div className="notifications-list-items">
          {notifications.map((notification) => {
            const { icon, link, action, title } =
              getNotificationContent(notification);
            const timeAgo = formatDistanceToNow(
              new Date(notification.createdAt),
              { addSuffix: true }
            );
            const username =
              notification.sender?.username ||
              notification.user?.username ||
              "Anonymous";

            return (
              <div
                key={notification._id}
                className={`notification-item ${
                  !notification.read ? "notification-item-unread" : ""
                } type-${notification.type}`}
                onClick={() =>
                  !notification.read && handleMarkAsRead(notification._id)
                }
              >
                <div className="notification-item-content">
                  <div className="notification-item-icon">{icon}</div>
                  <div className="notification-item-details">
                    <div className="notification-item-title">{title}</div>
                    <Link
                      to={link}
                      className="notification-item-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="notification-item-username">
                        {username}
                      </span>{" "}
                      {action.replace(username, "")}
                    </Link>
                    {notification.message && (
                      <p className="notification-item-message">
                        {notification.message}
                      </p>
                    )}
                    <div className="notification-item-time">{timeAgo}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
