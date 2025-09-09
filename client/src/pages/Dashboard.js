import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userAPI, storeAPI } from "../services/api";
import PasswordUpdateForm from "../components/forms/PasswordUpdateForm";
import RatingStars from "../components/common/RatingStars";
import './Dashboard.css'

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState(null);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (hasRole("admin")) {
        const response = await userAPI.getStats();
        setStats(response.data.stats);
      } else if (hasRole("store_owner")) {
        const response = await storeAPI.getStoreDashboard();
        setStoreData(response.data);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (passwordData) => {
    setPasswordUpdateLoading(true);
    setPasswordUpdateError(null);
    setPasswordUpdateSuccess(null);

    try {
      (await userAPI.updatePassword)
        ? await userAPI.updatePassword(passwordData)
        : await authAPI.updatePassword(passwordData);
      setPasswordUpdateSuccess("Password updated successfully!");
      setTimeout(() => {
        setShowPasswordUpdate(false);
        setPasswordUpdateSuccess(null);
      }, 2000);
    } catch (error) {
      console.error("Password update error:", error);
      setPasswordUpdateError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update password"
      );
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>
<br></br>
      <div className="dashboard-content">
        {/* User Info Card */}
        <div className="card">
          <div className="card-header">
            <h2>Profile Information</h2>
            <button
              className="btn btn-secondary"
              onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
            >
              {showPasswordUpdate ? "Cancel" : "Change Password"}
            </button>
          </div>
          <div className="card-body">
            {/* User Info */}
            <div className="user-info">
              <div className="info-item">
                <label>Name:</label>
                <span>{user?.name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className={`role-badge role-${user?.role}`}>
                  {user?.role?.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <label>Address:</label>
                <span>{user?.address || "Not provided"}</span>
              </div>
            </div>

            {showPasswordUpdate && (
              <div className="password-update-section">
                <h3>Change Password</h3>
                <PasswordUpdateForm
                  onSubmit={handlePasswordUpdate}
                  loading={passwordUpdateLoading}
                  error={passwordUpdateError}
                  success={passwordUpdateSuccess}
                />
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Admin Statistics */}
          {hasRole("admin") && stats && (
            <>
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <span className="stat-number">{stats.total_users}</span>
                <span className="stat-label">Total Users</span>
              </div>

              <div className="stat-card">
                <span className="stat-icon">🏪</span>
                <span className="stat-number">{stats.total_stores}</span>
                <span className="stat-label">Total Stores</span>
              </div>

              <div className="stat-card">
                <span className="stat-icon">⭐</span>
                <span className="stat-number">{stats.total_ratings}</span>
                <span className="stat-label">Total Ratings</span>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <span className="stat-number">
                  {stats.overall_average_rating?.toFixed(1) || "0.0"}
                </span>
                <span className="stat-label">Average Rating</span>
              </div>
            </>
          )}
        </div>

        {/* Store Owner Dashboard */}
        {hasRole("store_owner") && storeData && (
          <div className="store-dashboard">
            <div className="card">
              <div className="card-header">
                <h2>My Store</h2>
              </div>
              <div className="card-body">
                <div className="store-info">
                  <h3>{storeData.store.name}</h3>
                  <p className="store-address">{storeData.store.address}</p>
                  <div className="store-rating">
                    <RatingStars
                      rating={storeData.store.average_rating || 0}
                      size="large"
                    />
                    <span className="rating-count">
                      ({storeData.store.total_ratings} ratings)
                    </span>
                  </div>
                </div>

                <div className="store-ratings">
                  <h4>Recent Reviews</h4>
                  {storeData.ratings && storeData.ratings.length > 0 ? (
                    <div className="ratings-list">
                      {storeData.ratings.slice(0, 5).map((rating) => (
                        <div key={rating.id} className="rating-item">
                          <div className="rating-header">
                            <span className="user-name">
                              {rating.user_name}
                            </span>
                            <RatingStars rating={rating.rating} size="small" />
                          </div>
                          <div className="rating-date">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No ratings yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Normal User Dashboard */}
        {hasRole("user") && (
          <div className="user-dashboard">
            <div className="card">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="card-body">
                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => (window.location.href = "/stores")}
                  >
                    Browse Stores
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      /* Navigate to ratings */
                    }}
                  >
                    My Ratings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadDashboardData} className="btn btn-primary">
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
