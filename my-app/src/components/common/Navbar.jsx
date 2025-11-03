// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; 

// Placeholder Icon (NotificationIcon remains the same)
const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

function Navbar() {
  // --- New State for Search ---
  const [searchTerm, setSearchTerm] = useState('');
  // State for the dropdown: default is 'users'
  const [searchCategory, setSearchCategory] = useState('users'); 
  // ----------------------------
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // --- Search Submission Handler (MODIFIED) ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchTerm.trim();
    
    if (trimmedQuery) {
      // Navigate to the SearchPage, using the selected category and query
      navigate(`/search?cat=${searchCategory}&q=${trimmedQuery}`);
      setSearchTerm('');
    }
  };
  // ------------------------------------

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">WorkVerse</Link>
      </div>
      
      {/* --- Search Form (Functional, Only visible when logged in) --- */}
      {currentUser && (
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          
          {/* NEW DROPDOWN SELECT */}
          <select 
            value={searchCategory} 
            onChange={(e) => setSearchCategory(e.target.value)}
            className="search-category-select"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px', background: '#f5f5f5', marginRight: '-1px' }}
          >
            <option value="users">Users</option>
            <option value="posts">Posts</option>
            <option value="hashtags">Hashtags</option>
          </select>
          {/* END NEW DROPDOWN */}

          <input 
            type="search" 
            placeholder={`Search ${searchCategory}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '200px', borderRadius: '0 4px 4px 0' }}
          />
          <button type="submit" className="search-button" style={{display: 'none'}}>
            Search
          </button>
        </form>
      )}
      {/* ----------------------------------------------------------------- */}
      
      <div className="navbar-links">
        {currentUser ? (
          // ... LOGGED IN LINKS (Profile, Logout, etc. - UNCHANGED) ...
          <>
            <button 
              className="navbar-icon-button" 
              onClick={toggleNotifications}
              title="Notifications"
            >
              <NotificationIcon />
              {showNotifications && (
                <div className="notification-dropdown">
                  <p>Notifications coming soon!</p>
                </div>
              )}
            </button>

            <Link 
              to={`/profile/${currentUser.userId}`}
              className="navbar-button"
            >
              Profile
            </Link>
            <button onClick={handleLogout} className="navbar-button-logout">
              Logout
            </button>
          </>
        ) : (
          // --- User is LOGGED OUT (UNCHANGED) ---
          <>
            <Link to="/login" className="navbar-button">Login</Link>
            <Link to="/register" className="navbar-button" style={{backgroundColor: 'var(--secondary-teal)'}}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;