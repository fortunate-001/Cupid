import express from "express";

import {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
  clearConversations,
  renameConversation,
  togglePinConversation,
  clearConversation,
} from "../controllers/chatController.js";

import { authenticate } from "../middleware/authMiddleware.js";

import upload from "../middleware/upload.js";


const router =
  express.Router();


// =========================================
// CHAT
// =========================================

// `image` is the FormData field name

router.post(
  "/send",
  upload.single("image"),
  sendMessage
);


// =========================================
// CONVERSATIONS
// =========================================

router.get(
  "/conversations",
  authenticate,
  getConversations
);


router.get(
  "/conversation/:sessionId",
  authenticate,
  getConversation
);


router.delete(
  "/conversation/:sessionId",
  authenticate,
  deleteConversation
);


router.delete(
  "/conversations",
  authenticate,
  clearConversations
);


// =========================================
// RENAME
// =========================================

router.patch(
  "/conversation/:sessionId/rename",
  authenticate,
  renameConversation
);


// =========================================
// PIN / UNPIN
// =========================================

router.patch(
  "/conversation/:sessionId/pin",
  authenticate,
  togglePinConversation
);


// =========================================
// CLEAR SINGLE CHAT
// =========================================

router.delete(
  "/conversation/:sessionId/clear",
  authenticate,
  clearConversation
);


export default router;