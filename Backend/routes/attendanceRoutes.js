import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getGymInfo,
  checkInMember,
  getAttendance,
} from '../controllers/attendanceController.js';
import { verifyToken } from '../auth/auth.js';

const router = express.Router();

const checkInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

router.get('/gym-info', verifyToken, getGymInfo);
router.get('/', verifyToken, getAttendance);
router.post('/check-in/:ownerId', checkInLimiter, checkInMember);

export default router;
