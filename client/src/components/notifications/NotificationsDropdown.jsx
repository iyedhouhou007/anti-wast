import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationAPI } from "../../api/notificationAPI";
import { socketService } from "../../api/socketService";
import { useApp } from "../../context/AppContext";
import "./NotificationsDropdown.css";

export default function NotificationsDropdown() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotificationCount();

    // Setup socket listeners for real-time notifications
    socketService.onNewNotification(() => {
      setUnreadCount(prev => prev + 1);
    });

    socketService.onNotificationRead(() => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
  }, []);

  const loadNotificationCount = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      const data = response?.data?.data || response?.data || response;
      const notifications = Array.isArray(data) ? data : data?.notifications || [];
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading notifications count:", error);
    }
  };

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
      <button
      onClick={handleClick}
      className="notifications-button"
      aria-label="Notifications"
      >
      <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
        <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>
  );
}
