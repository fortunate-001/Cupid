// src/models/Memory.js

import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
  {
    // Owner of this memory
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Example:
    // birthday
    // favorite_color
    // girlfriend_name
    // programming_language
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Example:
    // July 5
    // Blue
    // Ada
    value: {
      type: String,
      required: true,
      trim: true,
    },

    // preference
    // personal
    // work
    // education
    // relationship
    // project
    // custom
    category: {
      type: String,
      default: "general",
    },

    // 1 - 10
    importance: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },

    // How many times Cupid has used this memory
    accessCount: {
      type: Number,
      default: 0,
    },

    lastAccessed: {
      type: Date,
      default: null,
    },

    sourceMessage: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate memories like:
// birthday -> July 5
MemorySchema.index(
  {
    userId: 1,
    key: 1,
  },
  {
    unique: true,
  }
);

const Memory =
  mongoose.models.Memory ||
  mongoose.model("Memory", MemorySchema);

export default Memory;