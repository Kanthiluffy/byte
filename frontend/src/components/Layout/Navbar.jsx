import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserDropdown(false);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          CodeJudge
        </Link>
        
        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <div className="nav-links">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActiveLink('/dashboard') ? 'active' : ''}`}
                >
                  <span>📊</span>
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActiveLink('/admin') ? 'active' : ''}`}
                  >
                    <span>⚙️</span>
                    Admin
                  </Link>
                )}
              </div>
              
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <div className="user-avatar">
                    {getUserInitials(user?.name)}
                  </div>
                  <span className="user-name">{user?.name}</span>
                  <span style={{ transform: showUserDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </button>
                
                <div className={`user-dropdown ${showUserDropdown ? 'show' : ''}`}>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                    <span>👤</span>
                    Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                    <span>⚙️</span>
                    Settings
                  </Link>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
                  <button onClick={handleLogout} className="dropdown-item danger">
                    <span>🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Get Started
              </Link>
            </div>          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
