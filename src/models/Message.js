// src/models/Message.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // ✅ NEW: Time and Date fields
  messageDate: {
    type: String, // e.g., "2026-06-30"
  },
  messageTime: {
    type: String, // e.g., "02:30 PM"
  },
  dayOfWeek: {
    type: String, // e.g., "Monday"
  },
  // ✅ NEW: Location fields (populated from IP)
  location: {
    city: { type: String, default: 'Unknown' },
    region: { type: String, default: 'Unknown' },
    country: { type: String, default: 'Unknown' },
    timezone: { type: String, default: 'UTC' },
  },
  sessionId: {
    type: String,
    required: true,
  },
  tokensUsed: {
    type: Number,
    default: 0,
  },
});

// Indexes
MessageSchema.index({ userId: 1, timestamp: -1 });
MessageSchema.index({ sessionId: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);