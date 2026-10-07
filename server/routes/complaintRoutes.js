import express from 'express';
import { getComplaints, getComplaintById, createComplaint, updateComplaint, deleteComplaint } from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(createComplaint);

router.route('/:id')
  .get(getComplaintById)
  .put(authorize('admin'), updateComplaint)
  .delete(authorize('admin'), deleteComplaint);

export default router;
