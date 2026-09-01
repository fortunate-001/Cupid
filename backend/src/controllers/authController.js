// src/controllers/authController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import user from "../models/User.js";

import User from "../models/User.js";
import connectDB from "../../../backend/lib/mongodb.js";

const JWT_SECRET = process.env.JWT_SECRET;

// ==============================
// Nodemailer
// ==============================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==============================
// Email Validation
// ==============================

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return false;

  const disposableDomains = [
    "tempmail.com",
    "temp-mail.org",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
    "throwawayemail.com",
    "trashmail.com",
    "spamgourmet.com",
    "mailnator.com",
    "fakeinbox.com",
    "getnada.com",
    "maildrop.cc",
    "tempinbox.com",
    "throwawaymail.com",
    "burnermail.io",
  ];

  const domain = email.split("@")[1]?.toLowerCase();

  if (domain && disposableDomains.includes(domain)) {
    return false;
  }

  return true;
}

// ==============================
// SIGNUP
// ==============================

export const signup = async (req, res) => {
  try {
    console.log("📝 Signup request received");

    await connectDB();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,

      subscription: {
        tier: "free",
        status: "active",
        startDate: new Date(),
      },

      usage: {
        freeMessagesUsed: 0,
        totalMessages: 0,
      },
    });

    await user.save();

    console.log("✅ User created:", user.email);

    // Welcome Email

    try {
      await transporter.sendMail({
        from: `"Cupid AI ❤️" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Welcome to Cupid ❤️",

        html: `
        <div style="font-family:Arial;padding:30px;max-width:600px;margin:auto">

            <h1 style="color:#ff4d6d">
                Welcome to Cupid ❤️
            </h1>

            <p>Hello <strong>${user.name}</strong>,</p>

            <p>
                Thank you for joining Cupid.
            </p>

            <p>
                Your account has been created successfully.
            </p>

            <ul>
                <li>💬 AI Chat</li>
                <li>🧠 Long-term Memory</li>
                <li>🎨 Image Generation</li>
                <li>🎤 Voice Chat</li>
                <li>📂 Chat History</li>
            </ul>

            <p>
                Have fun chatting with Cupid!
            </p>

            <hr>

            <small>
                Cupid AI Team ❤️
            </small>

        </div>
        `,
      });

      console.log("✅ Welcome email sent.");
    } catch (err) {
      console.error("❌ Welcome email failed:", err.message);
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      message: "Account created successfully.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// ==============================
// LOGIN
// ==============================

export const login = async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    console.log("🔐 Login attempt:", email);

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    console.log("👤 User found:", !!user);

    if (!user) {
      console.log("❌ No user found for:", email);

      return res.status(401).json({
        error: "Invalid credentials.",
      });
    }

    console.log("🔑 Password hash exists:", !!user.password);

    const match = await bcrypt.compare(
      password,
      user.password
    );

    console.log("🔍 Password match:", match);

    if (!match) {
      return res.status(401).json({
        error: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log("✅ Login successful:", user.email);

    return res.json({
      message: "Login successful.",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        usage: user.usage,
      },
    });

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// ==============================
// FORGOT PASSWORD
// ==============================

export const forgotPassword = async (req, res) => {
  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        error: "No account found with that email.",
      });
    }

    const resetToken = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: `"Cupid AI ❤️" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Cupid Password Reset",

        html: `
        <div style="font-family:Arial;padding:30px;max-width:600px;margin:auto">

            <h2>Password Reset 🔒</h2>

            <p>Hello <strong>${user.name}</strong>,</p>

            <p>
                Someone requested a password reset for your Cupid account.
            </p>

            <p>
                Click the button below to reset your password.
            </p>

            <a
                href="${resetLink}"
                style="
                    display:inline-block;
                    padding:14px 24px;
                    background:#ff4d6d;
                    color:#fff;
                    text-decoration:none;
                    border-radius:8px;
                "
            >
                Reset Password
            </a>

            <p style="margin-top:25px;">
                If you didn't request this, simply ignore this email.
            </p>

            <hr>

            <small>
                Cupid AI Team ❤️
            </small>

        </div>
        `,
      });

      console.log("✅ Password reset email sent.");
    } catch (err) {
      console.error("❌ Email error:", err.message);
    }

    return res.json({
      success: true,
      message: "Password reset email sent.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// ==============================
// RESET PASSWORD
// ==============================

export const resetPasswordConfirm = async (req, res) => {
  try {
    await connectDB();

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        error: "Reset token has expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        error: "Invalid reset token.",
      });
    }

    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
};

// ==============================
// GET CURRENT USER
// ==============================

export const getCurrentUser = async (req, res) => {
  try {
    await connectDB();

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        usage: user.usage,
        location: user.location,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired.",
      });
    }

    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
};
