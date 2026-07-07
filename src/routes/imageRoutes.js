// src/routes/imageRoutes.js
import express from 'express';
import { generateImageController, removeBackgroundController } from '../controllers/imageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', authenticate, generateImageController);
router.post('/remove-bg', authenticate, removeBackgroundController);

export default router;