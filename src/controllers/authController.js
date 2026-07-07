// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import connectDB from '../../lib/mongodb.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ---------- EMAIL VALIDATION ----------
function isValidEmail(email) {
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Block disposable/temporary email domains
  const disposableDomains = [
    'tempmail.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'throwawayemail.com', 'trashmail.com',
    'spamgourmet.com', 'mailnator.com', 'fakeinbox.com', 'getnada.com',
    'maildrop.cc', 'tempinbox.com', 'throwawaymail.com', 'burnermail.io',
    'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'mailcatch.com',
    'mailmetrash.com', 'mailexpire.com', 'mymail-in.net', 'nada.ltd',
    'spambox.us', 'spam.la', 'spamavert.com', 'wegwerfmail.de',
    'wegwerfmail.net', 'wegwerfmail.org', 'spam4.me', 'spamfree24.com',
    'spamfree24.net', 'spamfree24.org', 'spamfree24.info', 'spamfree24.de'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return false;
  }
  
  // For Gmail specifically
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const localPart = email.split('@')[0];
    if (localPart.length < 6) return false;
    if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) return false;
  }
  
  return true;
}

// ---------- SIGNUP ----------
export const signup = async (req, res) => {
  try {
    console.log('📝 Signup request received');
    await connectDB();

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address. Gmail, Yahoo, and other real email providers are allowed. Temporary/disposable emails are not allowed.' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      subscription: { tier: 'free', status: 'active', startDate: new Date() },
      usage: { freeMessagesUsed: 0, totalMessages: 0 }
    });

    await user.save();
    console.log('✅ User saved:', user._id);

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ---------- LOGIN ----------
export const login = async (req, res) => {
  try {
    console.log('🔐 Login request received');
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Welcome back!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        usage: user.usage
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = async (req, res) => {
  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;

    console.log('🔗 Password reset link:', resetLink);
    console.log('📧 Send this link to the user:', resetLink);

    res.json({
      message: 'Password reset link generated! Check the terminal for the link.',
      success: true,
      resetLink: resetLink // Only in development
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ---------- RESET PASSWORD ----------
export const resetPasswordConfirm = async (req, res) => {
  try {
    await connectDB();

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      message: 'Password reset successfully! You can now login.',
      success: true
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ---------- GET CURRENT USER ----------
export const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        usage: user.usage
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};