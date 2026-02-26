const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const {
  validateCreatePaymentIntent,
  validateConfirmPayment,
  validateGetPaymentStatus,
} = require('../validators/payment.validator');
const { authenticate } = require('../middleware/auth.middleware');

// Create payment intent
router.post(
  '/create-intent',
  authenticate,
  validateCreatePaymentIntent,
  paymentController.createPaymentIntent
);

// Confirm payment
router.post(
  '/confirm',
  authenticate,
  validateConfirmPayment,
  paymentController.confirmPayment
);

// Get payment status
router.get(
  '/status/:orderId',
  authenticate,
  validateGetPaymentStatus,
  paymentController.getPaymentStatus
);

// Webhook endpoint (no auth - Stripe will verify signature)
// IMPORTANT: This route must use raw body, not JSON parsed body
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
