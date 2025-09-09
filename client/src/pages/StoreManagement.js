import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import RegisterForm from '../components/forms/RegisterForm';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers(filters);
      setUsers(response.data.users);
      setError(null);
    } catch (error) {
      console.error('Load users error:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (userData) => {
    setAddUserLoading(true);
    setAddUserError(null);

    try {
      await userAPI.createUser(userData);
      setShowAddUser(false);
      loadUsers(); // Reload users list
    } catch (error) {
      console.error('Add user error:', error);
      setAddUserError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to add user'
      );
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Failed to delete user');
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      email: '',
      address: '',
      role: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h1>User Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddUser(true)}
        >
          Add New User
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddUser(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>User Role</label>
                <select className="form-input" id="userRole">
                  <option value="user">Normal User</option>
                  <option value="admin">Administrator</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <RegisterForm
                onSubmit={(data) => handleAddUser({
                  ...data,
                  role: document.getElementById('userRole').value
                })}
                loading={addUserLoading}
                error={addUserError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Filter by email..."
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Filter by address..."
            value={filters.address}
            onChange={(e) => handleFilterChange('address', e.target.value)}
            className="filter-input"
          />
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>
        <button onClick={clearFilters} className="btn btn-secondary">
          Clear Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="table-section">
        {loading && users.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadUsers} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th 
                    onClick={() => handleFilterChange('sortBy', 'name')}
                    className="sortable"
                  >
                    Name {filters.sortBy === 'name' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleFilterChange('sortBy', 'email')}
                    className="sortable"
                  >
                    Email {filters.sortBy === 'email' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th>Address</th>
                  <th 
                    onClick={() => handleFilterChange('sortBy', 'role')}
                    className="sortable"
                  >
                    Role {filters.sortBy === 'role' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address || 'N/A'}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {user.role === 'store_owner' && user.rating !== null && user.rating !== undefined ? 
                        parseFloat(user.rating).toFixed(1) : 'N/A'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="no-results">
                <p>No users found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
