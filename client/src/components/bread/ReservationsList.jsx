import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { breadAPI } from '../../api/breadAPI';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../LoadingSpinner';
import './ReservationsList.css';

export default function ReservationsList() {
  const { user } = useApp();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await breadAPI.getReservedPosts();
      setReservations(response.data);
    } catch (error) {
      setError(error.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (postId) => {
    try {
      await breadAPI.unreserve(postId);
      setReservations(prev => prev.filter(r => r._id !== postId));
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };

  if (loading) {
    return (
      <div className="reservations-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservations-error">
        <p>{error}</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="reservations-empty">
        <h2 className="reservations-empty-title">No Reservations</h2>
        <p className="reservations-empty-text">
          You haven't reserved any bread posts yet
        </p>
        <Link
          to="/bread"
          className="reservations-browse-link"
        >
          Browse Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <h2 className="reservations-title">Your Reservations</h2>

      <div className="reservations-grid">
        {reservations.map((post) => (
          <div
            key={post._id}
            className="reservation-card"
          >
            {post.images && post.images.length > 0 && (
              <img
                src={post.images[0]}
                alt={post.description}
                className="reservation-image"
              />
            )}

            <div className="reservation-content">
              <div className="reservation-header">
                <div>
                  <h3 className="reservation-title">
                    {post.status} Bread
                  </h3>
                  <p className="reservation-quantity">
                    {post.quantity} {post.quantity_unit}
                  </p>
                </div>
                <span className={`reservation-badge ${
                  post.post_type === 'giveaway'
                    ? 'reservation-badge-giveaway'
                    : 'reservation-badge-request'
                }`}>
                  {post.post_type === 'giveaway' ? 'Giveaway' : 'Request'}
                </span>
              </div>

              <p className="reservation-description">{post.description}</p>

              <div className="reservation-footer">
                <Link
                  to={`/user/${post.user._id}`}
                  className="reservation-user"
                >
                  <img
                    src={post.user.photo_url || '/default-avatar.png'}
                    alt={post.user.username}
                    className="reservation-avatar"
                  />
                  <span>{post.user.username}</span>
                </Link>
                <button
                  onClick={() => handleCancelReservation(post._id)}
                  className="reservation-cancel"
                >
                  Cancel Reservation
                </button>
              </div>

              <div className="reservation-details">
                <Link
                  to={`/posts/${post._id}`}
                  className="reservation-details-link"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}