const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveCartItem,
} = require('../validators/cart.validator');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', authenticate, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/items', authenticate, validateAddToCart, cartController.addToCart);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/items/:itemId', authenticate, validateUpdateCartItem, cartController.updateCartItem);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/items/:itemId', authenticate, validateRemoveCartItem, cartController.removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear all items from cart
 * @access  Private
 */
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
