import express from 'express';
import { 
  getTickets, 
  getTicketById, 
  createTicket, 
  replyTicket, 
  updateTicketStatus 
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id/reply')
  .post(replyTicket);

router.route('/:id/status')
  .put(updateTicketStatus);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicketStatus);

export default router;
