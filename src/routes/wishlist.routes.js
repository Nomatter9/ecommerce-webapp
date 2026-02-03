const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validateAddToWishlist,
  validateRemoveFromWishlist,
} = require('../validators/wishlist.validator');

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', authenticate, wishlistController.getWishlist);

/**
 * @route   POST /api/wishlist
 * @desc    Add item to wishlist
 * @access  Private
 */
router.post('/', authenticate, validateAddToWishlist, wishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist/:id
 * @desc    Remove item from wishlist
 * @access  Private
 */
router.delete('/:id', authenticate, validateRemoveFromWishlist, wishlistController.removeFromWishlist);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/', authenticate, wishlistController.clearWishlist);

/**
 * @route   GET /api/wishlist/check/:productId
 * @desc    Check if product is in wishlist
 * @access  Private
 */
router.get('/check/:productId', authenticate, wishlistController.checkWishlist);

module.exports = router;
