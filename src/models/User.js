// src/models/User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFORMATION
    // ==========================================

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

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    // ==========================================
    // LOCATION
    // ==========================================

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

      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    // ==========================================
    // SUBSCRIPTION
    // ==========================================

    subscription: {
      tier: {
        type: String,
        enum: ["free", "plus", "pro"],
        default: "free",
      },

      status: {
        type: String,
        enum: ["active", "expired", "canceled"],
        default: "active",
      },

      startDate: {
        type: Date,
        default: Date.now,
      },

      endDate: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // USAGE
    // ==========================================

    usage: {
      freeMessagesUsed: {
        type: Number,
        default: 0,
      },

      totalMessages: {
        type: Number,
        default: 0,
      },

      totalImagesGenerated: {
        type: Number,
        default: 0,
      },

      totalVoiceMessages: {
        type: Number,
        default: 0,
      },

      lastMessageAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================
    // AI PREFERENCES
    // ==========================================

    aiSettings: {
      personality: {
        type: String,
        default: "friendly",
      },

      responseStyle: {
        type: String,
        enum: ["short", "normal", "detailed"],
        default: "normal",
      },

      language: {
        type: String,
        default: "English",
      },

      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },

      rememberConversations: {
        type: Boolean,
        default: true,
      },
    },

    // ==========================================
    // LONG TERM MEMORY
    // ==========================================

    memory: {
      nickname: {
        type: String,
        default: "",
      },

      birthday: {
        type: String,
        default: "",
      },

      occupation: {
        type: String,
        default: "",
      },

      education: {
        type: String,
        default: "",
      },

      relationshipStatus: {
        type: String,
        default: "",
      },

      favouriteColor: {
        type: String,
        default: "",
      },

      favouriteFood: {
        type: String,
        default: "",
      },

      hobbies: {
        type: [String],
        default: [],
      },

      programmingLanguages: {
        type: [String],
        default: [],
      },

      projects: {
        type: [String],
        default: [],
      },

      goals: {
        type: [String],
        default: [],
      },

      likes: {
        type: [String],
        default: [],
      },

      dislikes: {
        type: [String],
        default: [],
      },

      customFacts: [
        {
          key: String,
          value: String,
        },
      ],
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

UserSchema.index({
  email: 1,
});

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;