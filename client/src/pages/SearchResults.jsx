// src/pages/SearchResults.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { breadAPI } from '../api/breadAPI';
import { userAPI } from '../api/userAPI';
import BreadListing from '../components/bread/BreadListing';
import LoadingSpinner from '../components/LoadingSpinner';
import './SearchResults.css';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({
    posts: [],
    users: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  useEffect(() => {
    performSearch();
  }, [query, type]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const [postsResponse, usersResponse] = await Promise.all([
        type !== 'users' ? breadAPI.searchPosts({ query }) : Promise.resolve([]),
        type !== 'posts' ? userAPI.searchUsers(query) : Promise.resolve([])
      ]);

      setResults({
        posts: postsResponse || [],
        users: usersResponse || []
      });
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="search-results-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="search-results">
      <h1 className="search-results-title">
        Search Results for "{query}"
      </h1>

      {error && (
        <div className="search-results-error">
          <p className="search-results-error-text">{error}</p>
        </div>
      )}

      <div className="search-results-tabs">
        <button
          className={`search-results-tab ${
            activeTab === 'posts' ? 'search-results-tab-active' : ''
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({results.posts.length})
        </button>
        <button
          className={`search-results-tab ${
            activeTab === 'users' ? 'search-results-tab-active' : ''
          }`}
          onClick={() => setActiveTab('users')}
        >
          Users ({results.users.length})
        </button>
      </div>

      {activeTab === 'posts' ? (
        results.posts.length === 0 ? (
          <p className="search-results-empty">No posts found</p>
        ) : (
          <div className="search-results-grid">
            <BreadListing posts={results.posts} onUpdate={performSearch} />
          </div>
        )
      ) : (
        results.users.length === 0 ? (
          <p className="search-results-empty">No users found</p>
        ) : (
          <div className="search-results-grid">
            {results.users.map((user) => (
              <div
                key={user._id}
                className="search-results-user-card"
              >
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username}
                  className="search-results-user-avatar"
                />
                <div className="search-results-user-info">
                  <h3 className="search-results-username">{user.username}</h3>
                  {user.phone && (
                    <p className="search-results-user-phone">{user.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
