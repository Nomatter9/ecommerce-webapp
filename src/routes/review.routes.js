const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const {
  validateCreateReview,
  validateUpdateReview,
  validateDeleteReview,
  validateGetProductReviews,
} = require('../validators/review.validator');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// Product-specific review routes
// These handle reviews for specific products
router.get(
  '/products/:productId/reviews',
  validateGetProductReviews,
  reviewController.getProductReviews
);

router.post(
  '/products/:productId/reviews',
  authenticate,
  validateCreateReview,
  reviewController.createReview
);

// User's own reviews
router.get('/my-reviews', authenticate, reviewController.getMyReviews);

// Individual review management
router.put('/:id', authenticate, validateUpdateReview, reviewController.updateReview);

router.delete('/:id', authenticate, validateDeleteReview, reviewController.deleteReview);

// Admin only - review moderation
router.put('/:id/approval', authenticate, isAdmin, reviewController.toggleReviewApproval);

module.exports = router;
