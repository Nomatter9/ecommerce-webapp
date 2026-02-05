const { body, param } = require('express-validator');

/**
 * Validation rules for creating an address
 */
exports.validateCreateAddress = [
  body('label')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Label must not exceed 50 characters'),

  body('recipientName')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Recipient name must be between 2 and 200 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('streetAddress')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Street address must be between 5 and 255 characters'),

  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address line 2 must not exceed 255 characters'),

  body('suburb')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Suburb must not exceed 100 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('province')
    .trim()
    .notEmpty()
    .withMessage('Province is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Province must be between 2 and 100 characters'),

  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),

  body('type')
    .optional()
    .isIn(['shipping', 'billing', 'both'])
    .withMessage('Type must be one of: shipping, billing, both'),
];

/**
 * Validation rules for updating an address
 */
exports.validateUpdateAddress = [
  param('id')
    .isInt()
    .withMessage('Address ID must be a valid integer'),

  body('label')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Label must not exceed 50 characters'),

  body('recipientName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Recipient name cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Recipient name must be between 2 and 200 characters'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('streetAddress')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address cannot be empty')
    .isLength({ min: 5, max: 255 })
    .withMessage('Street address must be between 5 and 255 characters'),

  body('addressLine2')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address line 2 must not exceed 255 characters'),

  body('suburb')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Suburb must not exceed 100 characters'),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('province')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Province cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Province must be between 2 and 100 characters'),

  body('postalCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Postal code cannot be empty')
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),

  body('type')
    .optional()
    .isIn(['shipping', 'billing', 'both'])
    .withMessage('Type must be one of: shipping, billing, both'),
];

/**
 * Validation rules for getting/deleting address by ID
 */
exports.validateAddressId = [
  param('id')
    .isInt()
    .withMessage('Address ID must be a valid integer'),
];
