import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

const fetchFullStopActivity = async (saId) => {
  const res = await db.query(
    `SELECT sa.*, row_to_json(a.*) as activity
     FROM "StopActivity" sa
     JOIN "Activity" a ON sa."activityId" = a.id
     WHERE sa.id = $1`,
    [saId]
  );
  return res.rows[0] || null;
};

/**
 * Add an activity to a specific stop
 */
export const addStopActivity = catchAsync(async (req, res) => {
  const { stopId } = req.params;
  const { activityId, scheduledDate, scheduledTime, notes } = req.body;

  if (!activityId) {
    throw new ApiError(400, 'Activity ID is required');
  }

  const stopRes = await db.query(
    `SELECT s.*, t."userId" as "tripUserId" FROM "Stop" s JOIN "Trip" t ON s."tripId" = t.id WHERE s.id = $1`,
    [stopId]
  );

  if (stopRes.rows.length === 0) {
    throw new ApiError(404, 'Stop not found');
  }
  const stop = stopRes.rows[0];

  if (stop.tripUserId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to add activities to this stop');
  }

  const insertRes = await db.query(
    `INSERT INTO "StopActivity" (id, "stopId", "activityId", "scheduledDate", "scheduledTime", notes, "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
     RETURNING id`,
    [
      stopId,
      activityId,
      scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime || '',
      notes || '',
    ]
  );

  const stopActivity = await fetchFullStopActivity(insertRes.rows[0].id);
  return ApiResponse.send(res, 201, { stopActivity }, 'Activity added to stop');
});

/**
 * Update a scheduled stop activity (notes, time, date)
 */
export const updateStopActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { scheduledDate, scheduledTime, notes } = req.body;

  const saRes = await db.query(
    `SELECT sa.*, t."userId" as "tripUserId"
     FROM "StopActivity" sa
     JOIN "Stop" s ON sa."stopId" = s.id
     JOIN "Trip" t ON s."tripId" = t.id
     WHERE sa.id = $1`,
    [id]
  );

  if (saRes.rows.length === 0) {
    throw new ApiError(404, 'Stop activity item not found');
  }
  const stopActivity = saRes.rows[0];

  if (stopActivity.tripUserId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to update this activity');
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (scheduledDate !== undefined) {
    fields.push(`"scheduledDate" = $${idx++}`);
    values.push(scheduledDate ? new Date(scheduledDate) : null);
  }
  if (scheduledTime !== undefined) {
    fields.push(`"scheduledTime" = $${idx++}`);
    values.push(scheduledTime);
  }
  if (notes !== undefined) {
    fields.push(`notes = $${idx++}`);
    values.push(notes);
  }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = NOW()`);
    values.push(id);
    await db.query(`UPDATE "StopActivity" SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  }

  const updated = await fetchFullStopActivity(id);
  return ApiResponse.send(res, 200, { stopActivity: updated }, 'Activity schedule updated');
});

/**
 * Remove an activity from a stop
 */
export const deleteStopActivity = catchAsync(async (req, res) => {
  const { id } = req.params;

  const saRes = await db.query(
    `SELECT sa.*, t."userId" as "tripUserId"
     FROM "StopActivity" sa
     JOIN "Stop" s ON sa."stopId" = s.id
     JOIN "Trip" t ON s."tripId" = t.id
     WHERE sa.id = $1`,
    [id]
  );

  if (saRes.rows.length === 0) {
    throw new ApiError(404, 'Stop activity not found');
  }
  const stopActivity = saRes.rows[0];

  if (stopActivity.tripUserId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to remove this activity');
  }

  await db.query('DELETE FROM "StopActivity" WHERE id = $1', [id]);

  return ApiResponse.send(res, 200, null, 'Activity removed from stop');
});
