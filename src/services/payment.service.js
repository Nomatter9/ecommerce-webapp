'use strict';

let _stripe;
function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your .env file.');
    }
    _stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

exports.createPaymentIntent = async ({ amount, currency = 'zar', metadata = {} }) => {
  const amountInCents = Math.round(Number(amount) * 100);
  console.log('Creating payment intent:', { amount, amountInCents, currency });
  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe Payment Intent Error:', error);
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
};

exports.retrievePaymentIntent = async (paymentIntentId) => {
  try {
    return await getStripe().paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Stripe Retrieve Payment Intent Error:', error);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

exports.confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  try {
    return await getStripe().paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  } catch (error) {
    console.error('Stripe Confirm Payment Intent Error:', error);
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

exports.cancelPaymentIntent = async (paymentIntentId) => {
  try {
    return await getStripe().paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    console.error('Stripe Cancel Payment Intent Error:', error);
    throw new Error(`Payment cancellation failed: ${error.message}`);
  }
};

exports.createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundParams = { payment_intent: paymentIntentId };
    if (amount) refundParams.amount = Math.round(amount * 100);
    return await getStripe().refunds.create(refundParams);
  } catch (error) {
    console.error('Stripe Refund Error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

exports.constructWebhookEvent = (payload, signature) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('Webhook secret not configured');
    return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook Signature Verification Error:', error);
    throw new Error(`Webhook verification failed: ${error.message}`);
  }
};

exports.retrievePaymentMethod = async (paymentMethodId) => {
  try {
    return await getStripe().paymentMethods.retrieve(paymentMethodId);
  } catch (error) {
    console.error('Stripe Retrieve Payment Method Error:', error);
    throw new Error(`Failed to retrieve payment method: ${error.message}`);
  }
};