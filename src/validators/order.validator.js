const { body, param } = require('express-validator');

/**
 * Validation rules for creating an order
 */
exports.validateCreateOrder = [
  body('shippingAddressId')
    .notEmpty()
    .withMessage('Shipping address ID is required')
    .isInt({ min: 1 })
    .withMessage('Shipping address ID must be a valid integer'),

  body('paymentMethod')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Payment method must not exceed 50 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('couponCode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Coupon code must not exceed 50 characters'),
];

/**
 * Validation rules for updating order status
 */
exports.validateUpdateOrderStatus = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a valid integer'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded'
    ])
    .withMessage('Invalid order status'),
];

/**
 * Validation rules for updating shipping information
 */
exports.validateUpdateShipping = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a valid integer'),

  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tracking number must not exceed 100 characters'),

  body('shippingCarrier')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Shipping carrier must not exceed 100 characters'),

  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery must be a valid date'),
];

/**
 * Validation rules for cancelling an order
 */
exports.validateCancelOrder = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a valid integer'),
];

/**
 * Validation rules for getting order by ID
 */
exports.validateGetOrder = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a valid integer'),
];
