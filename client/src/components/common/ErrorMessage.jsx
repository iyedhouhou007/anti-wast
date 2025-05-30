import './ErrorMessage.css';

export default function ErrorMessage({ error }) {
  if (!error) return null;

  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error.message) {
    message = error.message;
  } else if (error.errors) {
    message = Object.values(error.errors).join(', ');
  } else {
    message = 'An error occurred';
  }

  return (
    <div className="error-message">
      <div className="error-message-container">
        <div className="error-message-icon-container">
          <svg
            className="error-message-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="error-message-content">
          <p className="error-message-text">{message}</p>
        </div>
      </div>
    </div>
  );
}