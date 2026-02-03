const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateUpdateShipping,
  validateCancelOrder,
  validateGetOrder,
} = require('../validators/order.validator');

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics
 * @access  Admin only
 */
router.get('/stats', authenticate, isAdmin, orderController.getOrderStats);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (role-based filtering)
 * @access  Private
 */
router.get('/', authenticate, orderController.getAllOrders);

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
router.post('/', authenticate, validateCreateOrder, orderController.createOrder);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', authenticate, validateGetOrder, orderController.getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Admin/Seller
 */
router.put('/:id/status', authenticate, validateUpdateOrderStatus, orderController.updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/shipping
 * @desc    Update shipping information
 * @access  Admin/Seller
 */
router.put('/:id/shipping', authenticate, validateUpdateShipping, orderController.updateShippingInfo);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (customers can cancel pending/confirmed, admin can cancel any)
 */
router.post('/:id/cancel', authenticate, validateCancelOrder, orderController.cancelOrder);

module.exports = router;
