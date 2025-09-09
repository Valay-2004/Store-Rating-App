import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../services/api';
import RatingStars from '../components/common/RatingStars';
import './MyRatings.css';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getUserRatings();
      setRatings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load ratings:', error);
      setError('Failed to load your ratings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRating = async (ratingId, newRating) => {
    try {
      await ratingAPI.updateRating(ratingId, newRating);
      await loadRatings(); // Reload ratings to get the updated list
    } catch (error) {
      console.error('Failed to update rating:', error);
      setError('Failed to update rating. Please try again later.');
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (window.confirm('Are you sure you want to delete this rating?')) {
      try {
        await ratingAPI.deleteRating(ratingId);
        await loadRatings(); // Reload ratings to get the updated list
      } catch (error) {
        console.error('Failed to delete rating:', error);
        setError('Failed to delete rating. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your ratings...</p>
      </div>
    );
  }

  return (
    <div className="my-ratings-page">
      <div className="page-header">
        <h1>My Ratings</h1>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadRatings} className="btn btn-primary">
            Retry
          </button>
        </div>
      )}

      <div className="ratings-grid">
        {ratings.map((rating) => (
          <div key={rating.id} className="rating-card card">
            <div className="store-info">
              <h3>{rating.store_name}</h3>
              <p className="store-address">
                <span className="icon">📍</span>
                {rating.store_address}
              </p>
            </div>

            <div className="rating-info">
              <div className="rating-date">
                Rated on: {new Date(rating.created_at).toLocaleDateString()}
              </div>
              <div className="rating-stars">
                <RatingStars
                  rating={rating.rating}
                  size="large"
                  interactive={true}
                  onRatingChange={(newRating) => handleUpdateRating(rating.id, newRating)}
                />
              </div>
            </div>

            <div className="rating-actions">
              <button
                onClick={() => handleDeleteRating(rating.id)}
                className="btn btn-danger btn-sm"
              >
                Delete Rating
              </button>
            </div>
          </div>
        ))}
      </div>

      {ratings.length === 0 && !error && (
        <div className="no-ratings-message">
          <p>You haven't rated any stores yet.</p>
          <button
            onClick={() => window.location.href = '/stores'}
            className="btn btn-primary"
          >
            Browse Stores
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRatings;
