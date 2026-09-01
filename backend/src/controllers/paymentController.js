// src/controllers/paymentController.js
import Stripe from 'stripe';
import User from '../models/User.js';
import connectDB from '../../lib/mongodb.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------- CREATE CHECKOUT SESSION ----------
export const createCheckoutSession = async (req, res) => {
  try {
    await connectDB();
    const user = req.user;
    const { plan } = req.body; // 'plus' or 'pro'

    // Define pricing
    const prices = {
      plus: { price: 1.99, name: 'Cupid Plus (24 hours)', interval: 'day' },
      pro: { price: 15.00, name: 'Cupid Pro (Monthly)', interval: 'month' }
    };

    const selectedPlan = prices[plan];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: selectedPlan.name,
            description: `Unlimited AI chat access for ${selectedPlan.interval}`,
          },
          unit_amount: Math.round(selectedPlan.price * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        userId: user._id.toString(),
        plan: plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- WEBHOOK: Handle Payment Success ----------
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, plan } = session.metadata;

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update subscription
    const now = new Date();
    if (plan === 'plus') {
      user.subscription.tier = 'plus';
      user.subscription.status = 'active';
      user.subscription.startDate = now;
      user.subscription.endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (plan === 'pro') {
      user.subscription.tier = 'pro';
      user.subscription.status = 'active';
      user.subscription.startDate = now;
      user.subscription.endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    user.usage.freeMessagesUsed = 0;
    await user.save();

    console.log(`✅ ${user.email} upgraded to ${plan}`);
  }

  res.json({ received: true });
};