import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

/**
 * Get comprehensive Admin Dashboard Analytics
 */
export const getAdminStats = catchAsync(async (req, res) => {
  const [
    usersCountRes,
    tripsCountRes,
    citiesCountRes,
    activitiesCountRes,
    txCountRes,
    unreadMsgRes,
    revenueRes,
    topCitiesRes,
    recentTripsRes,
    recentUsersRes,
  ] = await Promise.all([
    db.query('SELECT COUNT(*)::int as count FROM "User"'),
    db.query('SELECT COUNT(*)::int as count FROM "Trip"'),
    db.query('SELECT COUNT(*)::int as count FROM "City"'),
    db.query('SELECT COUNT(*)::int as count FROM "Activity"'),
    db.query('SELECT COUNT(*)::int as count FROM "Transaction"'),
    db.query('SELECT COUNT(*)::int as count FROM "ContactMessage" WHERE "isRead" = false'),
    db.query('SELECT COALESCE(SUM(amount), 0)::float as total FROM "Transaction" WHERE status = \'COMPLETED\''),
    db.query(`
      SELECT c.*, 
             (SELECT COUNT(*)::int FROM "Stop" s WHERE s."cityId" = c.id) as stops_count,
             (SELECT COUNT(*)::int FROM "Activity" a WHERE a."cityId" = c.id) as activities_count
      FROM "City" c
      ORDER BY c."popularityScore" DESC
      LIMIT 5
    `),
    db.query(`
      SELECT t.*, 
             json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'photoUrl', u."photoUrl") as user
      FROM "Trip" t
      LEFT JOIN "User" u ON t."userId" = u.id
      ORDER BY t."createdAt" DESC
      LIMIT 5
    `),
    db.query('SELECT id, name, email, role, status, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5'),
  ]);

  const totalUsers = usersCountRes.rows[0].count;
  const totalTrips = tripsCountRes.rows[0].count;
  const totalCities = citiesCountRes.rows[0].count;
  const totalActivities = activitiesCountRes.rows[0].count;
  const totalTransactions = txCountRes.rows[0].count;
  const unreadMessages = unreadMsgRes.rows[0].count;
  const totalRevenue = revenueRes.rows[0].total;

  const topCities = topCitiesRes.rows.map((row) => {
    const { stops_count, activities_count, ...city } = row;
    return {
      ...city,
      _count: { stops: stops_count, activities: activities_count },
    };
  });

  const recentTrips = recentTripsRes.rows;
  for (const t of recentTrips) {
    const stopsRes = await db.query(
      `SELECT s.*, row_to_json(c.*) as city FROM "Stop" s JOIN "City" c ON s."cityId" = c.id WHERE s."tripId" = $1 ORDER BY s."orderIndex" ASC`,
      [t.id]
    );
    t.stops = stopsRes.rows;
  }

  const recentUsers = recentUsersRes.rows;

  const monthlyTrends = [
    { month: 'Apr', trips: 14, travelers: 10 },
    { month: 'May', trips: 28, travelers: 22 },
    { month: 'Jun', trips: 45, travelers: 38 },
    { month: 'Jul', trips: 72, travelers: 60 },
    { month: 'Aug', trips: 95, travelers: 84 },
    { month: 'Sep', trips: 120, travelers: 105 },
  ];

  return ApiResponse.send(
    res,
    200,
    {
      metrics: {
        totalUsers,
        totalTrips,
        totalCities,
        totalActivities,
        totalRevenue,
        unreadMessages,
      },
      topCities,
      recentTrips,
      recentUsers,
      monthlyTrends,
    },
    'Admin dashboard statistics retrieved'
  );
});

/**
 * Get all users with search & filters
 */
