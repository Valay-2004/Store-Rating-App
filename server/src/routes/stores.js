const express = require('express');
const storeController = require('../controllers/storeController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireStoreOwnerOrAdmin,
  authorizeRoles 
} = require('../middleware/auth');
const { 
  validateStore, 
  validateId, 
  validateQuery 
} = require('../middleware/validation');

const router = express.Router();

// Public routes (can be accessed by authenticated users)
router.get('/', authenticateToken, validateQuery, storeController.getAllStores);
router.get('/:id', authenticateToken, validateId, storeController.getStoreById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, validateStore, storeController.createStore);
router.put('/:id', authenticateToken, requireAdmin, validateId, validateStore, storeController.updateStore);
router.delete('/:id', authenticateToken, requireAdmin, validateId, storeController.deleteStore);

// Store owner routes
router.get('/dashboard/my-store', authenticateToken, authorizeRoles('store_owner'), storeController.getStoreDashboard);

module.exports = router;
