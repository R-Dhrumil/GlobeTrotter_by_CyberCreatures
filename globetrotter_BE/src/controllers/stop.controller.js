import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

const fetchFullStop = async (stopId) => {
  const stopRes = await db.query(
    `SELECT s.*, row_to_json(c.*) as city
     FROM "Stop" s
     JOIN "City" c ON s."cityId" = c.id
     WHERE s.id = $1`,
    [stopId]
  );
  if (stopRes.rows.length === 0) return null;
  const stop = stopRes.rows[0];

  const actRes = await db.query(
    `SELECT sa.*, row_to_json(a.*) as activity
     FROM "StopActivity" sa
     JOIN "Activity" a ON sa."activityId" = a.id
     WHERE sa."stopId" = $1
     ORDER BY sa."createdAt" ASC`,
    [stopId]
  );
  stop.activities = actRes.rows;
  return stop;
};

/**
 * Add a stop/city to a trip
 */
export const addStop = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const { cityId, arrivalDate, departureDate, orderIndex } = req.body;

  if (!cityId) {
    throw new ApiError(400, 'City ID is required');
  }

  const tripRes = await db.query('SELECT * FROM "Trip" WHERE id = $1', [tripId]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const trip = tripRes.rows[0];

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to add stops to this trip');
  }

  let finalOrderIndex = orderIndex;
  if (finalOrderIndex === undefined) {
    const countRes = await db.query('SELECT COUNT(*)::int as count FROM "Stop" WHERE "tripId" = $1', [tripId]);
    finalOrderIndex = countRes.rows[0].count;
  }

  const insertRes = await db.query(
    `INSERT INTO "Stop" (id, "tripId", "cityId", "orderIndex", "arrivalDate", "departureDate", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
     RETURNING id`,
    [
      tripId,
      cityId,
      finalOrderIndex,
      arrivalDate ? new Date(arrivalDate) : null,
      departureDate ? new Date(departureDate) : null,
    ]
  );

  const stop = await fetchFullStop(insertRes.rows[0].id);
  return ApiResponse.send(res, 201, { stop }, 'Stop added to trip successfully');
});

/**
 * Update a stop (dates, city)
 */
export const updateStop = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { cityId, arrivalDate, departureDate, orderIndex } = req.body;

  const stopRes = await db.query(
    `SELECT s.*, t."userId" as "tripUserId" FROM "Stop" s JOIN "Trip" t ON s."tripId" = t.id WHERE s.id = $1`,
    [id]
  );
  if (stopRes.rows.length === 0) {
    throw new ApiError(404, 'Stop not found');
  }
  const existingStop = stopRes.rows[0];

  if (existingStop.tripUserId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to edit this stop');
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (cityId) {
    fields.push(`"cityId" = $${idx++}`);
    values.push(cityId);
  }
  if (arrivalDate !== undefined) {
    fields.push(`"arrivalDate" = $${idx++}`);
    values.push(arrivalDate ? new Date(arrivalDate) : null);
  }
  if (departureDate !== undefined) {
    fields.push(`"departureDate" = $${idx++}`);
    values.push(departureDate ? new Date(departureDate) : null);
  }
  if (orderIndex !== undefined) {
    fields.push(`"orderIndex" = $${idx++}`);
    values.push(orderIndex);
  }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = NOW()`);
    values.push(id);
    await db.query(`UPDATE "Stop" SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  }

  const updatedStop = await fetchFullStop(id);
  return ApiResponse.send(res, 200, { stop: updatedStop }, 'Stop updated successfully');
});

/**
 * Delete a stop
 */
export const deleteStop = catchAsync(async (req, res) => {
  const { id } = req.params;

  const stopRes = await db.query(
    `SELECT s.*, t."userId" as "tripUserId" FROM "Stop" s JOIN "Trip" t ON s."tripId" = t.id WHERE s.id = $1`,
    [id]
  );
  if (stopRes.rows.length === 0) {
    throw new ApiError(404, 'Stop not found');
  }
  const stop = stopRes.rows[0];

  if (stop.tripUserId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to delete this stop');
  }

  await db.query('DELETE FROM "Stop" WHERE id = $1', [id]);

  const remainingRes = await db.query(
    'SELECT id FROM "Stop" WHERE "tripId" = $1 ORDER BY "orderIndex" ASC',
    [stop.tripId]
  );

  for (let i = 0; i < remainingRes.rows.length; i++) {
    await db.query('UPDATE "Stop" SET "orderIndex" = $1, "updatedAt" = NOW() WHERE id = $2', [i, remainingRes.rows[i].id]);
  }

  return ApiResponse.send(res, 200, null, 'Stop removed from itinerary');
});

/**
 * Reorder stops in a trip (Drag & Drop support)
 */
export const reorderStops = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const { stopIds } = req.body;

  if (!Array.isArray(stopIds)) {
    throw new ApiError(400, 'stopIds must be an array of IDs');
  }

  const tripRes = await db.query('SELECT * FROM "Trip" WHERE id = $1', [tripId]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const trip = tripRes.rows[0];

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to reorder stops for this trip');
  }

  for (let i = 0; i < stopIds.length; i++) {
    await db.query('UPDATE "Stop" SET "orderIndex" = $1, "updatedAt" = NOW() WHERE id = $2 AND "tripId" = $3', [i, stopIds[i], tripId]);
  }

  const stopsRes = await db.query('SELECT id FROM "Stop" WHERE "tripId" = $1 ORDER BY "orderIndex" ASC', [tripId]);
  const updatedStops = [];
  for (const r of stopsRes.rows) {
    const s = await fetchFullStop(r.id);
    if (s) updatedStops.push(s);
  }

  return ApiResponse.send(res, 200, { stops: updatedStops }, 'Stops reordered successfully');
});
