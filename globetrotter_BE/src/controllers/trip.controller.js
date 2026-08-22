import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

// Helper to generate unique share slug
const generateSlug = (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
};

export const fetchFullTrip = async (tripId) => {
  const tripRes = await db.query(
    `SELECT t.*, 
            json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'photoUrl', u."photoUrl") as user
     FROM "Trip" t
     LEFT JOIN "User" u ON t."userId" = u.id
     WHERE t.id = $1`,
    [tripId]
  );
  if (tripRes.rows.length === 0) return null;
  const trip = tripRes.rows[0];

  const stopsRes = await db.query(
    `SELECT s.*, 
            row_to_json(c.*) as city
     FROM "Stop" s
     JOIN "City" c ON s."cityId" = c.id
     WHERE s."tripId" = $1
     ORDER BY s."orderIndex" ASC`,
    [tripId]
  );
  const stops = stopsRes.rows;

  for (const stop of stops) {
    if (stop.city) {
      const cityActivitiesRes = await db.query(
        `SELECT * FROM "Activity" WHERE "cityId" = $1 ORDER BY "cost" ASC`,
        [stop.city.id]
      );
      stop.city.activities = cityActivitiesRes.rows;
    }

    const activitiesRes = await db.query(
      `SELECT sa.*, 
              row_to_json(a.*) as activity
       FROM "StopActivity" sa
       JOIN "Activity" a ON sa."activityId" = a.id
       WHERE sa."stopId" = $1
       ORDER BY sa."createdAt" ASC`,
      [stop.id]
    );
    stop.activities = activitiesRes.rows;
  }
  trip.stops = stops;

  const budgetsRes = await db.query(
    `SELECT * FROM "Budget" WHERE "tripId" = $1`,
    [tripId]
  );
  trip.budgets = budgetsRes.rows;

  return trip;
};

/**
 * Create a new Trip
 */
export const createTrip = catchAsync(async (req, res) => {
  const { name, startDate, endDate, description, coverPhotoUrl, isPublic } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Trip name is required');
  }

  const shareSlug = generateSlug(name);

  const insertRes = await db.query(
    `INSERT INTO "Trip" (id, "userId", name, "startDate", "endDate", description, "coverPhotoUrl", "isPublic", "shareSlug", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id`,
    [
      req.user.id,
      name.trim(),
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      description || '',
      coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      Boolean(isPublic),
      shareSlug,
    ]
  );

  const trip = await fetchFullTrip(insertRes.rows[0].id);
  return ApiResponse.send(res, 201, { trip }, 'Trip created successfully');
});

/**
 * Get all trips for current logged-in user
 */
