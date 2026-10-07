import express from 'express';
import { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(authorize('admin'), createNotification);
  
router.put('/mark-all-read', markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);
  
router.put('/:id/read', markAsRead);

export default router;
