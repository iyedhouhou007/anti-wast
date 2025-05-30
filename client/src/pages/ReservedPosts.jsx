import React, { useEffect, useState, useContext } from 'react';
import BreadItem from '../components/bread/BreadItem';
import { AppContext } from '../context/AppContext';
import breadAPI from '../api/breadAPI';
import PostDetailsModal from '../components/bread/PostDetailsModal';
import './ReservedPosts.css';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'day_old', label: 'Day Old' },
  { value: 'stale', label: 'Stale' },
];

const ReservedPosts = () => {
  const { currentUser } = useContext(AppContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await breadAPI.getReservedPosts();
      let filtered = response.data?.posts || [];
      if (statusFilter !== 'all') {
        filtered = filtered.filter(post => post.status === statusFilter);
      }
      setPosts(filtered);
    } catch (err) {
      // handle error, e.g. toast
    } finally {
      setLoading(false);
    }
  };

  const handleUnreserve = async (postId) => {
    try {
      await breadAPI.cancelReservation(postId);
      fetchPosts();
      // Optionally show a toast
    } catch (err) {
      // handle error, e.g. toast
    }
  };

  const handleViewDetails = (action, post) => {
    if (action === 'viewDetails') {
      setSelectedPost(post);
      // You can show a modal here if you have one
    }
  };

  return (
    <div className="reserved-posts-container">
      <div className="reserved-posts-header">
        <h2>Reserved Posts</h2>
        <select
          className="reserved-posts-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="reserved-posts-loading">Loading reserved posts...</div>
      ) : posts.length === 0 ? (
        <div className="reserved-posts-empty">You haven't reserved any posts yet.</div>
      ) : (
        <div className="reserved-posts-grid">
          {posts.map(post => (
            <div className="reserved-posts-card" key={post._id}>
              <BreadItem
                post={post}
                onUpdate={handleViewDetails}
                onReserve={null}
                onDelete={null}
                onEdit={null}
                hideReserveButton={true}
              />
              <button className="reserved-posts-unreserve-btn" onClick={() => handleUnreserve(post._id)}>
                Cancel Reservation
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedPost && (
        <PostDetailsModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default ReservedPosts; 