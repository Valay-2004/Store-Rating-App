const express = require('express');
const ratingController = require('../controllers/ratingController');
const { 
  authenticateToken, 
  authorizeRoles 
} = require('../middleware/auth');
const { 
  validateRating, 
  validateId 
} = require('../middleware/validation');

const router = express.Router();

// User routes (normal users only)
router.post('/store/:storeId', 
  authenticateToken, 
  authorizeRoles('user'), 
  validateRating, 
  ratingController.submitRating
);

router.get('/store/:storeId/my-rating', 
  authenticateToken, 
  authorizeRoles('user'), 
  validateId, 
  ratingController.getUserStoreRating
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('user'), 
  validateId, 
  ratingController.updateRating
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('user'), 
  validateId, 
  ratingController.deleteRating
);

router.get('/my-ratings', 
  authenticateToken, 
  authorizeRoles('user'), 
  ratingController.getUserRatings
);

// Public routes (accessible by all authenticated users)
router.get('/store/:storeId', 
  authenticateToken, 
  validateId, 
  ratingController.getStoreRatings
);

module.exports = router;
