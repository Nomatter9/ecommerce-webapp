const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Payment Intent
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code (e.g., 'zar', 'usd')
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Payment Intent object
 */
exports.createPaymentIntent = async ({ amount, currency = 'zar', metadata = {} }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe Payment Intent Error:', error);
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
};

/**
 * Retrieve a Payment Intent
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @returns {Promise<Object>} Payment Intent object
 */
exports.retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe Retrieve Payment Intent Error:', error);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

/**
 * Confirm a Payment Intent
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @param {string} paymentMethodId - Stripe Payment Method ID
 * @returns {Promise<Object>} Confirmed Payment Intent
 */
exports.confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe Confirm Payment Intent Error:', error);
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

/**
 * Cancel a Payment Intent
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @returns {Promise<Object>} Cancelled Payment Intent
 */
exports.cancelPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe Cancel Payment Intent Error:', error);
    throw new Error(`Payment cancellation failed: ${error.message}`);
  }
};

/**
 * Create a refund for a payment
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @param {number} amount - Amount to refund in cents (optional, defaults to full refund)
 * @returns {Promise<Object>} Refund object
 */
exports.createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundParams = { payment_intent: paymentIntentId };
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Stripe Refund Error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

/**
 * Construct and verify a webhook event
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified Stripe event
 */
exports.constructWebhookEvent = (payload, signature) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Webhook Signature Verification Error:', error);
    throw new Error(`Webhook verification failed: ${error.message}`);
  }
};

/**
 * Get payment method details
 * @param {string} paymentMethodId - Stripe Payment Method ID
 * @returns {Promise<Object>} Payment Method object
 */
exports.retrievePaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Stripe Retrieve Payment Method Error:', error);
    throw new Error(`Failed to retrieve payment method: ${error.message}`);
  }
};
