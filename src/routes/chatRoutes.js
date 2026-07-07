import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation
} from '../controllers/chatController.js';

const router = express.Router();

// Allow guests and logged-in users
router.post('/send', sendMessage);

// Logged-in users only
router.get('/conversations', authenticate, getConversations);
router.get('/conversation/:sessionId', authenticate, getConversation);
router.delete('/conversation/:sessionId', authenticate, deleteConversation);

export default router;