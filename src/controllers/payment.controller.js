'use strict';

const { validationResult } = require('express-validator');
const db = require('../../models');
const paymentService = require('../services/payment.service');

const Order   = db.Order;
const Payment = db.Payment;

/**
 * POST /api/payments/create-intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId);
    if (!order)                   return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== userId)  return res.status(403).json({ message: 'Access denied' });
    if (order.status !== 'pending' || order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Order is not eligible for payment' });
    }
console.log('Order total from DB:', order.total, typeof order.total);
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: Number(order.total)  ,
      currency: 'zar',
      metadata: {
        orderId:     order.id,
        orderNumber: order.orderNumber,
        userId:      order.userId,
      },
    });

    // Update order with Stripe PI id
    await order.update({ paymentIntentId: paymentIntent.id });

    // Create a pending Payment record immediately
    await Payment.create({
      orderId:            order.id,
      userId,
      paymentIntentId:    paymentIntent.id,
      amount:             order.total,
      currency:           'zar',
      status:             'pending',
      captureMethod:      paymentIntent.capture_method,
      confirmationMethod: paymentIntent.confirmation_method,
      livemode:           paymentIntent.livemode,
      metadata:           JSON.stringify(paymentIntent),
    });

    res.json({
      message:         'Payment intent created successfully',
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
};

/**
 * POST /api/payments/confirm
 */
exports.confirmPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    const paymentIntent = await paymentService.retrievePaymentIntent(paymentIntentId);

    const orderId = paymentIntent.metadata.orderId;
    const order   = await Order.findByPk(orderId);
    if (!order)                  return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== userId) return res.status(403).json({ message: 'Access denied' });

    if (paymentIntent.status === 'succeeded') {
      await order.update({
        paymentStatus: 'paid',
        status:        'confirmed',
        paidAt:        new Date(),
      });

      // Upsert Payment record with full Stripe response
      await Payment.upsert({
        orderId:            order.id,
        userId,
        paymentIntentId:    paymentIntent.id,
        paymentMethodId:    paymentIntent.payment_method,
        amount:             paymentIntent.amount / 100,
        currency:           paymentIntent.currency,
        status:             'succeeded',
        captureMethod:      paymentIntent.capture_method,
        confirmationMethod: paymentIntent.confirmation_method,
        livemode:           paymentIntent.livemode,
        receiptEmail:       paymentIntent.receipt_email,
        description:        paymentIntent.description,
        metadata:           JSON.stringify(paymentIntent),
        paidAt:             new Date(),
      });

      return res.json({ message: 'Payment confirmed successfully', order });
    }

    if (paymentIntent.status === 'processing') {
      await Payment.upsert({
        orderId:         order.id,
        userId,
        paymentIntentId: paymentIntent.id,
        amount:          paymentIntent.amount / 100,
        currency:        paymentIntent.currency,
        status:          'processing',
        livemode:        paymentIntent.livemode,
        metadata:        JSON.stringify(paymentIntent),
      });
      return res.json({ message: 'Payment is processing', status: 'processing' });
    }

    if (paymentIntent.status === 'requires_payment_method') {
      await Payment.upsert({
        orderId:         order.id,
        userId,
        paymentIntentId: paymentIntent.id,
        amount:          paymentIntent.amount / 100,
        currency:        paymentIntent.currency,
        status:          'failed',
        livemode:        paymentIntent.livemode,
        metadata:        JSON.stringify(paymentIntent),
      });
      return res.status(400).json({ message: 'Payment requires a payment method' });
    }

    return res.status(400).json({ message: `Payment status: ${paymentIntent.status}` });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
  }
};

