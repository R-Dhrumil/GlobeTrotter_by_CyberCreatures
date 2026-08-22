import { Router } from 'express';
import {
  getCities,
  getCityById,
  getActivities,
  getFeaturedDestinations,
  getGallery,
  getHierarchy,
  getPublicTrips,
  toggleLike,
  toggleSaveTrip,
} from '../controllers/catalog.controller.js';
import { authenticate, softAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/cities', getCities);
router.get('/hierarchy', getHierarchy);
router.get('/cities/:id', getCityById);
router.get('/activities', getActivities);
router.get('/featured', getFeaturedDestinations);
router.get('/gallery', softAuthenticate, getGallery);
router.get('/public-trips', getPublicTrips);

// Protected social endpoints
router.post('/gallery/like', authenticate, toggleLike);
router.post('/gallery/save', authenticate, toggleSaveTrip);

export default router;
