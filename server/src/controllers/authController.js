const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered', 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = await User.create({ name, email, password, address, role: 'user' });
    
    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ 
        error: 'Email already registered',
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to register user' 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'Email or password is incorrect' 
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'Email or password is incorrect' 
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Login failed' 
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
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
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to get user profile' 
    });
  }
};

// Update user password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        error: 'Invalid current password' 
      });
    }

    // Update password
    await User.updatePassword(userId, newPassword);

    res.json({ 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to update password' 
    });
  }
};

// Verify token endpoint (for frontend to check if token is still valid)
const verifyToken = async (req, res) => {
  res.json({
    message: 'Token is valid',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updatePassword,
  verifyToken
};
