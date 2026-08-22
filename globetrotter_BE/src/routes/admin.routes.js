import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  createCity,
  updateCity,
  deleteCity,
  createActivity,
  updateActivity,
  deleteActivity,
  getTransactions,
  createTestTransaction,
  getSettings,
  updateSettings,
  testSmtp,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Analytics Dashboard
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Cities CRUD
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);
router.delete('/cities/:id', deleteCity);

// Activities CRUD
router.post('/activities', createActivity);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

// Transactions & Payments
router.get('/transactions', getTransactions);
router.post('/transactions/test-pay', createTestTransaction);

// Settings (SMTP, Payment Gateway, General)
router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.post('/smtp/test', testSmtp);

export default router;
