import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =========================================
    // PASSWORD
    // Google users won't necessarily have one
    // =========================================

    password: {
      type: String,
      select: false,
      default: null,
    },

    // =========================================
    // GOOGLE AUTH
    // =========================================

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: {
      type: String,
      default: "",
    },

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

      lastUpdated: Date,
    },

    // =========================================
    // SUBSCRIPTION
    // =========================================

    subscription: {
      tier: {
        type: String,
        enum: ["free", "plus", "pro"],
        default: "free",
      },

      status: {
        type: String,
        enum: [
          "active",
          "expired",
          "cancelled",
        ],
        default: "active",
      },

      startDate: {
        type: Date,
        default: Date.now,
      },

      endDate: Date,
    },

    // =========================================
    // USAGE
    // =========================================

    usage: {
      messages: {
        type: Number,
        default: 0,
      },

      images: {
        type: Number,
        default: 0,
      },

      voice: {
        type: Number,
        default: 0,
      },

      totalMessages: {
        type: Number,
        default: 0,
      },

      freeMessagesUsed: {
        type: Number,
        default: 0,
      },

      lastMessageAt: Date,
    },

    // =========================================
    // AI SETTINGS
    // =========================================

    aiSettings: {
      personality: {
        type: String,
        enum: [
          "friendly",
          "professional",
          "casual",
          "creative",
        ],
        default: "friendly",
      },

      responseStyle: {
        type: String,
        enum: [
          "short",
          "normal",
          "detailed",
        ],
        default: "normal",
      },

      language: {
        type: String,
        default: "English",
      },

      rememberConversations: {
        type: Boolean,
        default: true,
      },

      voiceGender: {
        type: String,
        enum: ["female", "male"],
        default: "female",
      },

      voiceEnabled: {
        type: Boolean,
        default: true,
      },
    },

    // =========================================
    // ACCOUNT
    // =========================================

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    refreshToken: String,

    lastLogin: Date,

    lastSeen: Date,
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.index({
  email: 1,
});

export default
  mongoose.models.User ||
  mongoose.model(
    "User",
    UserSchema
  );