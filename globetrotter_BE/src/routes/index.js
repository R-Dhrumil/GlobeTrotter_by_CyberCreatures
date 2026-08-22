import { Router } from 'express';
import authRoutes from './auth.routes.js';
import tripRoutes from './trip.routes.js';
import catalogRoutes from './catalog.routes.js';
import contactRoutes from './contact.routes.js';
import adminRoutes from './admin.routes.js';
import seoRoutes from './seo.routes.js';
import uploadRoutes from './upload.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/catalog', catalogRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);
router.use('/seo', seoRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);

export default router;
