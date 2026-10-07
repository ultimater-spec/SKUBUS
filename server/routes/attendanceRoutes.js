import express from 'express';
import { getAttendance, getAttendanceById, markAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(authorize('admin', 'staff'), markAttendance);

router.route('/:id')
  .get(getAttendanceById)
  .put(authorize('admin'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

export default router;
