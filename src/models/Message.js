// src/models/Message.js

import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    // --------------------------
    // Image Support
    // --------------------------

    isImage: {
      type: Boolean,
      default: false,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    // --------------------------
    // AI Usage
    // --------------------------

    tokensUsed: {
      type: Number,
      default: 0,
    },

    // --------------------------
    // Time Information
    // --------------------------

    timestamp: {
      type: Date,
      default: Date.now,
    },

    messageDate: {
      type: String,
      default: "",
    },

    messageTime: {
      type: String,
      default: "",
    },

    dayOfWeek: {
      type: String,
      default: "",
    },

    // --------------------------
    // User Location
    // --------------------------

    location: {
      city: {
        type: String,
        default: "Unknown",
      },

      region: {
        type: String,
        default: "Unknown",
      },

      country: {
        type: String,
        default: "Unknown",
      },

      timezone: {
        type: String,
        default: "UTC",
      },
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------
// Indexes
// --------------------------

MessageSchema.index({
  userId: 1,
  timestamp: -1,
});

MessageSchema.index({
  sessionId: 1,
});

const Message =
  mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);

export default Message;