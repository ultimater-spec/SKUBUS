import express from 'express';
import {
  getDashboardStats,
  getAttendanceOverview,
  getRecentAttendance,
  getRecentComplaints,
  getNotifications,
  getBusOverview
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and admin role check to all dashboard routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/attendance-overview', getAttendanceOverview);
router.get('/recent-attendance', getRecentAttendance);
router.get('/recent-complaints', getRecentComplaints);
router.get('/notifications', getNotifications);
router.get('/buses', getBusOverview);

export default router;
