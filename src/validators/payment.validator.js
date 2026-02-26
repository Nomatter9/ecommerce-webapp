const { body, param } = require('express-validator');

/**
 * Validation rules for creating payment intent
 */
exports.validateCreatePaymentIntent = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Valid order ID is required'),
];

/**
 * Validation rules for confirming payment
 */
exports.validateConfirmPayment = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required')
    .isString()
    .withMessage('Valid payment intent ID is required'),
];

/**
 * Validation rules for getting payment status
 */
exports.validateGetPaymentStatus = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('Valid order ID is required'),
];
