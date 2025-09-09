import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/dashboard" className="nav-brand">
          Store Rating System
        </Link>
        
        <div className="nav-links">
          <Link to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          
          <Link to="/stores" 
            className={`nav-link ${isActive('/stores') ? 'active' : ''}`}>
            Stores
          </Link>
          
          {hasRole('admin') && (
            <>
              <Link to="/users" 
                className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
                Users
              </Link>
              <Link to="/manage-stores" 
                className={`nav-link ${isActive('/manage-stores') ? 'active' : ''}`}>
                Manage Stores
              </Link>
            </>
          )}
          
          <div className="nav-user">
            <div className="user-profile">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role?.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
            <div className="user-actions">
              {hasRole('user') && (
                <Link to="/my-ratings" 
                  className={`nav-link ${isActive('/my-ratings') ? 'active' : ''}`}>
                  My Ratings
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
