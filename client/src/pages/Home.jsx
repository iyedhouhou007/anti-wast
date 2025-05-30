import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { breadAPI } from "../api/breadAPI";
import BreadListing from "../components/bread/BreadListing";
import LoadingSpinner from "../components/LoadingSpinner";
import FilterSection from "../components/FilterSection";
import "./Home.css";

export default function Home() {
  const { user } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    post_type: "",
    province: "",
    radius: 50, // Default radius in kilometers
  });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          loadPosts(location);
        },
        () => {
          loadPosts();
        }
      );
    } else {
      loadPosts();
    }
    // eslint-disable-next-line
  }, []);

  const loadPosts = async (location = null) => {
    try {
      setLoading(true);
      setError(null);

      // Create a clean copy of filters without empty values
      const searchFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      // Add location if available
      if (location) {
        searchFilters.location = {
          type: "Point",
          coordinates: [location.lng, location.lat],
        };
        if (filters.radius) {
          searchFilters.maxDistance = filters.radius * 1000; // Convert km to meters
        }
      }

      const response = await breadAPI.searchPosts(searchFilters);
      const postsData = response?.data?.posts || response?.posts || [];

      if (Array.isArray(postsData)) {
        setPosts(postsData);
      } else {
        console.error("Invalid posts data:", postsData);
        setError("Failed to load posts: Invalid data format");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      setError(error.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (action, post) => {
    if (action === "deleted") {
      setPosts((currentPosts) =>
        currentPosts.filter((p) => p._id !== post._id)
      );
    } else if (action === "refresh") {
      loadPosts(userLocation);
    } else if (action === 'reserved' || action === 'unreserved') {
      // Update the post in the current posts list
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p._id === post._id ? post : p
        )
      );
    }
  };

  const handleFilterApply = (cleanFilters) => {
    // Update filters state with clean values
    setFilters((prev) => ({
      ...prev,
      ...cleanFilters,
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
    // Load posts with current location
    loadPosts(userLocation);
  };

  const handleFilterReset = () => {
    const resetFilters = {
      status: "",
      post_type: "",
      province: "",
      radius: 50,
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadPosts(userLocation);
  };

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home home-bg">
      <div className="home-header modern-header">
        <h1 className="home-title">Available Bread</h1>
        <Link to="/posts/create" className="home-create-button modern-btn">
          <span className="material-symbols-outlined">add_circle</span>
          Create Post
        </Link>
      </div>

      <FilterSection
        filters={filters}
        setFilters={setFilters}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        animated
      />

      {error && (
        <div className="home-error">
          <p className="home-error-text">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="home-posts-loading">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="home-posts-error">{error}</div>
      ) : posts.length === 0 ? (
        <div className="home-posts-empty">
          <span className="material-symbols-outlined home-posts-empty-icon">
            search_off
          </span>
          <p>No posts found matching your criteria</p>
          <p className="home-posts-empty-subtitle">
            Try adjusting your filters or search for something else
          </p>
        </div>
      ) : (
        <div className="home-posts-grid">
          <BreadListing posts={paginatedPosts} onUpdate={handlePostUpdate} />
        </div>
      )}

      {totalPages > 1 && (
        <div className="home-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`home-pagination-btn${
                page === currentPage ? " home-pagination-btn-active" : ""
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
