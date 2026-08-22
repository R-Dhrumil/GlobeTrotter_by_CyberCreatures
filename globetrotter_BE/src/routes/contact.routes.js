import { Router } from 'express';
import {
  submitContact,
  getContactMessages,
  markMessageRead,
  deleteMessage,
} from '../controllers/contact.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';

const router = Router();

// Public submission
router.post('/', submitContact);

// Admin-only message views & actions
router.get('/messages', authenticate, authorize('ADMIN'), getContactMessages);
router.patch('/messages/:id/read', authenticate, authorize('ADMIN'), markMessageRead);
router.delete('/messages/:id', authenticate, authorize('ADMIN'), deleteMessage);

export default router;
