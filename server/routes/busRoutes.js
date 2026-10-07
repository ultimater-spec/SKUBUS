import express from 'express';
import { getBuses, getBusById, createBus, updateBus, deleteBus } from '../controllers/busController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getBuses)
  .post(createBus);

router.route('/:id')
  .get(getBusById)
  .put(updateBus)
  .delete(deleteBus);

export default router;
