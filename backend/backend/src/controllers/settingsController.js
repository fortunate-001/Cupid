// src/controllers/settingsController.js

import connectDB from "../../lib/mongodb.js";
import User from "../models/User.js";

// =========================================
// FORMAT SETTINGS
// =========================================

const formatSettings = (user) => {
  return {
    name: user.name || "",

    email: user.email || "",

    avatar: user.avatar || "",

    aiSettings: {
      personality:
        user.aiSettings?.personality ||
        "friendly",

      responseStyle:
        user.aiSettings?.responseStyle ||
        "normal",

      language:
        user.aiSettings?.language ||
        "English",

      rememberConversations:
        user.aiSettings
          ?.rememberConversations ??
        true,

      voiceGender:
        user.aiSettings?.voiceGender ||
        "female",

      voiceEnabled:
        user.aiSettings
          ?.voiceEnabled ??
        true,

      theme:
        user.aiSettings?.theme ||
        "system",
    },

    subscription: {
      tier:
        user.subscription?.tier ||
        "free",

      status:
        user.subscription?.status ||
        "active",
    },
  };
};

// =========================================
// GET SETTINGS
// =========================================

export const getSettings = async (
  req,
  res
) => {
  try {
    await connectDB();

    if (!req.user) {
      return res.status(401).json({
        error:
          "Authentication required.",
      });
    }

    const user =
      await User.findById(
        req.user._id
      ).lean();

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.json({
      success: true,

      settings:
        formatSettings(user),
    });
  } catch (error) {
    console.error(
      "❌ Get settings error:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to load settings.",
    });
  }
};

// =========================================
// UPDATE SETTINGS
// =========================================

export const updateSettings = async (
  req,
  res
) => {
  try {
    await connectDB();

    if (!req.user) {
      return res.status(401).json({
        error:
          "Authentication required.",
      });
    }

    const {
      personality,
      responseStyle,
      language,
      rememberConversations,
      voiceGender,
      voiceEnabled,
      theme,
    } = req.body;

    const update = {};

    // =========================================
    // PERSONALITY
    // =========================================

    if (
      personality !== undefined
    ) {
      const allowed = [
        "friendly",
        "professional",
        "casual",
        "creative",
      ];

      if (
        !allowed.includes(
          personality
        )
      ) {
        return res.status(400).json({
          error:
            "Invalid personality.",
        });
      }

      update[
        "aiSettings.personality"
      ] = personality;
    }

    // =========================================
    // RESPONSE STYLE
    // =========================================

    if (
      responseStyle !== undefined
    ) {
      const allowed = [
        "short",
        "normal",
        "detailed",
      ];

      if (
        !allowed.includes(
          responseStyle
        )
      ) {
        return res.status(400).json({
          error:
            "Invalid response style.",
        });
      }

      update[
        "aiSettings.responseStyle"
      ] = responseStyle;
    }

    // =========================================
    // LANGUAGE
    // =========================================

    if (
      language !== undefined
    ) {
      update[
        "aiSettings.language"
      ] = language;
    }

    // =========================================
    // MEMORY
    // =========================================

    if (
      rememberConversations !==
      undefined
    ) {
      update[
        "aiSettings.rememberConversations"
      ] = Boolean(
        rememberConversations
      );
    }

    // =========================================
    // VOICE GENDER
    // =========================================

    if (
      voiceGender !== undefined
    ) {
      const allowed = [
        "female",
        "male",
      ];

      if (
        !allowed.includes(
          voiceGender
        )
      ) {
        return res.status(400).json({
          error:
            "Voice must be either male or female.",
        });
      }

      update[
        "aiSettings.voiceGender"
      ] = voiceGender;
    }

    // =========================================
    // VOICE ENABLED
    // =========================================

    if (
      voiceEnabled !== undefined
    ) {
      update[
        "aiSettings.voiceEnabled"
      ] = Boolean(
        voiceEnabled
      );
    }

    // =========================================
    // THEME
    // =========================================

    if (
      theme !== undefined
    ) {
      const allowed = [
        "system",
        "light",
        "dark",
      ];

      if (!allowed.includes(theme)) {
        return res.status(400).json({
          error:
            "Invalid theme.",
        });
      }

      update[
        "aiSettings.theme"
      ] = theme;
    }

    // =========================================
    // NOTHING TO UPDATE
    // =========================================

    if (
      Object.keys(update)
        .length === 0
    ) {
      return res.status(400).json({
        error:
          "No valid settings were provided.",
      });
    }

    // =========================================
    // UPDATE DATABASE
    // =========================================

    const updatedUser =
      await User.findByIdAndUpdate(
        req.user._id,

        {
          $set: update,
        },

        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!updatedUser) {
      return res.status(404).json({
        error:
          "User not found.",
      });
    }

    return res.json({
      success: true,

      settings:
        formatSettings(
          updatedUser
        ),
    });
  } catch (error) {
    console.error(
      "❌ Update settings error:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to update settings.",
    });
  }
};

// =========================================
// UPDATE PROFILE
// =========================================

export const updateProfile = async (
  req,
  res
) => {
  try {
    await connectDB();

    if (!req.user) {
      return res.status(401).json({
        error:
          "Authentication required.",
      });
    }

    const {
      name,
      avatar,
    } = req.body;

    const update = {};

    // =========================================
    // NAME
    // =========================================

    if (
      name !== undefined
    ) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          error:
            "Name cannot be empty.",
        });
      }

      update.name =
        name.trim();
    }

    // =========================================
    // AVATAR
    // =========================================

    if (
      avatar !== undefined
    ) {
      update.avatar =
        avatar;
    }

    if (
      Object.keys(update)
        .length === 0
    ) {
      return res.status(400).json({
        error:
          "No profile information was provided.",
      });
    }

    // =========================================
    // UPDATE
    // =========================================

    const updatedUser =
      await User.findByIdAndUpdate(
        req.user._id,

        {
          $set: update,
        },

        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!updatedUser) {
      return res.status(404).json({
        error:
          "User not found.",
      });
    }

    return res.json({
      success: true,

      user: {
        name:
          updatedUser.name,

        email:
          updatedUser.email,

        avatar:
          updatedUser.avatar ||
          "",
      },
    });
  } catch (error) {
    console.error(
      "❌ Update profile error:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to update profile.",
    });
  }
};

// =========================================
// DEFAULT EXPORT
// =========================================

export default {
  getSettings,
  updateSettings,
  updateProfile,
};