import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get full budget breakdown and analytics for a trip
 */
export const getTripBudgets = catchAsync(async (req, res) => {
  const { tripId } = req.params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      budgets: true,
      stops: {
        include: {
          activities: {
            include: { activity: true },
          },
        },
      },
    },
  });

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  // Calculate totals
  const estimatedTotal = trip.budgets.reduce((acc, b) => acc + (b.estimatedAmount || 0), 0);
  const actualTotal = trip.budgets.reduce((acc, b) => acc + (b.actualAmount || 0), 0);

  // Calculate activity catalog estimated sum
  let activityEstimatedTotal = 0;
  trip.stops.forEach((s) => {
    s.activities.forEach((sa) => {
      activityEstimatedTotal += sa.activity?.cost || 0;
    });
  });

  // Calculate day count
  let dayCount = 1;
  if (trip.startDate && trip.endDate) {
    const diffTime = Math.abs(new Date(trip.endDate) - new Date(trip.startDate));
    dayCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const averageCostPerDay = dayCount > 0 ? (actualTotal || estimatedTotal) / dayCount : 0;
  const isOverBudget = actualTotal > estimatedTotal && estimatedTotal > 0;
  const overBudgetPercent = estimatedTotal > 0 ? (((actualTotal - estimatedTotal) / estimatedTotal) * 100).toFixed(1) : 0;

  return ApiResponse.send(
    res,
    200,
    {
      budgets: trip.budgets,
      summary: {
        estimatedTotal,
        actualTotal,
        activityEstimatedTotal,
        dayCount,
        averageCostPerDay: Number(averageCostPerDay.toFixed(2)),
        isOverBudget,
        overBudgetPercent: Number(overBudgetPercent),
        currency: 'USD',
      },
    },
    'Trip budget summary retrieved'
  );
});

/**
 * Upsert or update a budget category item
 */
export const upsertBudgetCategory = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const { category, estimatedAmount, actualAmount, notes } = req.body;

  if (!category) {
    throw new ApiError(400, 'Budget category is required');
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to edit budget for this trip');
  }

  // Find existing budget for this category or create new
  const existing = await prisma.budget.findFirst({
    where: {
      tripId,
      category,
    },
  });

  let budget;
  if (existing) {
    budget = await prisma.budget.update({
      where: { id: existing.id },
      data: {
        ...(estimatedAmount !== undefined && { estimatedAmount: parseFloat(estimatedAmount) }),
        ...(actualAmount !== undefined && { actualAmount: parseFloat(actualAmount) }),
        ...(notes !== undefined && { notes }),
      },
    });
  } else {
    budget = await prisma.budget.create({
      data: {
        tripId,
        category,
        estimatedAmount: estimatedAmount ? parseFloat(estimatedAmount) : 0,
        actualAmount: actualAmount ? parseFloat(actualAmount) : 0,
        notes: notes || '',
      },
    });
  }

  return ApiResponse.send(res, 200, { budget }, 'Budget category saved');
});

/**
 * Delete a budget category
 */
export const deleteBudget = catchAsync(async (req, res) => {
  const { id } = req.params;

  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { trip: true },
  });

  if (!budget) {
    throw new ApiError(404, 'Budget record not found');
  }

  if (budget.trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to delete this budget entry');
  }

  await prisma.budget.delete({ where: { id } });

  return ApiResponse.send(res, 200, null, 'Budget entry removed');
});
