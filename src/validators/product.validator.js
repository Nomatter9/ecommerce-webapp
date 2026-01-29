const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a product
 */
exports.validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Product name must be between 3 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Description must not exceed 10000 characters'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description must not exceed 500 characters'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('SKU must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      // Check for max 2 decimal places
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        throw new Error('Price can have maximum 2 decimal places');
      }
      return true;
    }),

  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number')
    .custom((value, { req }) => {
      if (value && parseFloat(value) < parseFloat(req.body.price)) {
        throw new Error('Compare at price should be greater than or equal to price');
      }
      return true;
    }),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must not exceed 100 characters'),

  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),

  body('dimensions')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          throw new Error('Dimensions must be a valid JSON object');
        }
      }
      if (value && typeof value === 'object') {
        const { length, width, height } = value;
        if (length !== undefined && (typeof length !== 'number' || length < 0)) {
          throw new Error('Dimension length must be a positive number');
        }
        if (width !== undefined && (typeof width !== 'number' || width < 0)) {
          throw new Error('Dimension width must be a positive number');
        }
        if (height !== undefined && (typeof height !== 'number' || height < 0)) {
          throw new Error('Dimension height must be a positive number');
        }
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),

  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Meta title must not exceed 255 characters'),

  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Meta description must not exceed 500 characters'),
];

/**
 * Validation rules for updating a product
 */
exports.validateUpdateProduct = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Product name must be between 3 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Description must not exceed 10000 characters'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description must not exceed 500 characters'),

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('SKU must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        throw new Error('Price can have maximum 2 decimal places');
      }
      return true;
    }),

  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must not exceed 100 characters'),

  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),

  body('dimensions')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          throw new Error('Dimensions must be a valid JSON object');
        }
      }
      if (value && typeof value === 'object') {
        const { length, width, height } = value;
        if (length !== undefined && (typeof length !== 'number' || length < 0)) {
          throw new Error('Dimension length must be a positive number');
        }
        if (width !== undefined && (typeof width !== 'number' || width < 0)) {
          throw new Error('Dimension width must be a positive number');
        }
        if (height !== undefined && (typeof height !== 'number' || height < 0)) {
          throw new Error('Dimension height must be a positive number');
        }
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),

  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Meta title must not exceed 255 characters'),

  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Meta description must not exceed 500 characters'),
];

/**
 * Validation rules for getting a product by ID
 */
exports.validateGetProduct = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
];

/**
 * Validation rules for deleting a product
 */
exports.validateDeleteProduct = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
];

/**
 * Validation rules for listing products with filters
 */
exports.validateListProducts = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number')
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
        throw new Error('Maximum price must be greater than minimum price');
      }
      return true;
    }),

  query('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be between 1 and 100 characters'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search query must be between 1 and 255 characters'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'name', 'averageRating', 'stockQuantity'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Order must be ASC or DESC'),
];

/**
 * Validation for product image operations
 */
exports.validateProductImage = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
];

/**
 * Validation for deleting a specific image
 */
exports.validateDeleteProductImage = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),

  param('imageId')
    .isInt({ min: 1 })
    .withMessage('Image ID must be a valid integer'),
];
