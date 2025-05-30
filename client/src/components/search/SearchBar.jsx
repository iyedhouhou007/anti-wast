// src/components/search/SearchBar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchBar.css';

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(5); // 5km default radius
  const [filters, setFilters] = useState({
    status: '',
    post_type: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('q', searchTerm);
    if (radius) params.append('radius', radius);
    if (filters.status) params.append('status', filters.status);
    if (filters.post_type) params.append('post_type', filters.post_type);

    navigate(`/search?${params.toString()}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} className="search-bar-form">
        <div className="search-bar-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bread posts..."
            className="search-bar-input"
          />
          <svg
            className="search-bar-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="search-bar-filter-button"
        >
          <svg
            className="search-bar-filter-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>

        <button
          type="submit"
          className="search-bar-submit"
        >
          Search
        </button>
      </form>

      {showFilters && (
        <div className="search-bar-filters">
          <div className="search-bar-filters-grid">
            <div className="search-bar-filter-group">
              <label className="search-bar-filter-label">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="search-bar-select"
              >
                <option value="">All</option>
                <option value="fresh">Fresh</option>
                <option value="day_old">Day Old</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="search-bar-filter-group">
              <label className="search-bar-filter-label">
                Type
              </label>
              <select
                name="post_type"
                value={filters.post_type}
                onChange={handleFilterChange}
                className="search-bar-select"
              >
                <option value="">All</option>
                <option value="giveaway">Giveaway</option>
                <option value="request">Requests</option>
              </select>
            </div>

            <div className="search-bar-filter-group" style={{ gridColumn: 'span 2' }}>
              <label className="search-bar-range-label">
                Search Radius: {radius}km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="search-bar-range"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
