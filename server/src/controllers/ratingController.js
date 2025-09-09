const Rating = require('../models/Rating');
const Store = require('../models/Store');

// Submit or update rating
const submitRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found' 
      });
    }

    // Create or update rating
    const ratingRecord = await Rating.create({
      user_id: userId,
      store_id: parseInt(storeId),
      rating: parseInt(rating)
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: {
        id: ratingRecord.id,
        user_id: ratingRecord.user_id,
        store_id: ratingRecord.store_id,
        rating: ratingRecord.rating,
        created_at: ratingRecord.created_at,
        updated_at: ratingRecord.updated_at
      }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to submit rating' 
    });
  }
};

// Get user's rating for a specific store
const getUserStoreRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found' 
      });
    }

    // Get user's rating for this store
    const rating = await Rating.findByUserAndStore(userId, storeId);

    if (!rating) {
      return res.status(404).json({ 
        error: 'Rating not found',
        message: 'You have not rated this store yet' 
      });
    }

    res.json({
      rating: {
        id: rating.id,
        user_id: rating.user_id,
        store_id: rating.store_id,
        rating: rating.rating,
        created_at: rating.created_at,
        updated_at: rating.updated_at
      }
    });
  } catch (error) {
    console.error('Get user store rating error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get rating' 
    });
  }
};

// Update existing rating
const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Find existing rating
    const existingRating = await Rating.findById ? await Rating.findById(id) : null;
    if (!existingRating) {
      return res.status(404).json({ 
        error: 'Rating not found' 
      });
    }

    // Check if rating belongs to current user
    if (existingRating.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You can only update your own ratings' 
      });
    }

    // Update rating
    const updatedRating = await Rating.update(id, parseInt(rating));

    res.json({
      message: 'Rating updated successfully',
      rating: updatedRating
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to update rating' 
    });
  }
};

// Delete rating
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find existing rating
    const existingRating = await Rating.findById ? await Rating.findById(id) : null;
    if (!existingRating) {
      return res.status(404).json({ 
        error: 'Rating not found' 
      });
    }

    // Check if rating belongs to current user
    if (existingRating.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You can only delete your own ratings' 
      });
    }

    // Delete rating
    await Rating.delete(id);

    res.json({ 
      message: 'Rating deleted successfully' 
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to delete rating' 
    });
  }
};

// Get all ratings for a store
const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found' 
      });
    }

    // Get all ratings for this store
    const ratings = await Rating.findByStoreId(storeId);

    res.json({
      store: {
        id: store.id,
        name: store.name,
        average_rating: store.average_rating,
        total_ratings: store.total_ratings
      },
      ratings: ratings
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get store ratings' 
    });
  }
};

// Get user's all ratings
const getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const ratings = await Rating.findByUserId(userId);

    res.json({
      ratings: ratings,
      total: ratings.length
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get user ratings' 
    });
  }
};

module.exports = {
  submitRating,
  getUserStoreRating,
  updateRating,
  deleteRating,
  getStoreRatings,
  getUserRatings
};
