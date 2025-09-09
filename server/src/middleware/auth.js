const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'User not found' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or invalid' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expired',
        message: 'Please login again' 
      });
    }

    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Authentication failed' 
    });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  return authorizeRoles('admin')(req, res, next);
};

// Middleware to check if user is store owner or admin
const requireStoreOwnerOrAdmin = (req, res, next) => {
  return authorizeRoles('store_owner', 'admin')(req, res, next);
};

// Middleware to check if user can access their own resources or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.userId) || parseInt(req.params.id);
  
  if (req.user.role === 'admin' || req.user.id === userId) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Forbidden', 
    message: 'You can only access your own resources' 
  });
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireAdmin,
  requireStoreOwnerOrAdmin,
  requireOwnershipOrAdmin
};
