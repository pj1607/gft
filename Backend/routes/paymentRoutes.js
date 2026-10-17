import express from 'express';
import {
  createDynamicQrPayment,
  getMemberPendingPayment,
  getPaymentIntentStatus,
  razorpayWebhook,
  recordCashPayment,
  resolvePaymentIntentNoPayment,
} from '../controllers/paymentController.js';
import { verifyToken } from '../auth/auth.js';

const router = express.Router();

router.post('/razorpay/webhook', razorpayWebhook);
router.post('/members/:id/cash', verifyToken, recordCashPayment);
router.post('/members/:id/qr', verifyToken, createDynamicQrPayment);
router.get('/members/:id/pending', verifyToken, getMemberPendingPayment);
router.post('/payment-intents/:id/resolve-no-payment', verifyToken, resolvePaymentIntentNoPayment);
router.get('/payment-intents/:id', verifyToken, getPaymentIntentStatus);

export default router;
