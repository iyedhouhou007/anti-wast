// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-subtitle">Page not found</p>
        <p className="not-found-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="not-found-link"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}