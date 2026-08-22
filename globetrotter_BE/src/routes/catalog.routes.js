import { Router } from 'express';
import {
  getCities,
  getCityById,
  getActivities,
  getFeaturedDestinations,
  getGallery,
  getHierarchy,
  getPublicTrips,
  getCurrencies,
} from '../controllers/catalog.controller.js';

const router = Router();

router.get('/cities', getCities);
router.get('/hierarchy', getHierarchy);
router.get('/currencies', getCurrencies);
router.get('/cities/:id', getCityById);
router.get('/activities', getActivities);
router.get('/featured', getFeaturedDestinations);
router.get('/gallery', getGallery);
router.get('/public-trips', getPublicTrips);

export default router;