export const getUsers = catchAsync(async (req, res) => {
  const { search, role, status } = req.query;

  const whereConditions = [];
  const params = [];
  let paramIdx = 1;

  if (search) {
    whereConditions.push(`(u.name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }
  if (role && role !== 'ALL') {
    whereConditions.push(`u.role = $${paramIdx++}`);
    params.push(role);
  }
  if (status && status !== 'ALL') {
    whereConditions.push(`u.status = $${paramIdx++}`);
    params.push(status);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const queryText = `
    SELECT u.id, u.name, u.email, u.role, u.status, u."photoUrl", u."languagePref", u.department, u."createdAt",
           (SELECT COUNT(*)::int FROM "Trip" t WHERE t."userId" = u.id) as trips_count,
           (SELECT COUNT(*)::int FROM "Transaction" tx WHERE tx."userId" = u.id) as tx_count
    FROM "User" u
    ${whereClause}
    ORDER BY u."createdAt" DESC
  `;

  const usersRes = await db.query(queryText, params);

  const users = usersRes.rows.map((row) => {
    const { trips_count, tx_count, ...u } = row;
    return {
      ...u,
      _count: { trips: trips_count, transactions: tx_count },
    };
  });

  return ApiResponse.send(res, 200, { users, total: users.length }, 'Users retrieved');
});

/**
 * Update user role (promote to ADMIN / demote to USER)
 */
export const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const updateRes = await db.query(
    'UPDATE "User" SET role = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, name, email, role, status',
    [role, id]
  );
  if (updateRes.rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }

  return ApiResponse.send(res, 200, { user: updateRes.rows[0] }, `User role updated to ${role}`);
});

/**
 * Update user status (ACTIVE / SUSPENDED)
 */
export const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const updateRes = await db.query(
    'UPDATE "User" SET status = $1, "isActive" = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING id, name, email, role, status',
    [status, status === 'ACTIVE', id]
  );
  if (updateRes.rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }

  return ApiResponse.send(res, 200, { user: updateRes.rows[0] }, `User status updated to ${status}`);
});

/**
 * Delete a user
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new ApiError(400, 'Cannot delete your own admin account');
  }

  await db.query('DELETE FROM "User" WHERE id = $1', [id]);

  return ApiResponse.send(res, 200, null, 'User deleted successfully');
});

// ==================== CITIES CRUD ====================

export const createCity = catchAsync(async (req, res) => {
  const { name, country, region, costIndex, popularityScore, imageUrl, description } = req.body;

  if (!name || !country || !imageUrl || !description) {
    throw new ApiError(400, 'Name, country, imageUrl, and description are required');
  }

  const insertRes = await db.query(
    `INSERT INTO "City" (id, name, country, region, "costIndex", "popularityScore", "imageUrl", description, "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [
      name.trim(),
      country.trim(),
      region || 'Global',
      costIndex ? parseInt(costIndex, 10) : 3,
      popularityScore ? parseInt(popularityScore, 10) : 80,
      imageUrl,
      description,
    ]
  );

  return ApiResponse.send(res, 201, { city: insertRes.rows[0] }, 'City created successfully');
});

export const updateCity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, country, region, costIndex, popularityScore, imageUrl, description } = req.body;

  const fields = [];
  const values = [];
  let idx = 1;

  if (name) {
    fields.push(`name = $${idx++}`);
    values.push(name.trim());
  }
  if (country) {
    fields.push(`country = $${idx++}`);
    values.push(country.trim());
  }
  if (region) {
    fields.push(`region = $${idx++}`);
    values.push(region);
  }
  if (costIndex !== undefined) {
    fields.push(`"costIndex" = $${idx++}`);
    values.push(parseInt(costIndex, 10));
  }
  if (popularityScore !== undefined) {
    fields.push(`"popularityScore" = $${idx++}`);
    values.push(parseInt(popularityScore, 10));
  }
  if (imageUrl) {
    fields.push(`"imageUrl" = $${idx++}`);
    values.push(imageUrl);
  }
  if (description) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = NOW()`);
    values.push(id);
    const updateRes = await db.query(`UPDATE "City" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (updateRes.rows.length === 0) throw new ApiError(404, 'City not found');
    return ApiResponse.send(res, 200, { city: updateRes.rows[0] }, 'City updated successfully');
  }

  const existing = await db.query('SELECT * FROM "City" WHERE id = $1', [id]);
  return ApiResponse.send(res, 200, { city: existing.rows[0] }, 'City updated successfully');
});

export const deleteCity = catchAsync(async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM "City" WHERE id = $1', [id]);
  return ApiResponse.send(res, 200, null, 'City deleted successfully');
});

// ==================== ACTIVITIES CRUD ====================