/**
 * GET /api/payments/status/:orderId
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId, {
      include: [{ model: Payment, as: 'payment' }],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      orderId:       order.id,
      orderNumber:   order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total:         order.total,
      paidAt:        order.paidAt,
      payment:       order.payment ?? null,  // full Payment record
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
};

/**
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const payload   = req.body;

  try {
    const event = paymentService.constructWebhookEvent(payload, signature);
    console.log('Webhook event received:', event.type);

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

// ── Webhook handlers ────────────────────────────────────────────────────────

async function handlePaymentSucceeded(paymentIntent) {
  try {
    const order = await Order.findByPk(paymentIntent.metadata.orderId);
    if (!order) return;

    await order.update({ paymentStatus: 'paid', status: 'confirmed', paidAt: new Date() });

    await Payment.upsert({
      orderId:            order.id,
      userId:             order.userId,
      paymentIntentId:    paymentIntent.id,
      paymentMethodId:    paymentIntent.payment_method,
      amount:             paymentIntent.amount / 100,
      currency:           paymentIntent.currency,
      status:             'succeeded',
      captureMethod:      paymentIntent.capture_method,
      confirmationMethod: paymentIntent.confirmation_method,
      livemode:           paymentIntent.livemode,
      receiptEmail:       paymentIntent.receipt_email,
      description:        paymentIntent.description,
      metadata:           JSON.stringify(paymentIntent),
      paidAt:             new Date(),
    });

    console.log(`Order ${order.orderNumber} payment succeeded`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    const order = await Order.findByPk(paymentIntent.metadata.orderId);
    if (!order) return;

    await order.update({ paymentStatus: 'failed' });

    await Payment.upsert({
      orderId:         order.id,
      userId:          order.userId,
      paymentIntentId: paymentIntent.id,
      amount:          paymentIntent.amount / 100,
      currency:        paymentIntent.currency,
      status:          'failed',
      livemode:        paymentIntent.livemode,
      metadata:        JSON.stringify(paymentIntent),
    });

    console.log(`Order ${order.orderNumber} payment failed`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentCanceled(paymentIntent) {
  try {
    const order = await Order.findByPk(paymentIntent.metadata.orderId);
    if (!order) return;

    await order.update({ paymentStatus: 'cancelled' });

    await Payment.upsert({
      orderId:         order.id,
      userId:          order.userId,
      paymentIntentId: paymentIntent.id,
      amount:          paymentIntent.amount / 100,
      currency:        paymentIntent.currency,
      status:          'cancelled',
      livemode:        paymentIntent.livemode,
      metadata:        JSON.stringify(paymentIntent),
    });

    console.log(`Order ${order.orderNumber} payment canceled`);
  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}

async function handleChargeRefunded(charge) {
  try {
    const order = await Order.findOne({ where: { paymentIntentId: charge.payment_intent } });
    if (!order) return;

    await order.update({ paymentStatus: 'refunded', status: 'refunded' });

    await Payment.upsert({
      orderId:         order.id,
      userId:          order.userId,
      paymentIntentId: charge.payment_intent,
      amount:          charge.amount_refunded / 100,
      currency:        charge.currency,
      status:          'refunded',
      livemode:        charge.livemode,
      metadata:        JSON.stringify(charge),
    });

    console.log(`Order ${order.orderNumber} refunded`);
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}
/**
 * POST /api/payments/cancel
 * Body: { paymentIntentId }
 */
exports.cancelPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    // Cancel on Stripe's side
    const paymentIntent = await paymentService.cancelPaymentIntent(paymentIntentId);

    const orderId = paymentIntent.metadata.orderId;
    const order   = await Order.findByPk(orderId);
    if (!order)                  return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== userId) return res.status(403).json({ message: 'Access denied' });

    // Update order
    await order.update({
      paymentStatus: 'cancelled',
      status:        'cancelled',
    });

    // Update Payment record
    await Payment.upsert({
      orderId:         order.id,
      userId,
      paymentIntentId: paymentIntent.id,
      amount:          paymentIntent.amount / 100,
      currency:        paymentIntent.currency,
      status:          'cancelled',
      livemode:        paymentIntent.livemode,
      metadata:        JSON.stringify(paymentIntent),
    });

    res.json({ message: 'Payment cancelled successfully', order });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ message: 'Failed to cancel payment', error: error.message });
  }
};