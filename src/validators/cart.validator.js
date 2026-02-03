const { body, param } = require('express-validator');

/**
 * Validation rules for adding item to cart
 */
exports.validateAddToCart = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

/**
 * Validation rules for updating cart item quantity
 */
exports.validateUpdateCartItem = [
  param('itemId')
    .notEmpty()
    .withMessage('Cart item ID is required')
    .isInt({ min: 1 })
    .withMessage('Cart item ID must be a valid integer'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

/**
 * Validation rules for removing cart item
 */
exports.validateRemoveCartItem = [
  param('itemId')
    .notEmpty()
    .withMessage('Cart item ID is required')
    .isInt({ min: 1 })
    .withMessage('Cart item ID must be a valid integer'),
];
