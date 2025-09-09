import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
