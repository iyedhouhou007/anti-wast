import { Toast } from "../components/common/Toast";
import { SOCKET_EVENTS } from "../api/socketEvents";
import { socketService } from "../api/socketService";
import { formatRelativeTime } from "./dateUtils";

export const NotificationTypes = {
  BREAD_RESERVED: "bread_reserved",
  BREAD_AVAILABLE: "bread_available",
  CHAT_MESSAGE: "chat_message",
  BREAD_EXPIRED: "bread_expired",
  BREAD_COMPLETED: "bread_completed",
};

const notificationConfig = {
  [NotificationTypes.BREAD_RESERVED]: {
    title: "Bread Reserved",
    icon: "🍞",
    autoDismiss: true,
  },
  [NotificationTypes.BREAD_AVAILABLE]: {
    title: "New Bread Available",
    icon: "🥖",
    autoDismiss: true,
  },
  [NotificationTypes.CHAT_MESSAGE]: {
    title: "New Message",
    icon: "💬",
    autoDismiss: true,
  },
  [NotificationTypes.BREAD_EXPIRED]: {
    title: "Bread Expired",
    icon: "⚠️",
    autoDismiss: true,
  },
  [NotificationTypes.BREAD_COMPLETED]: {
    title: "Collection Complete",
    icon: "✅",
    autoDismiss: true,
  },
};

export const handleNotification = (notification) => {
  const config = notificationConfig[notification.type];

  if (!config) return;

  // Format notification message
  const message = formatNotificationMessage(notification);

  // Show toast notification
  Toast.info(`${config.icon} ${message}`);
};

export const formatNotificationMessage = (notification) => {
  const { type, data, createdAt } = notification;

  switch (type) {
    case NotificationTypes.BREAD_RESERVED:
      return `${data.userName} reserved your ${data.breadTitle}`;

    case NotificationTypes.BREAD_AVAILABLE:
      return `${data.userName} posted new bread nearby: ${data.breadTitle}`;

    case NotificationTypes.CHAT_MESSAGE:
      return `New message from ${data.senderName}`;

    case NotificationTypes.BREAD_EXPIRED:
      return `Your bread post "${data.breadTitle}" has expired`;

    case NotificationTypes.BREAD_COMPLETED:
      return `Collection completed for "${data.breadTitle}"`;

    default:
      return notification.message;
  }
};

export const subscribeToNotifications = (userId) => {
  socketService.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNotification);
};

export const unsubscribeFromNotifications = () => {
  socketService.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNotification);
};