export const createActivity = catchAsync(async (req, res) => {
  const { cityId, name, category, cost, durationMinutes, description, imageUrl } = req.body;

  if (!cityId || !name || !imageUrl || !description) {
    throw new ApiError(400, 'City ID, name, imageUrl, and description are required');
  }

  const insertRes = await db.query(
    `INSERT INTO "Activity" (id, "cityId", name, category, cost, "durationMinutes", description, "imageUrl", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [
      cityId,
      name.trim(),
      category || 'Sightseeing',
      cost ? parseFloat(cost) : 0,
      durationMinutes ? parseInt(durationMinutes, 10) : 120,
      description,
      imageUrl,
    ]
  );

  const actRes = await db.query(
    `SELECT a.*, row_to_json(c.*) as city FROM "Activity" a JOIN "City" c ON a."cityId" = c.id WHERE a.id = $1`,
    [insertRes.rows[0].id]
  );

  return ApiResponse.send(res, 201, { activity: actRes.rows[0] }, 'Activity created successfully');
});

export const updateActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { cityId, name, category, cost, durationMinutes, description, imageUrl } = req.body;

  const fields = [];
  const values = [];
  let idx = 1;

  if (cityId) {
    fields.push(`"cityId" = $${idx++}`);
    values.push(cityId);
  }
  if (name) {
    fields.push(`name = $${idx++}`);
    values.push(name.trim());
  }
  if (category) {
    fields.push(`category = $${idx++}`);
    values.push(category);
  }
  if (cost !== undefined) {
    fields.push(`cost = $${idx++}`);
    values.push(parseFloat(cost));
  }
  if (durationMinutes !== undefined) {
    fields.push(`"durationMinutes" = $${idx++}`);
    values.push(parseInt(durationMinutes, 10));
  }
  if (description) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }
  if (imageUrl) {
    fields.push(`"imageUrl" = $${idx++}`);
    values.push(imageUrl);
  }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = NOW()`);
    values.push(id);
    await db.query(`UPDATE "Activity" SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  }

  const actRes = await db.query(
    `SELECT a.*, row_to_json(c.*) as city FROM "Activity" a JOIN "City" c ON a."cityId" = c.id WHERE a.id = $1`,
    [id]
  );

  return ApiResponse.send(res, 200, { activity: actRes.rows[0] }, 'Activity updated successfully');
});

export const deleteActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM "Activity" WHERE id = $1', [id]);
  return ApiResponse.send(res, 200, null, 'Activity deleted successfully');
});

// ==================== TRANSACTIONS & PAYMENTS ====================

export const getTransactions = catchAsync(async (req, res) => {
  const queryText = `
    SELECT tx.*,
           json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
           json_build_object('id', t.id, 'name', t.name) as trip
    FROM "Transaction" tx
    LEFT JOIN "User" u ON tx."userId" = u.id
    LEFT JOIN "Trip" t ON tx."tripId" = t.id
    ORDER BY tx."createdAt" DESC
  `;

  const txRes = await db.query(queryText);

  return ApiResponse.send(res, 200, { transactions: txRes.rows, count: txRes.rows.length }, 'Transactions retrieved');
});

export const createTestTransaction = catchAsync(async (req, res) => {
  const { tripId, amount, gateway, notes } = req.body;

  const ref = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const insertRes = await db.query(
    `INSERT INTO "Transaction" (id, "userId", "tripId", amount, currency, gateway, status, "gatewayRef", notes)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      req.user.id,
      tripId || null,
      amount ? parseFloat(amount) : 39.0,
      'USD',
      gateway || 'STRIPE',
      'COMPLETED',
      ref,
      notes || 'Simulated Test Checkout Payment',
    ]
  );

  const txRes = await db.query(
    `SELECT tx.*, row_to_json(t.*) as trip
     FROM "Transaction" tx
     LEFT JOIN "Trip" t ON tx."tripId" = t.id
     WHERE tx.id = $1`,
    [insertRes.rows[0].id]
  );

  return ApiResponse.send(res, 201, { transaction: txRes.rows[0] }, 'Payment simulated & recorded successfully');
});

// ==================== SETTINGS (SMTP / PAYMENT / GENERAL) ====================

export const getSettings = catchAsync(async (req, res) => {
  const { group } = req.query;

  const queryText = group ? 'SELECT * FROM "SiteSetting" WHERE group = $1' : 'SELECT * FROM "SiteSetting"';
  const params = group ? [group] : [];

  const settingsRes = await db.query(queryText, params);
  const settings = settingsRes.rows;

  const settingsMap = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return ApiResponse.send(res, 200, { settings: settingsMap, raw: settings }, 'Settings retrieved');
});

export const updateSettings = catchAsync(async (req, res) => {
  const { settings, group } = req.body;

  if (!settings || typeof settings !== 'object') {
    throw new ApiError(400, 'Settings object is required');
  }

  const updatedEntries = [];
  for (const [key, value] of Object.entries(settings)) {
    const res = await db.query(
      `INSERT INTO "SiteSetting" (id, key, value, group, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()
       RETURNING *`,
      [key, String(value), group || 'GENERAL']
    );
    updatedEntries.push(res.rows[0]);
  }

  return ApiResponse.send(res, 200, { entries: updatedEntries }, 'Settings updated successfully');
});

export const testSmtp = catchAsync(async (req, res) => {
  const { testRecipient } = req.body;
  const recipient = testRecipient || req.user.email;

  const result = await sendEmail({
    to: recipient,
    subject: 'GlobeTrotter - SMTP Configuration Test',
    html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#d97706;">✈️ GlobeTrotter Email Integration Test</h2>
      <p>Congratulations! Your SMTP email relay configuration is active and working properly.</p>
      <p>Timestamp: <strong>${new Date().toISOString()}</strong></p>
    </div>`,
  });

  return ApiResponse.send(res, 200, { recipient, result }, `Test email dispatched to ${recipient}`);
});
