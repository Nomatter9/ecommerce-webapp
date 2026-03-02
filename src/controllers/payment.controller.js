const { validationResult } = require('express-validator');
const db = require('../../models');
const paymentService = require('../services/payment.service');

const Order = db.Order;
const Payment = db.Payment;

/**
 * Create a simple checkout payment intent (no auth/order required)
 * POST /api/payments/checkout
 * Body: { amount: number (in rands), currency?: string }
 */
exports.createCheckoutIntent = async (req, res) => {
  try {
    const { amount, currency = 'zar' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      metadata: { source: 'checkout_page' },
    });

    // Save payment record
    await Payment.create({
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: 'pending',
      stripeMetadata: { source: 'checkout_page' },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Checkout intent error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

/**
 * Create payment intent for an order
 * POST /api/payments/create-intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { orderId } = req.body;
    const userId = req.user.id;

    // Get order
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is in pending status and payment is pending
    if (order.status !== 'pending' || order.paymentStatus !== 'pending') {
      return res.status(400).json({
        message: 'Order is not eligible for payment',
      });
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: order.total,
      currency: 'zar', // South African Rand - change as needed
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
    });

    // Update order with payment intent ID
    await order.update({
      paymentIntentId: paymentIntent.id,
    });

    // Save payment record linked to order and user
    await Payment.create({
      stripePaymentIntentId: paymentIntent.id,
      orderId: order.id,
      userId: order.userId,
      amount: parseFloat(order.total),
      currency: 'zar',
      status: 'pending',
      stripeMetadata: paymentIntent.metadata,
    });

    res.json({
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

/**
 * Confirm payment for an order
 * POST /api/payments/confirm
 */
exports.confirmPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    // Retrieve payment intent
    const paymentIntent = await paymentService.retrievePaymentIntent(paymentIntentId);

    // Get order from payment intent metadata
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      await order.update({
        paymentStatus: 'paid',
        status: 'confirmed',
        paidAt: new Date(),
      });

      // Update payment record with success details
      const payment = await Payment.findOne({
        where: { stripePaymentIntentId: paymentIntentId },
      });
      if (payment) {
        const updateData = {
          status: 'succeeded',
          stripeMetadata: paymentIntent,
        };
        const card = paymentIntent.charges?.data?.[0]?.payment_method_details?.card;
        if (card) {
          updateData.paymentMethodType = 'card';
          updateData.cardLast4 = card.last4;
          updateData.cardBrand = card.brand;
          updateData.cardExpMonth = card.exp_month;
          updateData.cardExpYear = card.exp_year;
        }
        await payment.update(updateData);
      }

      res.json({
        message: 'Payment confirmed successfully',
        order,
      });
    } else if (paymentIntent.status === 'requires_payment_method') {
      res.status(400).json({
        message: 'Payment requires a payment method',
      });
    } else if (paymentIntent.status === 'processing') {
      res.json({
        message: 'Payment is processing',
        status: 'processing',
      });
    } else {
      res.status(400).json({
        message: `Payment status: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
};

/**
 * Get payment status
 * GET /api/payments/status/:orderId
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to user (or user is admin)
    if (order.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let paymentDetails = null;
    if (order.paymentIntentId) {
      try {
        const paymentIntent = await paymentService.retrievePaymentIntent(
          order.paymentIntentId
        );
        paymentDetails = {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          created: new Date(paymentIntent.created * 1000),
        };
      } catch (error) {
        console.error('Failed to retrieve payment intent:', error);
      }
    }

    res.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      paidAt: order.paidAt,
      paymentDetails,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
};

/**
 * Handle Stripe webhook events
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const payload = req.body;

  try {
    // Construct and verify webhook event
    const event = paymentService.constructWebhookEvent(payload, signature);

    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findByPk(orderId);

    if (order) {
      await order.update({
        paymentStatus: 'paid',
        status: 'confirmed',
        paidAt: new Date(),
      });
      console.log(`Order ${order.orderNumber} payment succeeded`);
    }

    // Update payment record
    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (payment) {
      const updateData = {
        status: 'succeeded',
        stripeMetadata: paymentIntent,
      };
      const card = paymentIntent.charges?.data?.[0]?.payment_method_details?.card;
      if (card) {
        updateData.paymentMethodType = 'card';
        updateData.cardLast4 = card.last4;
        updateData.cardBrand = card.brand;
        updateData.cardExpMonth = card.exp_month;
        updateData.cardExpYear = card.exp_year;
      }
      await payment.update(updateData);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findByPk(orderId);

    if (order) {
      await order.update({
        paymentStatus: 'failed',
      });
      console.log(`Order ${order.orderNumber} payment failed`);
    }

    // Update payment record
    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (payment) {
      await payment.update({
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        stripeMetadata: paymentIntent,
      });
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    const order = await Order.findByPk(orderId);

    if (order) {
      await order.update({
        paymentStatus: 'cancelled',
      });
      console.log(`Order ${order.orderNumber} payment canceled`);
    }

    // Update payment record
    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (payment) {
      await payment.update({
        status: 'cancelled',
        stripeMetadata: paymentIntent,
      });
    }
  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}

/**
 * Handle refunded charge
 */
async function handleChargeRefunded(charge) {
  try {
    // Get payment intent ID from charge
    const paymentIntentId = charge.payment_intent;

    // Find order by payment intent ID
    const order = await Order.findOne({
      where: { paymentIntentId },
    });

    if (order) {
      await order.update({
        paymentStatus: 'refunded',
        status: 'refunded',
      });
      console.log(`Order ${order.orderNumber} refunded`);
    }

    // Update payment record
    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (payment) {
      await payment.update({
        status: 'refunded',
        stripeMetadata: charge,
      });
    }
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}
