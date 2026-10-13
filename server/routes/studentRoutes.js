import express from 'express';
import { 
  getStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  validateFace,
  registerFace 
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

router.route('/face/validate')
  .post(validateFace);

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

router.route('/:id/face/validate')
  .post(validateFace);

router.route('/:id/face/register')
  .post(registerFace);

export default router;
