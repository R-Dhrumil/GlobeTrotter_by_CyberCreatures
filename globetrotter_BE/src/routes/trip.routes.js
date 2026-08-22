import { Router } from 'express';
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getPublicTripBySlug,
  copyTrip,
  makeTripPublic,
} from '../controllers/trip.controller.js';
import { addStop, updateStop, deleteStop, reorderStops } from '../controllers/stop.controller.js';
import { addStopActivity, updateStopActivity, deleteStopActivity } from '../controllers/activity.controller.js';
import { getTripBudgets, upsertBudgetCategory, deleteBudget } from '../controllers/budget.controller.js';
import {
  enableGroupTrip,
  getInviteLink,
  joinGroupTrip,
  validateInviteToken,
  getGroupMembers,
  removeGroupMember,
  addGroupExpense,
  getGroupExpenses,
  deleteGroupExpense,
  getGroupSettlement,
} from '../controllers/group.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public shared route
router.get('/share/:slug', getPublicTripBySlug);

// All following routes require authentication
router.use(authenticate);

router.post('/', createTrip);
router.get('/my', getMyTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.put('/:id/public', makeTripPublic);
router.delete('/:id', deleteTrip);
router.post('/:id/copy', copyTrip);

// Stops on a trip
router.post('/:tripId/stops', addStop);
router.put('/stops/:id', updateStop);
router.delete('/stops/:id', deleteStop);
router.put('/:tripId/stops/reorder', reorderStops);

// Stop Activities
router.post('/stops/:stopId/activities', addStopActivity);
router.put('/activities/:id', updateStopActivity);
router.delete('/activities/:id', deleteStopActivity);

// Trip Budget
router.get('/:tripId/budget', getTripBudgets);
router.post('/:tripId/budget', upsertBudgetCategory);
router.delete('/budget/:id', deleteBudget);

// Group Travel
router.post('/:tripId/group/enable', enableGroupTrip);
router.get('/:tripId/group/invite-link', getInviteLink);
router.post('/group/join/:token', joinGroupTrip);
router.get('/group/validate/:token', validateInviteToken);
router.get('/:tripId/group/members', getGroupMembers);
router.delete('/:tripId/group/members/:userId', removeGroupMember);
router.post('/:tripId/group/expenses', addGroupExpense);
router.get('/:tripId/group/expenses', getGroupExpenses);
router.delete('/:tripId/group/expenses/:expenseId', deleteGroupExpense);
router.get('/:tripId/group/settlement', getGroupSettlement);

export default router;

