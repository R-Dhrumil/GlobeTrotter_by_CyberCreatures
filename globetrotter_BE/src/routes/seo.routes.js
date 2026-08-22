import { Router } from 'express';
import { getSeoSettings, updateSeoSettings } from '../controllers/seo.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';

const router = Router();

// Public SEO config for react-helmet-async
router.get('/', getSeoSettings);

// Admin SEO updates
router.post('/', authenticate, authorize('ADMIN'), updateSeoSettings);

export default router;
