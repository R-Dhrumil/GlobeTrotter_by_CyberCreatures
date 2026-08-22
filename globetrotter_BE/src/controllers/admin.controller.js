import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendEmail } from '../utils/email.js';

/**
 * Get comprehensive Admin Dashboard Analytics
 */
export const getAdminStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalTrips,
    totalCities,
    totalActivities,
    totalTransactions,
    unreadMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.city.count(),
    prisma.activity.count(),
    prisma.transaction.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  // Aggregate total transaction revenue
  const transactions = await prisma.transaction.findMany({
    where: { status: 'COMPLETED' },
  });
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Top popular cities
  const topCities = await prisma.city.findMany({
    take: 5,
    orderBy: { popularityScore: 'desc' },
    include: {
      _count: { select: { stops: true, activities: true } },
    },
  });

  // Recent trips
  const recentTrips = await prisma.trip.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, photoUrl: true } },
      stops: { include: { city: true } },
    },
  });

  // Recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  // Mock monthly trip creation trend data for charts
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

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role && role !== 'ALL') {
    where.role = role;
  }
  if (status && status !== 'ALL') {
    where.status = status;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      photoUrl: true,
      languagePref: true,
      department: true,
      createdAt: true,
      _count: {
        select: { trips: true, transactions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
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

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  return ApiResponse.send(res, 200, { user: updated }, `User role updated to ${role}`);
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

  const updated = await prisma.user.update({
    where: { id },
    data: {
      status,
      isActive: status === 'ACTIVE',
    },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  return ApiResponse.send(res, 200, { user: updated }, `User status updated to ${status}`);
});

/**
 * Delete a user
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new ApiError(400, 'Cannot delete your own admin account');
  }

  await prisma.user.delete({ where: { id } });

  return ApiResponse.send(res, 200, null, 'User deleted successfully');
});

// ==================== CITIES CRUD ====================

export const createCity = catchAsync(async (req, res) => {
  const { name, country, region, costIndex, popularityScore, imageUrl, description } = req.body;

  if (!name || !country || !imageUrl || !description) {
    throw new ApiError(400, 'Name, country, imageUrl, and description are required');
  }

  const city = await prisma.city.create({
    data: {
      name: name.trim(),
      country: country.trim(),
      region: region || 'Global',
      costIndex: costIndex ? parseInt(costIndex, 10) : 3,
      popularityScore: popularityScore ? parseInt(popularityScore, 10) : 80,
      imageUrl,
      description,
    },
  });

  return ApiResponse.send(res, 201, { city }, 'City created successfully');
});

export const updateCity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, country, region, costIndex, popularityScore, imageUrl, description } = req.body;

  const updated = await prisma.city.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(country && { country: country.trim() }),
      ...(region && { region }),
      ...(costIndex !== undefined && { costIndex: parseInt(costIndex, 10) }),
      ...(popularityScore !== undefined && { popularityScore: parseInt(popularityScore, 10) }),
      ...(imageUrl && { imageUrl }),
      ...(description && { description }),
    },
  });

  return ApiResponse.send(res, 200, { city: updated }, 'City updated successfully');
});

export const deleteCity = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.city.delete({ where: { id } });
  return ApiResponse.send(res, 200, null, 'City deleted successfully');
});

// ==================== ACTIVITIES CRUD ====================

export const createActivity = catchAsync(async (req, res) => {
  const { cityId, name, category, cost, durationMinutes, description, imageUrl } = req.body;

  if (!cityId || !name || !imageUrl || !description) {
    throw new ApiError(400, 'City ID, name, imageUrl, and description are required');
  }

  const activity = await prisma.activity.create({
    data: {
      cityId,
      name: name.trim(),
      category: category || 'Sightseeing',
      cost: cost ? parseFloat(cost) : 0,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 120,
      description,
      imageUrl,
    },
    include: { city: true },
  });

  return ApiResponse.send(res, 201, { activity }, 'Activity created successfully');
});

export const updateActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { cityId, name, category, cost, durationMinutes, description, imageUrl } = req.body;

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      ...(cityId && { cityId }),
      ...(name && { name: name.trim() }),
      ...(category && { category }),
      ...(cost !== undefined && { cost: parseFloat(cost) }),
      ...(durationMinutes !== undefined && { durationMinutes: parseInt(durationMinutes, 10) }),
      ...(description && { description }),
      ...(imageUrl && { imageUrl }),
    },
    include: { city: true },
  });

  return ApiResponse.send(res, 200, { activity: updated }, 'Activity updated successfully');
});

export const deleteActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.activity.delete({ where: { id } });
  return ApiResponse.send(res, 200, null, 'Activity deleted successfully');
});

// ==================== TRANSACTIONS & PAYMENTS ====================

export const getTransactions = catchAsync(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      trip: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ApiResponse.send(res, 200, { transactions, count: transactions.length }, 'Transactions retrieved');
});

export const createTestTransaction = catchAsync(async (req, res) => {
  const { tripId, amount, gateway, notes } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      userId: req.user.id,
      tripId: tripId || null,
      amount: amount ? parseFloat(amount) : 39.0,
      currency: 'USD',
      gateway: gateway || 'STRIPE',
      status: 'COMPLETED',
      gatewayRef: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      notes: notes || 'Simulated Test Checkout Payment',
    },
    include: {
      trip: true,
    },
  });

  return ApiResponse.send(res, 201, { transaction }, 'Payment simulated & recorded successfully');
});

// ==================== SETTINGS (SMTP / PAYMENT / GENERAL) ====================

export const getSettings = catchAsync(async (req, res) => {
  const { group } = req.query;

  const where = group ? { group } : {};
  const settings = await prisma.siteSetting.findMany({ where });

  // Map to key-value object
  const settingsMap = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return ApiResponse.send(res, 200, { settings: settingsMap, raw: settings }, 'Settings retrieved');
});

export const updateSettings = catchAsync(async (req, res) => {
  const { settings, group } = req.body; // { key: value, ... }

  if (!settings || typeof settings !== 'object') {
    throw new ApiError(400, 'Settings object is required');
  }

  const updatedEntries = [];
  for (const [key, value] of Object.entries(settings)) {
    const entry = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: {
        key,
        value: String(value),
        group: group || 'GENERAL',
      },
    });
    updatedEntries.push(entry);
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
