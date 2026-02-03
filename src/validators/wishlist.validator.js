const { body, param } = require('express-validator');

/**
 * Validation rules for adding item to wishlist
 */
exports.validateAddToWishlist = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
];

/**
 * Validation rules for removing item from wishlist
 */
exports.validateRemoveFromWishlist = [
  param('id')
    .notEmpty()
    .withMessage('Wishlist item ID is required')
    .isInt({ min: 1 })
    .withMessage('Wishlist item ID must be a valid integer'),
];
