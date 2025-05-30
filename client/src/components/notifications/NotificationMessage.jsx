import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import './NotificationMessage.css';

export default function NotificationMessage({ notification, onMarkAsRead }) {
  const getNotificationContent = () => {
    const username = notification.sender?.username || notification.user?.username || 'Anonymous';
    
    switch (notification.type) {
      case 'post_reserved':
        return {
          icon: '🔒',
          link: `/bread/${notification.post?._id}`,
          action: `${username} reserved your post`,
          title: 'Post Reserved'
        };
      case 'reservation_cancelled':
        return {
          icon: '🔓',
          link: `/bread/${notification.post?._id}`,
          action: `${username} cancelled their reservation`,
          title: 'Reservation Cancelled'
        };
      case 'new_message':
        return {
          icon: '💬',
          link: '/messages',
          action: `${username} sent you a message`,
          title: 'New Message'
        };
      case 'post_completed':
        return {
          icon: '✅',
          link: `/bread/${notification.post?._id}`,
          action: `${username} marked the exchange as completed`,
          title: 'Exchange Completed'
        };
      default:
        return {
          icon: '📢',
          link: '#',
          action: `${username} interacted with your post`,
          title: 'New Activity'
        };
    }
  };

  const { icon, link, action, title } = getNotificationContent();
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className={`notification-message ${!notification.read ? 'unread' : ''}`}
      onClick={() => onMarkAsRead && onMarkAsRead(notification._id)}
    >
      <div className="notification-icon">{icon}</div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <Link to={link} className="notification-action" onClick={(e) => e.stopPropagation()}>
          {action}
            </Link>
          {notification.message && (
            <p className="notification-message-text">{notification.message}</p>
          )}
        <div className="notification-time">{timeAgo}</div>
      </div>
    </div>
  );
}