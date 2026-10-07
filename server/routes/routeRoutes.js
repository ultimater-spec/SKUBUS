import express from 'express';
import { getRoutes, getRouteById, createRoute, updateRoute, deleteRoute } from '../controllers/routeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getRoutes)
  .post(createRoute);

router.route('/:id')
  .get(getRouteById)
  .put(updateRoute)
  .delete(deleteRoute);

export default router;
