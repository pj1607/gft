import express from 'express';
import {
    allMembers,
    addMember,
    updatePaymentStatus,
    deleteMember,undoPaymentStatus ,getMemberSummary,updateMember
} from '../controllers/memberController.js';
import { verifyToken } from '../auth/auth.js';

const router = express.Router();

router.get('/summary',verifyToken, getMemberSummary);
 
router.get('/all-members', verifyToken,allMembers);               
router.post('/add-member',verifyToken, addMember);           
router.put('/:id/pay',verifyToken, updatePaymentStatus);
router.put('/:id/undo',verifyToken, undoPaymentStatus );
router.delete('/:id',verifyToken, deleteMember);    

router.put('/:id',verifyToken, updateMember);

export default router;
