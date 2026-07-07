// src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // ✅ NEW: User's last known location
  location: {
    city: { type: String, default: 'Unknown' },
    region: { type: String, default: 'Unknown' },
    country: { type: String, default: 'Unknown' },
    timezone: { type: String, default: 'UTC' },
    lastUpdated: { type: Date, default: Date.now },
  },
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'plus', 'pro'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'canceled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
  },
  usage: {
    freeMessagesUsed: {
      type: Number,
      default: 0,
    },
    totalMessages: {
      type: Number,
      default: 0,
    },
    lastMessageAt: Date,
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);