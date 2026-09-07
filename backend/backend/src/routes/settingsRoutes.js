// src/routes/settingsRoutes.js

import express from "express";

import {
  getSettings,
  updateSettings,
  updateProfile,
} from "../controllers/settingsController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================================
// GET SETTINGS
// =========================================

router.get(
  "/",
  authMiddleware,
  getSettings
);

// =========================================
// UPDATE SETTINGS
// =========================================

router.put(
  "/",
  authMiddleware,
  updateSettings
);

// =========================================
// UPDATE PROFILE
// =========================================

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

export default router;