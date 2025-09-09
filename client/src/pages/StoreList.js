import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storeAPI, ratingAPI } from '../services/api';
import RatingStars from '../components/common/RatingStars';

const StoreList = () => {
  const { hasRole } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getAllStores();
      console.log("📦 storeAPI response:", response.data);
      const { stores } = response.data;
      // Map through stores to ensure proper data structure
      const formattedStores = stores.map(store => ({
        ...store,
        average_rating: store.average_rating || 0,
        total_ratings: store.total_ratings || 0,
        user_rating: store.user_rating || null
      }));
      setStores(formattedStores);
    } catch (error) {
      console.error('Failed to load stores:', error);
      setError('Failed to load stores. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (storeId, rating) => {
    try {
      await ratingAPI.rateStore(storeId, rating);
      
      // Get the updated store data to reflect new rating
      const storeResponse = await storeAPI.getStoreById(storeId);
      
      // Update the stores state with the new rating
      setStores(prevStores => prevStores.map(store => 
        store.id === storeId 
          ? {
              ...store,
              average_rating: storeResponse.data.store.average_rating,
              total_ratings: storeResponse.data.store.total_ratings,
              user_rating: rating
            }
          : store
      ));
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setError('Failed to submit rating. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading stores...</p>
      </div>
    );
  }

  return (
    <div className="store-list-page">
      <div className="page-header">
        <h1>Browse Stores</h1>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadStores} className="btn btn-primary">
            Retry
          </button>
        </div>
      )}
      <div className="stores-grid">
        {stores.map ((store) => (
          <div key={store.id} className="store-card card">
            <div className="store-header">
              <h3 className="store-name">{store.name}</h3>
              <div className="store-rating">
                <RatingStars
                  rating={store.average_rating || 0}
                  size="medium"
                />
                <span className="rating-count">
                  ({store.total_ratings || 0})
                </span>
              </div>
            </div>

            <div className="store-details">
              <p className="store-address">
                <span className="icon">📍</span>
                {store.address}
              </p>
              <p className="store-email">
                <span className="icon">✉️</span>
                {store.email}
              </p>
            </div>

            {hasRole('user') && (
              <div className="store-rating-section">
                <div className="user-rating">
                  {store.user_rating ? (
                    <>
                      <span>Your Rating:</span>
                      <RatingStars rating={store.user_rating} size="small" />
                    </>
                  ) : (
                    <span>Not rated yet</span>
                  )}
                </div>

                <div className="rating-input">
                  <RatingStars
                    rating={store.user_rating || 0}
                    size="large"
                    interactive={true}
                    onRatingChange={(rating) => {
                      handleRating(store.id, rating);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {stores.length === 0 && !error && (
        <div className="no-stores-message">
          <p>No stores found.</p>
        </div>
      )}
    </div>
  );
};

export default StoreList;
