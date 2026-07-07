// src/routes/voiceRoutes.js
import express from 'express';
import multer from 'multer';
import { 
  speechToTextController, 
  textToSpeechController,
  voiceChatController 
} from '../controllers/voiceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/speech-to-text', authenticate, upload.single('audio'), speechToTextController);
router.post('/text-to-speech', authenticate, textToSpeechController);
router.post('/voice-chat', authenticate, upload.single('audio'), voiceChatController);

export default router;