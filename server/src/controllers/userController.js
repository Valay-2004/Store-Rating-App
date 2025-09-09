const User = require('../models/User');
const Rating = require('../models/Rating');
const Store = require('../models/Store');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const userStats = await User.getStats();
    const storeStats = await Store.getStats();
    const ratingStats = await Rating.getStats();

    res.json({
      stats: {
        total_users: parseInt(userStats.total_users) || 0,
        admin_users: parseInt(userStats.admin_users) || 0,
        normal_users: parseInt(userStats.normal_users) || 0,
        store_owners: parseInt(userStats.store_owners) || 0,
        total_stores: parseInt(storeStats.total_stores) || 0,
        total_ratings: parseInt(ratingStats.total_ratings) || 0,
        overall_average_rating: parseFloat(storeStats.overall_average_rating) || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get dashboard statistics' 
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    const filters = {};
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (address) filters.address = address;
    if (role) filters.role = role;

    const users = await User.findAll(filters, sortBy, sortOrder);

    res.json({
      users,
      total: users.length,
      filters: filters
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get users' 
    });
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // If user is store owner, get their store info
    let storeInfo = null;
    if (user.role === 'store_owner') {
      storeInfo = await Store.findByOwnerId(user.id);
    }

    res.json({
      user: {
        ...user,
        store: storeInfo
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get user' 
    });
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered', 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = await User.create({ name, email, password, address, role });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ 
        error: 'Email already registered',
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to create user' 
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    await User.delete(id);

    res.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to delete user' 
    });
  }
};

// Get user's ratings
const getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    const ratings = await Rating.findByUserId(userId);

    res.json({
      ratings,
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
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  getUserRatings
};
