import express from 'express';
import { getStaff, getStaffById, createStaff, updateStaff, deleteStaff, getMyStaffProfile } from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Route accessible by staff and admin
router.get('/my-profile', authorize('staff', 'admin'), getMyStaffProfile);

// Routes restricted to admin
router.use(authorize('admin'));

router.route('/')
  .get(getStaff)
  .post(createStaff);

router.route('/:id')
  .get(getStaffById)
  .put(updateStaff)
  .delete(deleteStaff);

export default router;
