const express = require('express');
const userController = require('../controllers/userController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireOwnershipOrAdmin 
} = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateId, 
  validateQuery 
} = require('../middleware/validation');

const router = express.Router();

// Admin only routes
router.get('/stats', authenticateToken, requireAdmin, userController.getDashboardStats);
router.get('/', authenticateToken, requireAdmin, validateQuery, userController.getAllUsers);
router.get('/:id', authenticateToken, requireAdmin, validateId, userController.getUserById);
router.post('/', authenticateToken, requireAdmin, validateUserRegistration, userController.createUser);
router.delete('/:id', authenticateToken, requireAdmin, validateId, userController.deleteUser);

// User routes (own resources or admin)
router.get('/:id/ratings', authenticateToken, requireOwnershipOrAdmin, userController.getUserRatings);

module.exports = router;
