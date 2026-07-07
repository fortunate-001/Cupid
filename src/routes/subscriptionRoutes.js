// src/routes/subscriptionRoutes.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getStatus,
  upgradePlus,
  upgradePro,
  cancelSubscription,
  simulatePayment
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/status', authenticate, getStatus);
router.post('/upgrade-plus', authenticate, upgradePlus);
router.post('/upgrade-pro', authenticate, upgradePro);
router.post('/cancel', authenticate, cancelSubscription);
router.post('/simulate-payment', authenticate, simulatePayment);

export default router;