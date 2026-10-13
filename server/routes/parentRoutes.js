import express from 'express';
import { getParents, getParentById, createParent, updateParent, deleteParent, getMyParentProfile, getAssignedStaff } from '../controllers/parentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Routes accessible by parents (and admins)
router.get('/my-profile', authorize('parent', 'admin'), getMyParentProfile);
router.get('/assigned-staff', authorize('parent', 'admin'), getAssignedStaff);

// Routes restricted to admins
router.use(authorize('admin'));

router.route('/')
  .get(getParents)
  .post(createParent);

router.route('/:id')
  .get(getParentById)
  .put(updateParent)
  .delete(deleteParent);

export default router;
