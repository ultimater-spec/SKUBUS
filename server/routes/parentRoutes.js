import express from 'express';
import { getParents, getParentById, createParent, updateParent, deleteParent } from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getParents)
  .post(createParent);

router.route('/:id')
  .get(getParentById)
  .put(updateParent)
  .delete(deleteParent);

export default router;
