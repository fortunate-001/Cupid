// src/controllers/subscriptionController.js
import User from '../models/User.js';
import connectDB from '../../lib/mongodb.js';

// ---------- GET SUBSCRIPTION STATUS ----------
export const getStatus = async (req, res, next) => {
  try {
    const user = req.user;

    const now = new Date();
    let isExpired = false;

    if (user.subscription.tier !== 'free' && user.subscription.endDate) {
      if (now > user.subscription.endDate) {
        isExpired = true;
        user.subscription.status = 'expired';
        user.subscription.tier = 'free';
        await user.save();
      }
    }

    res.json({
      tier: user.subscription.tier,
      status: user.subscription.status,
      isExpired,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      pricing: {
        plus: { price: 1.99, duration: '24 hours' },
        pro: { price: 15.00, duration: '1 month' },
        proFirstMonth: { price: 10.50, duration: '1 month', discount: '30% off' }
      },
      freeMessagesUsed: user.usage.freeMessagesUsed || 0,
      freeMessageLimit: 10,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- UPGRADE TO PLUS ($1.99 for 24 hours) ----------
export const upgradePlus = async (req, res, next) => {
  try {
    await connectDB();
    const user = req.user;
    const now = new Date();

    // Check if user has enough "balance" (we'll simulate payment for now)
    // In production, this would be replaced with Stripe payment
    
    if (user.subscription.tier === 'plus') {
      // Extend by 24 hours from current end date
      const currentEnd = user.subscription.endDate || now;
      user.subscription.endDate = new Date(currentEnd.getTime() + 24 * 60 * 60 * 1000);
    } else {
      // New Plus subscription
      user.subscription.tier = 'plus';
      user.subscription.status = 'active';
      user.subscription.startDate = now;
      user.subscription.endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    // Reset free message counter for Plus users
    user.usage.freeMessagesUsed = 0;
    
    await user.save();

    res.json({
      message: '💘 Upgraded to Cupid Plus! You have 24 hours of unlimited messaging.',
      tier: 'plus',
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      price: 1.99,
      currency: 'USD',
    });
  } catch (error) {
    next(error);
  }
};

// ---------- UPGRADE TO PRO ($15/month, 30% off first month) ----------
export const upgradePro = async (req, res, next) => {
  try {
    await connectDB();
    const user = req.user;
    const now = new Date();

    // Check if user has enough "balance" (simulate payment)
    const isFirstTime = user.subscription.tier === 'free' || user.subscription.tier === 'plus';
    const price = isFirstTime ? 10.50 : 15.00;

    user.subscription.tier = 'pro';
    user.subscription.status = 'active';
    user.subscription.startDate = now;
    user.subscription.endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Reset free message counter for Pro users
    user.usage.freeMessagesUsed = 0;
    
    await user.save();

    res.json({
      message: isFirstTime 
        ? '💘 Welcome to Cupid Pro! Your first month is 30% off ($10.50).'
        : '💘 Welcome back to Cupid Pro! ($15.00/month)',
      tier: 'pro',
      price: price,
      currency: 'USD',
      isFirstTime,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- CANCEL SUBSCRIPTION ----------
export const cancelSubscription = async (req, res, next) => {
  try {
    await connectDB();
    const user = req.user;

    if (user.subscription.tier === 'free') {
      return res.status(400).json({ error: 'You are already on the free tier.' });
    }

    user.subscription.status = 'canceled';
    await user.save();

    res.json({
      message: `Your Cupid ${user.subscription.tier} subscription has been canceled. You'll have access until ${user.subscription.endDate}.`,
      tier: user.subscription.tier,
      endDate: user.subscription.endDate,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- SIMULATE PAYMENT (Demo) ----------
export const simulatePayment = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'plus' or 'pro'
    const user = req.user;

    if (!plan || !['plus', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Choose "plus" or "pro".' });
    }

    // In production, this would validate payment with Stripe
    // For demo, we'll just process the upgrade
    
    if (plan === 'plus') {
      // Call upgradePlus logic
      await upgradePlus(req, res, next);
    } else if (plan === 'pro') {
      await upgradePro(req, res, next);
    }
  } catch (error) {
    next(error);
  }
};