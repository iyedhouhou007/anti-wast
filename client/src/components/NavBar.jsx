import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './NavBar.css';

export default function NavBar() {
  const { user, logout, notifications, unreadMessages } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [hamburgerDropdown, setHamburgerDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Navigation button active state
  const isActive = (path) => location.pathname === path;

  // User menu dropdown toggle
  const handleUserClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  // Close dropdowns on outside click
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowUserMenu(false);
    }
  };

  // Detect small screen
  useEffect(() => {
    const handleResize = () => {
      setShowHamburger(window.innerWidth <= 480);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hamburger dropdown handlers
  const handleHamburgerDropdown = (type) => {
    setHamburgerDropdown((prev) => (prev === type ? null : type));
  };

  return (
    <nav className="navbar" tabIndex={-1} onBlur={handleBlur}>
      <div className="navbar-brand">
        <h1 className="navbar-logo">Bread Market</h1>
      </div>
      {showHamburger ? (
        <>
          <button
            className="navbar-hamburger"
            aria-label="Open menu"
            onClick={() => setHamburgerOpen((open) => !open)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {hamburgerOpen && (
            <div className="navbar-hamburger-menu">
              <button
                className={`navbar-button ${isActive('/') ? 'navbar-button-active' : ''}`}
                onClick={() => { navigate('/'); setHamburgerOpen(false); }}
              >
                <span className="material-symbols-outlined navbar-button-icon">home</span>
                Home
              </button>
              <button
                className={`navbar-button ${isActive('/posts/create') ? 'navbar-button-active' : ''}`}
                onClick={() => { navigate('/posts/create'); setHamburgerOpen(false); }}
              >
                <span className="material-symbols-outlined navbar-button-icon">add_circle</span>
                Post Item
              </button>
              <button
                className={`navbar-button ${isActive('/my-posts') ? 'navbar-button-active' : ''}`}
                onClick={() => { navigate('/my-posts'); setHamburgerOpen(false); }}
              >
                <span className="material-symbols-outlined navbar-button-icon">list_alt</span>
                My Posts
              </button>
              <button
                className={`navbar-button ${isActive('/reserved-posts') ? 'navbar-button-active' : ''}`}
                onClick={() => { navigate('/reserved-posts'); setHamburgerOpen(false); }}
              >
                <span className="material-symbols-outlined navbar-button-icon">bookmark</span>
                Reserved Posts
              </button>
              {user && (
                <>
                  <Link 
                    to="/notifications" 
                    className="navbar-icon-button"
                    onClick={() => setHamburgerOpen(false)}
                  >
                      <span className="material-symbols-outlined">notifications</span>
                      {unreadNotifications > 0 && (
                        <span className="navbar-badge">{unreadNotifications}</span>
                      )}
                        </Link>
              <div className="navbar-hamburger-dropdown-wrapper">
                <button className="navbar-icon-button" onClick={() => handleHamburgerDropdown('profile')} tabIndex={0}>
                  <span className="material-symbols-outlined">person</span>
                </button>
                {hamburgerDropdown === 'profile' && (
                  <div className="navbar-dropdown navbar-dropdown-user">
                    <div className="navbar-dropdown-header">{user ? user.username : 'Guest'}</div>
                    {user ? (
                      <>
                        <Link to="/profile" className="navbar-dropdown-item" onClick={()=>{setHamburgerDropdown(null); setHamburgerOpen(false);}}>Profile</Link>
                        <button className="navbar-dropdown-item" onClick={()=>{handleLogout(); setHamburgerDropdown(null); setHamburgerOpen(false);}}>Logout</button>
                      </>
                    ) : (
                      <Link to="/login" className="navbar-dropdown-item" onClick={()=>{setHamburgerDropdown(null); setHamburgerOpen(false);}}>Login</Link>
                    )}
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
      <div className="navbar-actions">
        <button
          className={`navbar-button ${isActive('/') ? 'navbar-button-active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined navbar-button-icon">home</span>
          Home
        </button>
        <button
          className={`navbar-button ${isActive('/posts/create') ? 'navbar-button-active' : ''}`}
          onClick={() => navigate('/posts/create')}
        >
          <span className="material-symbols-outlined navbar-button-icon">add_circle</span>
          Post Item
        </button>
            <button
              className={`navbar-button ${isActive('/my-posts') ? 'navbar-button-active' : ''}`}
              onClick={() => navigate('/my-posts')}
            >
              <span className="material-symbols-outlined navbar-button-icon">list_alt</span>
              My Posts
            </button>
            <button
              className={`navbar-button ${isActive('/reserved-posts') ? 'navbar-button-active' : ''}`}
              onClick={() => navigate('/reserved-posts')}
            >
              <span className="material-symbols-outlined navbar-button-icon">bookmark</span>
              Reserved Posts
            </button>
      </div>
      <div className="navbar-actions-right">
        {user && (
          <>
                <Link 
                  to="/notifications" 
                  className="navbar-icon-button navbar-icon-notification"
                  title="Notifications"
                >
                <span className="material-symbols-outlined">notifications</span>
                {unreadNotifications > 0 && (
                  <span className="navbar-badge">{unreadNotifications}</span>
                )}
                  </Link>
                <Link 
                  to="/messages" 
                  className="navbar-icon-button navbar-icon-messages"
                  title="Messages"
                >
                <span className="material-symbols-outlined">chat</span>
                {unreadMessages > 0 && (
                  <span className="navbar-badge">{unreadMessages}</span>
                )}
                  </Link>
          </>
        )}
        <div className="navbar-dropdown-wrapper">
          <button className="navbar-icon-button navbar-icon-profile" onClick={handleUserClick} tabIndex={0}>
            <span className="material-symbols-outlined">person</span>
          </button>
          {showUserMenu && (
            <div className="navbar-dropdown navbar-dropdown-user">
              <div className="navbar-dropdown-header">{user ? user.username : 'Guest'}</div>
              {user ? (
                <>
                  <Link to="/profile" className="navbar-dropdown-item" onClick={()=>setShowUserMenu(false)}>Profile</Link>
                  <button className="navbar-dropdown-item" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <Link to="/login" className="navbar-dropdown-item" onClick={()=>setShowUserMenu(false)}>Login</Link>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </nav>
  );
}