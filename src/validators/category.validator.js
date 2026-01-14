const { body, param } = require('express-validator');

/**
 * Validation rules for creating a category
 */
exports.validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Slug must be between 2 and 120 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Image URL must not exceed 500 characters'),

  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a valid integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

/**
 * Validation rules for updating a category
 */
exports.validateUpdateCategory = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  body('slug')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Slug cannot be empty')
    .isLength({ min: 2, max: 120 })
    .withMessage('Slug must be between 2 and 120 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Image URL must not exceed 500 characters'),

  body('parentId')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Allow null to remove parent
      if (!Number.isInteger(value) || value < 1) {
        throw new Error('Parent ID must be a valid integer or null');
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

/**
 * Validation rules for category ID parameter
 */
exports.validateCategoryId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
];

/**
 * Validation rules for category slug parameter
 */
exports.validateCategorySlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
];
