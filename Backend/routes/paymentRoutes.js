import express from 'express';
import { recordCashPayment, recordUpiPayment } from '../controllers/paymentController.js';
import { verifyToken } from '../auth/auth.js';

const router = express.Router();

router.post('/members/:id/cash', verifyToken, recordCashPayment);
router.post('/members/:id/upi', verifyToken, recordUpiPayment);

export default router;
