const express = require('express');
const router = express.Router();
const { createCheckoutSession, cancelSubscription, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public Webhook for Stripe (no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.use(protect);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/cancel', cancelSubscription);

module.exports = router;
