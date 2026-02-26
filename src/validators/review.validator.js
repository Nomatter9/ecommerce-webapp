const { body, param } = require('express-validator');

/**
 * Validation rules for creating a review
 */
exports.validateCreateReview = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Comment cannot exceed 5000 characters'),
];

/**
 * Validation rules for updating a review
 */
exports.validateUpdateReview = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid review ID is required'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Comment cannot exceed 5000 characters'),
];

/**
 * Validation rules for deleting a review
 */
exports.validateDeleteReview = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid review ID is required'),
];

/**
 * Validation rules for getting product reviews
 */
exports.validateGetProductReviews = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required'),
];
