import { formatDistanceToNow } from 'date-fns';
import './TimeAgo.css';

export default function TimeAgo({ date, className = '' }) {
  if (!date) return null;

  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });

  return (
    <time dateTime={date} className={`time-ago ${className}`}>
      {timeAgo}
    </time>
  );
}