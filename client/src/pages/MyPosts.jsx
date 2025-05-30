import React, { useEffect, useState, useContext } from 'react';
import BreadItem from '../components/bread/BreadItem';
import { AppContext } from '../context/AppContext';
import breadAPI from '../api/breadAPI';
import './MyPosts.css';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'day_old', label: 'Day Old' },
  { value: 'stale', label: 'Stale' },
];
const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'giveaway', label: 'Giveaway' },
  { value: 'request', label: 'Request' },
];

const MyPosts = () => {
  const { user } = useContext(AppContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [statusFilter, typeFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.post_type = typeFilter;
      const response = await breadAPI.getUserPosts(params);
      // Handle different response structures
      const postsData = response?.data?.data?.posts || response?.data?.posts || [];
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching posts:', err);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post) => {
    try {
      await breadAPI.deletePost(post._id);
      fetchPosts();
      // Optionally show a toast
    } catch (err) {
      // handle error, e.g. toast
    }
  };

  return (
    <div className="my-posts-container">
      <div className="my-posts-header">
        <h2>My Posts</h2>
        <div className="my-posts-filters">
          <select
            className="my-posts-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="my-posts-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="my-posts-loading">Loading your posts...</div>
      ) : posts.length === 0 ? (
        <div className="my-posts-empty">You haven't created any posts yet.</div>
      ) : (
        <div className="my-posts-grid">
          {posts.map(post => (
            <div className="my-posts-card" key={post._id}>
              <BreadItem
                post={post}
                onDelete={handleDelete}
                onEdit={() => {}}
                onUpdate={() => {}}
                onReserve={null}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;