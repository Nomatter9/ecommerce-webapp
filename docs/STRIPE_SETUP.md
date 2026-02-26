# Stripe Payment Integration Guide

This guide will help you set up and test Stripe payments in your e-commerce application.

## Table of Contents
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Webhook Setup](#webhook-setup)
- [Production Checklist](#production-checklist)

## Getting Started

### 1. Create a Stripe Account

1. Go to [Stripe](https://stripe.com/) and create an account
2. Activate your account (email verification)
3. Navigate to [Stripe Dashboard](https://dashboard.stripe.com/)

### 2. Get Your API Keys

1. In the Stripe Dashboard, click **Developers** in the left sidebar
2. Click **API keys**
3. You'll see two sets of keys:
   - **Test mode** (for development) - Use these!
   - **Live mode** (for production) - Don't use until you're ready

4. Copy your test keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - **KEEP THIS SECRET!**

## Configuration

### 1. Update Environment Variables

Copy `.env.example` to `.env` and update the Stripe keys:

```bash
cp .env.example .env
```

Edit `.env` and add your Stripe keys:

```env
# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important:**
- Never commit your `.env` file to version control
- The secret key should NEVER be exposed to the frontend
- Only the publishable key can be used in client-side code

### 2. Restart Your Server

After updating `.env`:

```bash
npm run dev
```

## API Endpoints

### 1. Create Payment Intent

Creates a Stripe Payment Intent for an order.

**Endpoint:** `POST /api/payments/create-intent`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": 1
}
```

**Response:**
```json
{
  "message": "Payment intent created successfully",
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxxxx"
}
```

### 2. Confirm Payment

Confirms a payment after successful payment on the frontend.

**Endpoint:** `POST /api/payments/confirm`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxxxx"
}
```

**Response:**
```json
{
  "message": "Payment confirmed successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-20260226-00001",
    "paymentStatus": "paid",
    "paidAt": "2026-02-26T20:47:23.000Z"
  }
}
```

### 3. Get Payment Status

Retrieves payment status for an order.

**Endpoint:** `GET /api/payments/status/:orderId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "orderId": 1,
  "orderNumber": "ORD-20260226-00001",
  "paymentStatus": "paid",
  "paymentMethod": "stripe",
  "total": "599.99",
  "paidAt": "2026-02-26T20:47:23.000Z",
  "paymentDetails": {
    "status": "succeeded",
    "amount": 599.99,
    "currency": "zar",
    "created": "2026-02-26T20:45:00.000Z"
  }
}
```

## Testing

### Test Card Numbers

Stripe provides test card numbers for different scenarios:

#### Successful Payments

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### Payment Failures

```
# Card declined
Card Number: 4000 0000 0000 0002

# Insufficient funds
Card Number: 4000 0000 0000 9995

# Card requires authentication (3D Secure)
Card Number: 4000 0025 0000 3155
```

More test cards: [Stripe Testing Guide](https://stripe.com/docs/testing)

### Testing Flow with cURL

#### Step 1: Create an Order

```bash
# First, create an order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddressId": 1,
    "paymentMethod": "stripe"
  }'
```

Response will include `orderId`.

#### Step 2: Create Payment Intent

```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1
  }'
```

Save the `clientSecret` from the response.

#### Step 3: Process Payment (Frontend Integration Required)

The `clientSecret` should be used with Stripe.js or Stripe Elements on your frontend to collect payment details securely.

Example with Stripe.js:

```javascript
const stripe = Stripe('pk_test_your_publishable_key');

const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'Customer Name',
      },
    },
  }
);

if (error) {
  console.error(error);
} else if (paymentIntent.status === 'succeeded') {
  // Confirm payment on backend
  await fetch('/api/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentIntentId: paymentIntent.id,
    }),
  });
}
```

## Webhook Setup

Webhooks allow Stripe to notify your application about payment events.

### Local Development with Stripe CLI

1. **Install Stripe CLI:**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

2. **Login to Stripe:**

```bash
stripe login
```

3. **Forward webhooks to your local server:**

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

This will output a webhook signing secret like `whsec_xxxxx`. Add this to your `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

4. **Test webhooks:**

In another terminal, trigger a test webhook:

```bash
stripe trigger payment_intent.succeeded
```

### Production Webhook Setup

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the **Signing secret** and add it to your production `.env`

## Payment Flow Diagram

```
User                    Frontend                Backend                 Stripe
 |                         |                       |                       |
 |-- Add to cart --------->|                       |                       |
 |-- Checkout ------------>|                       |                       |
 |                         |-- Create order ------>|                       |
 |                         |<----- orderId --------|                       |
 |                         |-- Create intent ----->|                       |
 |                         |                       |-- Create intent ----->|
 |                         |                       |<-- clientSecret ------|
 |                         |<--- clientSecret -----|                       |
 |-- Enter card details -->|                       |                       |
 |                         |-- Confirm payment --->|                       |
 |                         |                       |<-- payment succeeded -|
 |                         |<--- Confirm --------->|-- Update order ------>|
 |<-- Order confirmed -----|                       |                       |
```

## Supported Payment Methods

Currently configured:
- **Credit/Debit Cards** (Visa, Mastercard, Amex, etc.)

You can enable additional payment methods in Stripe Dashboard:
- Apple Pay / Google Pay
- Bank transfers
- Buy now, pay later (Klarna, Afterpay)
- Local payment methods

## Currency

Default currency is set to **ZAR** (South African Rand).

To change the currency, update `src/services/payment.service.js`:

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: 'usd', // Change this to your currency code
  // ...
});
```

Supported currencies: [Stripe Currency List](https://stripe.com/docs/currencies)

## Production Checklist

Before going live:

- [ ] Switch from test keys to live keys
- [ ] Set up production webhook endpoint
- [ ] Enable HTTPS for your domain
- [ ] Configure webhook signature verification
- [ ] Set up proper error logging
- [ ] Implement receipt emails
- [ ] Review Stripe's [best practices](https://stripe.com/docs/security/guide)
- [ ] Test refund flow
- [ ] Configure dispute handling
- [ ] Set up Stripe Radar for fraud prevention

## Error Handling

Common errors and solutions:

### "Invalid API Key"
- Check that you're using the correct key for your environment (test vs live)
- Verify the key in `.env` has no extra spaces

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
- Check that the webhook endpoint is receiving raw body (not JSON parsed)

### "Payment Intent not found"
- The payment intent ID might be incorrect
- Payment intent might have expired (24 hours)

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Support](https://support.stripe.com/)

## Next Steps

1. **Frontend Integration:** Implement Stripe Elements for secure card input
2. **Email Receipts:** Send confirmation emails after successful payment
3. **Refunds:** Implement refund functionality through admin panel
4. **Analytics:** Track payment success rates in Stripe Dashboard
