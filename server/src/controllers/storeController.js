const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');

// Get all stores
const getAllStores = async (req, res) => {
  try {
    const { name, address, email, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    const filters = {};
    if (name) filters.name = name;
    if (address) filters.address = address;
    if (email) filters.email = email;

    const stores = await Store.findAll(filters, sortBy, sortOrder);

    // If user is logged in, get their ratings for these stores
    let storesWithUserRatings = stores;
    if (req.user && req.user.role === 'user') {
      const userRatings = await Rating.getUserStoreRatings(req.user.id);
      storesWithUserRatings = stores.map(store => {
        const userRating = userRatings.find(rating => rating.id === store.id);
        return {
          ...store,
          user_rating: userRating ? userRating.user_rating : null
        };
      });
    }

    res.json({
      stores: storesWithUserRatings,
      total: stores.length,
      filters: filters
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get stores' 
    });
  }
};

// Get store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id);

    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found' 
      });
    }

    // Get store ratings
    const ratings = await Store.getStoreRatings(id);

    // If user is logged in, get their rating for this store
    let userRating = null;
    if (req.user && req.user.role === 'user') {
      const rating = await Rating.findByUserAndStore(req.user.id, id);
      userRating = rating ? rating.rating : null;
    }

    res.json({
      store: {
        ...store,
        user_rating: userRating
      },
      ratings: ratings
    });
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get store' 
    });
  }
};

// Create new store (Admin only)
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_email } = req.body;

    // Check if store email already exists
    const existingStore = await Store.findByEmail ? await Store.findByEmail(email) : null;
    
    let owner_id = null;
    if (owner_email) {
      const owner = await User.findByEmail(owner_email);
      if (!owner) {
        return res.status(400).json({ 
          error: 'Owner not found', 
          message: 'User with this email does not exist' 
        });
      }
      if (owner.role !== 'store_owner') {
        return res.status(400).json({ 
          error: 'Invalid owner role', 
          message: 'User must have store_owner role' 
        });
      }
      owner_id = owner.id;
    }

    // Create new store
    const store = await Store.create({ name, email, address, owner_id });

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner_id: store.owner_id,
        average_rating: store.average_rating,
        total_ratings: store.total_ratings,
        created_at: store.created_at
      }
    });
  } catch (error) {
    console.error('Create store error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ 
        error: 'Store email already registered',
        message: 'Store with this email already exists'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to create store' 
    });
  }
};

// Update store (Admin only)
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found' 
      });
    }

    const updatedStore = await Store.update(id, { name, email, address });

    res.json({
      message: 'Store updated successfully',
      store: updatedStore
    });
  } catch (error) {
    console.error('Update store error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ 
        error: 'Store email already exists',
        message: 'Another store with this email already exists'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to update store' 
    });
  }
};

// Delete store (Admin only)
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found' 
      });
    }

    await Store.delete(id);

    res.json({ 
      message: 'Store deleted successfully',
      deletedStore: {
        id: store.id,
        name: store.name,
        email: store.email
      }
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to delete store' 
    });
  }
};

// Get store dashboard (Store Owner only)
const getStoreDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find store owned by this user
    const store = await Store.findByOwnerId(userId);
    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found', 
        message: 'No store associated with your account' 
      });
    }

    // Get store ratings
    const ratings = await Rating.findByStoreId(store.id);

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        average_rating: store.average_rating,
        total_ratings: store.total_ratings
      },
      ratings: ratings
    });
  } catch (error) {
    console.error('Get store dashboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get store dashboard' 
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoreDashboard
};
