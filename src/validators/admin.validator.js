const { body, param, query } = require('express-validator');

/**
 * Validation rules for updating user role
 */
exports.validateUpdateRole = [
  param('id')
    .isInt()
    .withMessage('User ID must be a valid integer'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['customer', 'admin', 'seller'])
    .withMessage('Invalid role. Must be one of: customer, admin, seller'),
];

/**
 * Validation rules for updating user status
 */
exports.validateUpdateStatus = [
  param('id')
    .isInt()
    .withMessage('User ID must be a valid integer'),

  body('isVerified')
    .isBoolean()
    .withMessage('isVerified must be a boolean value'),
];

/**
 * Validation rules for listing users with filters
 */
exports.validateListUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('role')
    .optional()
    .isIn(['customer', 'admin', 'seller'])
    .withMessage('Invalid role filter'),

  query('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),
];

/**
 * Validation rules for getting user by ID
 */
exports.validateGetUser = [
  param('id')
    .isInt()
    .withMessage('User ID must be a valid integer'),
];

/**
 * Validation rules for deleting user
 */
exports.validateDeleteUser = [
  param('id')
    .isInt()
    .withMessage('User ID must be a valid integer'),
];
