// src/routes/authRoutes.js
import express from 'express';
import { 
  signup, 
  login, 
  forgotPassword, 
  resetPasswordConfirm,
  getCurrentUser 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordConfirm);
router.get('/me', getCurrentUser);

export default router;