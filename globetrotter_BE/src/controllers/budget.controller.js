import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get full budget breakdown and analytics for a trip
 */
export const getTripBudgets = catchAsync(async (req, res) => {
  const { tripId } = req.params;

  const tripRes = await db.query('SELECT * FROM "Trip" WHERE id = $1', [tripId]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const trip = tripRes.rows[0];

  const budgetsRes = await db.query('SELECT * FROM "Budget" WHERE "tripId" = $1', [tripId]);
  const budgets = budgetsRes.rows;

  const actRes = await db.query(
    `SELECT a.cost
     FROM "Stop" s
     JOIN "StopActivity" sa ON s.id = sa."stopId"
     JOIN "Activity" a ON sa."activityId" = a.id
     WHERE s."tripId" = $1`,
    [tripId]
  );

  const estimatedTotal = budgets.reduce((acc, b) => acc + (parseFloat(b.estimatedAmount) || 0), 0);
  const actualTotal = budgets.reduce((acc, b) => acc + (parseFloat(b.actualAmount) || 0), 0);

  let activityEstimatedTotal = actRes.rows.reduce((acc, row) => acc + (parseFloat(row.cost) || 0), 0);

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
      budgets,
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

  const tripRes = await db.query('SELECT * FROM "Trip" WHERE id = $1', [tripId]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const trip = tripRes.rows[0];

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to edit budget for this trip');
  }

  const existingRes = await db.query('SELECT * FROM "Budget" WHERE "tripId" = $1 AND category = $2', [tripId, category]);

  let budget;
  if (existingRes.rows.length > 0) {
    const existing = existingRes.rows[0];
    const fields = [];
    const values = [];
    let idx = 1;

    if (estimatedAmount !== undefined) {
      fields.push(`"estimatedAmount" = $${idx++}`);
      values.push(parseFloat(estimatedAmount));
    }
    if (actualAmount !== undefined) {
      fields.push(`"actualAmount" = $${idx++}`);
      values.push(parseFloat(actualAmount));
    }
    if (notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(notes);
    }

    if (fields.length > 0) {
      fields.push(`"updatedAt" = NOW()`);
      values.push(existing.id);
      const updateRes = await db.query(`UPDATE "Budget" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
      budget = updateRes.rows[0];
    } else {
      budget = existing;
    }
  } else {
    const insertRes = await db.query(
      `INSERT INTO "Budget" (id, "tripId", category, "estimatedAmount", "actualAmount", notes, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        tripId,
        category,
        estimatedAmount ? parseFloat(estimatedAmount) : 0,
        actualAmount ? parseFloat(actualAmount) : 0,
        notes || '',
      ]
    );
    budget = insertRes.rows[0];
  }

  return ApiResponse.send(res, 200, { budget }, 'Budget category saved');
});

/**
 * Delete a budget category
 */
export const deleteBudget = catchAsync(async (req, res) => {
  const { id } = req.params;

  const bRes = await db.query(
    `SELECT b.*, t."userId" as "tripUserId" FROM "Budget" b JOIN "Trip" t ON b."tripId" = t.id WHERE b.id = $1`,
    [id]
  );

  if (bRes.rows.length === 0) {
    throw new ApiError(404, 'Budget record not found');
  }
  const budget = bRes.rows[0];

  if (budget.tripUserId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to delete this budget entry');
  }

  await db.query('DELETE FROM "Budget" WHERE id = $1', [id]);

  return ApiResponse.send(res, 200, null, 'Budget entry removed');
});
