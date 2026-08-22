import { Router } from 'express';
import {
  getCities,
  getCityById,
  getActivities,
  getFeaturedDestinations,
  getGallery,
  getHierarchy,
} from '../controllers/catalog.controller.js';

const router = Router();

router.get('/cities', getCities);
router.get('/hierarchy', getHierarchy);
router.get('/cities/:id', getCityById);
router.get('/activities', getActivities);
router.get('/featured', getFeaturedDestinations);
router.get('/gallery', getGallery);

export default router;