export const getMyTrips = catchAsync(async (req, res) => {
  const tripsRes = await db.query(
    `SELECT id FROM "Trip" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
    [req.user.id]
  );

  const trips = [];
  for (const row of tripsRes.rows) {
    const t = await fetchFullTrip(row.id);
    if (t) trips.push(t);
  }

  return ApiResponse.send(res, 200, { trips }, 'User trips retrieved successfully');
});

/**
 * Get single trip by ID (with authorization check or public access)
 */
export const getTripById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const trip = await fetchFullTrip(id);

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  const isOwner = req.user && req.user.id === trip.userId;
  const isAdmin = req.user && req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin && !trip.isPublic) {
    throw new ApiError(403, 'You do not have permission to view this private trip');
  }

  return ApiResponse.send(res, 200, { trip }, 'Trip details retrieved');
});

/**
 * Update trip details
 */
export const updateTrip = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, startDate, endDate, description, coverPhotoUrl, isPublic } = req.body;

  const checkRes = await db.query('SELECT * FROM "Trip" WHERE id = $1', [id]);
  if (checkRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const existingTrip = checkRes.rows[0];

  if (existingTrip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to edit this trip');
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (name) {
    fields.push(`name = $${idx++}`);
    values.push(name.trim());
  }
  if (startDate !== undefined) {
    fields.push(`"startDate" = $${idx++}`);
    values.push(startDate ? new Date(startDate) : null);
  }
  if (endDate !== undefined) {
    fields.push(`"endDate" = $${idx++}`);
    values.push(endDate ? new Date(endDate) : null);
  }
  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }
  if (coverPhotoUrl !== undefined) {
    fields.push(`"coverPhotoUrl" = $${idx++}`);
    values.push(coverPhotoUrl);
  }
  if (isPublic !== undefined) {
    fields.push(`"isPublic" = $${idx++}`);
    values.push(Boolean(isPublic));
  }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = NOW()`);
    values.push(id);
    await db.query(`UPDATE "Trip" SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  }

  const updatedTrip = await fetchFullTrip(id);
  return ApiResponse.send(res, 200, { trip: updatedTrip }, 'Trip updated successfully');
});

/**
 * Delete a trip
 */
export const deleteTrip = catchAsync(async (req, res) => {
  const { id } = req.params;

  const checkRes = await db.query('SELECT * FROM "Trip" WHERE id = $1', [id]);
  if (checkRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const trip = checkRes.rows[0];

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to delete this trip');
  }

  await db.query('DELETE FROM "Trip" WHERE id = $1', [id]);

  return ApiResponse.send(res, 200, null, 'Trip deleted successfully');
});

/**
 * Get Public Shared Trip by Slug (read-only)
 */
export const getPublicTripBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const tripRes = await db.query('SELECT id, "isPublic" FROM "Trip" WHERE "shareSlug" = $1', [slug]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Shared trip not found');
  }
  const meta = tripRes.rows[0];

  if (!meta.isPublic) {
    throw new ApiError(403, 'This trip is marked as private by the author');
  }

  const trip = await fetchFullTrip(meta.id);
  return ApiResponse.send(res, 200, { trip }, 'Shared trip details retrieved');
});

/**
 * Copy/Clone a public or existing trip to current user's trips
 */
export const copyTrip = catchAsync(async (req, res) => {
  const { id } = req.params;

  const sourceTrip = await fetchFullTrip(id);

  if (!sourceTrip) {
    throw new ApiError(404, 'Source trip not found');
  }

  if (!sourceTrip.isPublic && sourceTrip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Cannot copy a private trip');
  }

  const newSlug = generateSlug(`${sourceTrip.name} (Copy)`);

  const clonedRes = await db.query(
    `INSERT INTO "Trip" (id, "userId", name, "startDate", "endDate", description, "coverPhotoUrl", "isPublic", "shareSlug", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id`,
    [
      req.user.id,
      `${sourceTrip.name} (Copy)`,
      sourceTrip.startDate,
      sourceTrip.endDate,
      sourceTrip.description,
      sourceTrip.coverPhotoUrl,
      false,
      newSlug,
    ]
  );
  const newTripId = clonedRes.rows[0].id;

  for (const stop of sourceTrip.stops) {
    const newStopRes = await db.query(
      `INSERT INTO "Stop" (id, "tripId", "cityId", "orderIndex", "arrivalDate", "departureDate", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [newTripId, stop.cityId, stop.orderIndex, stop.arrivalDate, stop.departureDate]
    );
    const newStopId = newStopRes.rows[0].id;

    for (const act of stop.activities || []) {
      await db.query(
        `INSERT INTO "StopActivity" (id, "stopId", "activityId", "scheduledDate", "scheduledTime", notes, "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
        [newStopId, act.activityId, act.scheduledDate, act.scheduledTime, act.notes]
      );
    }
  }

  for (const b of sourceTrip.budgets || []) {
    await db.query(
      `INSERT INTO "Budget" (id, "tripId", category, "estimatedAmount", "actualAmount", notes, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [newTripId, b.category, b.estimatedAmount, b.actualAmount, b.notes]
    );
  }

  const completeTrip = await fetchFullTrip(newTripId);
  return ApiResponse.send(res, 201, { trip: completeTrip }, 'Trip copied to your itinerary!');
});
