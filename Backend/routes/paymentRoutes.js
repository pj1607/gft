import express from 'express';
import {
  createDynamicQrPayment,
  getPaymentIntentStatus,
  razorpayWebhook,
  recordCashPayment,
} from '../controllers/paymentController.js';
import { verifyToken } from '../auth/auth.js';

const router = express.Router();

router.post('/razorpay/webhook', razorpayWebhook);
router.post('/members/:id/cash', verifyToken, recordCashPayment);
router.post('/members/:id/qr', verifyToken, createDynamicQrPayment);
router.get('/payment-intents/:id', verifyToken, getPaymentIntentStatus);

export default router;
