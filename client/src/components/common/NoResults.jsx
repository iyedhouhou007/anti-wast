import { Link } from 'react-router-dom';
import Button from './Button';
import './NoResults.css';

export default function NoResults({
  title = 'No results found',
  message = 'We could not find what you are looking for.',
  action,
  actionText,
  actionLink
}) {
  return (
    <div className="no-results">
      <svg
        className="no-results-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="no-results-title">{title}</h3>
      <p className="no-results-message">{message}</p>
      {(action || actionLink) && (
        <div className="no-results-action">
          {actionLink ? (
            <Link to={actionLink}>
              <Button variant="primary">{actionText}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={action}>{actionText}</Button>
          )}
        </div>
      )}
    </div>
  );
}