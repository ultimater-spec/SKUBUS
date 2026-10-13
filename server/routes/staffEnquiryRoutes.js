import express from 'express';
import { 
  getEnquiries, 
  getEnquiryById, 
  createEnquiry, 
  replyEnquiry, 
  escalateEnquiry, 
  updateEnquiryStatus 
} from '../controllers/staffEnquiryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEnquiries)
  .post(createEnquiry);

router.route('/:id/reply')
  .post(replyEnquiry);

router.route('/:id/escalate')
  .put(escalateEnquiry)
  .post(escalateEnquiry);

router.route('/:id/status')
  .put(updateEnquiryStatus);

router.route('/:id')
  .get(getEnquiryById);

export default router;
