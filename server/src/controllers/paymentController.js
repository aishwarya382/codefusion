const User = require('../models/User');
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// @desc    Create checkout session / direct mock upgrade
// @route   POST /api/payments/create-checkout-session
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['pro', 'team'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fallback if no Stripe key is configured - direct database update (mock flow)
    if (!stripe) {
      user.subscription = {
        plan,
        stripeCustomerId: 'mock_customer_id',
        stripeSubscriptionId: 'mock_subscription_id_' + Date.now(),
      };
      await user.save({ validateBeforeSave: false });
      return res.json({
        success: true,
        url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?billing_success=true`,
        isMock: true,
      });
    }

    // Real Stripe Flow
    const planPrices = {
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_1ProPlanIDMock',
      team: process.env.STRIPE_TEAM_PRICE_ID || 'price_1TeamPlanIDMock',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planPrices[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?billing_success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?billing_canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Subscription
// @route   POST /api/payments/cancel
exports.cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (stripe && user.subscription.stripeSubscriptionId && !user.subscription.stripeSubscriptionId.startsWith('mock_')) {
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Instantly downgrade for mock/direct experience
    user.subscription = {
      plan: 'hobby',
      stripeCustomerId: '',
      stripeSubscriptionId: '',
    };
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Subscription canceled successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook (real production integration)
// @route   POST /api/payments/webhook
exports.stripeWebhook = async (req, res, next) => {
  let event = req.body;

  if (process.env.STRIPE_WEBHOOK_SECRET && stripe) {
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    await User.findByIdAndUpdate(userId, {
      subscription: {
        plan,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      },
    });
  }

  res.json({ received: true });
};
