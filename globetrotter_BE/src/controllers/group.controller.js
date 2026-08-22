import crypto from 'crypto';
import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Helper: Check if user is a member/creator of the trip group
 */
const assertGroupMember = async (tripId, userId) => {
  const res = await db.query(
    'SELECT * FROM "GroupMember" WHERE "tripId" = $1 AND "userId" = $2',
    [tripId, userId]
  );
  if (res.rows.length === 0) {
    throw new ApiError(403, 'You are not a member of this group trip');
  }
  return res.rows[0];
};

/**
 * Helper: Check if user is the creator of the trip group
 */
const assertGroupCreator = async (tripId, userId) => {
  const member = await assertGroupMember(tripId, userId);
  if (member.role !== 'CREATOR') {
    throw new ApiError(403, 'Only the trip creator can perform this action');
  }
  return member;
};

/**
 * Enable group travel for a trip (generates invite token, adds creator as CREATOR)
 */
export const enableGroupTrip = catchAsync(async (req, res) => {
  const { tripId } = req.params;

  // Verify trip exists and user is the owner
  const tripRes = await db.query('SELECT * FROM "Trip" WHERE id = $1', [tripId]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const trip = tripRes.rows[0];

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Only the trip owner can enable group travel');
  }

  // Check if already enabled
  if (trip.inviteToken) {
    // Already enabled, return existing token
    const memberCount = await db.query(
      'SELECT COUNT(*) as count FROM "GroupMember" WHERE "tripId" = $1',
      [tripId]
    );
    return ApiResponse.send(res, 200, {
      inviteToken: trip.inviteToken,
      memberCount: parseInt(memberCount.rows[0].count),
    }, 'Group travel is already enabled for this trip');
  }

  // Generate a unique invite token
  const inviteToken = crypto.randomBytes(24).toString('hex');

  await db.query('UPDATE "Trip" SET "inviteToken" = $1, "updatedAt" = NOW() WHERE id = $2', [
    inviteToken,
    tripId,
  ]);

  // Add creator as first group member
  await db.query(
    `INSERT INTO "GroupMember" (id, "tripId", "userId", role)
     VALUES (gen_random_uuid(), $1, $2, 'CREATOR')
     ON CONFLICT ("tripId", "userId") DO NOTHING`,
    [tripId, req.user.id]
  );

  return ApiResponse.send(res, 201, { inviteToken }, 'Group travel enabled! Share the invite link with your group.');
});

/**
 * Get the invite link/token for a group trip
 */
export const getInviteLink = catchAsync(async (req, res) => {
  const { tripId } = req.params;

  const tripRes = await db.query('SELECT "inviteToken", "userId" FROM "Trip" WHERE id = $1', [tripId]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Trip not found');
  }
  const trip = tripRes.rows[0];

  // Only members can see the invite link
  await assertGroupMember(tripId, req.user.id);

  if (!trip.inviteToken) {
    throw new ApiError(400, 'Group travel is not enabled for this trip');
  }

  return ApiResponse.send(res, 200, { inviteToken: trip.inviteToken }, 'Invite link retrieved');
});

/**
 * Join a group trip using an invite token (authenticated user)
 */
export const joinGroupTrip = catchAsync(async (req, res) => {
  const { token } = req.params;

  const tripRes = await db.query('SELECT * FROM "Trip" WHERE "inviteToken" = $1', [token]);
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Invalid or expired invite link');
  }
  const trip = tripRes.rows[0];

  // Check if already a member
  const existingMember = await db.query(
    'SELECT * FROM "GroupMember" WHERE "tripId" = $1 AND "userId" = $2',
    [trip.id, req.user.id]
  );
  if (existingMember.rows.length > 0) {
    return ApiResponse.send(res, 200, { tripId: trip.id, alreadyMember: true }, 'You are already a member of this group trip');
  }

  // Add user as member
  await db.query(
    `INSERT INTO "GroupMember" (id, "tripId", "userId", role)
     VALUES (gen_random_uuid(), $1, $2, 'MEMBER')`,
    [trip.id, req.user.id]
  );

  return ApiResponse.send(res, 201, { tripId: trip.id }, 'Successfully joined the group trip!');
});

/**
 * Validate an invite token without joining (for preview on JoinGroupPage)
 */
export const validateInviteToken = catchAsync(async (req, res) => {
  const { token } = req.params;

  const tripRes = await db.query(
    `SELECT t.id, t.name, t.description, t."coverPhotoUrl", t."startDate", t."endDate",
            json_build_object('id', u.id, 'name', u.name, 'photoUrl', u."photoUrl") as creator
     FROM "Trip" t
     LEFT JOIN "User" u ON t."userId" = u.id
     WHERE t."inviteToken" = $1`,
    [token]
  );
  if (tripRes.rows.length === 0) {
    throw new ApiError(404, 'Invalid or expired invite link');
  }
  const trip = tripRes.rows[0];

  const memberCountRes = await db.query(
    'SELECT COUNT(*) as count FROM "GroupMember" WHERE "tripId" = $1',
    [trip.id]
  );

  return ApiResponse.send(res, 200, {
    trip: {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      coverPhotoUrl: trip.coverPhotoUrl,
      startDate: trip.startDate,
      endDate: trip.endDate,
      creator: trip.creator,
      memberCount: parseInt(memberCountRes.rows[0].count),
    },
  }, 'Invite link is valid');
});

/**
 * List all group members
 */
export const getGroupMembers = catchAsync(async (req, res) => {
  const { tripId } = req.params;

  // Must be a group member to see member list
  await assertGroupMember(tripId, req.user.id);

  const membersRes = await db.query(
    `SELECT gm.id, gm.role, gm."joinedAt",
            json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'photoUrl', u."photoUrl", 'currency', u.currency, 'country', u.country) as user
     FROM "GroupMember" gm
     JOIN "User" u ON gm."userId" = u.id
     WHERE gm."tripId" = $1
     ORDER BY gm."joinedAt" ASC`,
    [tripId]
  );

  return ApiResponse.send(res, 200, { members: membersRes.rows }, 'Group members retrieved');
});

/**
 * Remove a member from the group (creator only)
 */
export const removeGroupMember = catchAsync(async (req, res) => {
  const { tripId, userId } = req.params;

  // Verify requester is the creator
  await assertGroupCreator(tripId, req.user.id);

  // Cannot remove self (creator)
  if (userId === req.user.id) {
    throw new ApiError(400, 'You cannot remove yourself from the group');
  }

  const deleteRes = await db.query(
    'DELETE FROM "GroupMember" WHERE "tripId" = $1 AND "userId" = $2 RETURNING *',
    [tripId, userId]
  );
  if (deleteRes.rows.length === 0) {
    throw new ApiError(404, 'Member not found in this group');
  }

  return ApiResponse.send(res, 200, null, 'Member removed from the group');
});

/**
 * Log a new expense (any group member)
 */
export const addGroupExpense = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const { category, amount, description, expenseDate } = req.body;

  // Must be a group member
  await assertGroupMember(tripId, req.user.id);

  if (!category || amount === undefined || amount === null) {
    throw new ApiError(400, 'Category and amount are required');
  }

  if (parseFloat(amount) <= 0) {
    throw new ApiError(400, 'Amount must be greater than zero');
  }

  const validCategories = ['FOOD', 'TRAVEL', 'ACCOMMODATION', 'ACTIVITIES', 'OTHER'];
  if (!validCategories.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  const insertRes = await db.query(
    `INSERT INTO "GroupExpense" (id, "tripId", "paidByUserId", category, amount, description, "expenseDate")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      tripId,
      req.user.id,
      category,
      parseFloat(amount),
      description || '',
      expenseDate ? new Date(expenseDate) : new Date(),
    ]
  );

  // Return with user info
  const expense = insertRes.rows[0];
  expense.paidBy = { id: req.user.id, name: req.user.name, photoUrl: req.user.photoUrl };

  return ApiResponse.send(res, 201, { expense }, 'Expense logged successfully');
});

/**
 * Get all group expenses
 */
export const getGroupExpenses = catchAsync(async (req, res) => {
  const { tripId } = req.params;

  // Must be a group member
  await assertGroupMember(tripId, req.user.id);

  const expensesRes = await db.query(
    `SELECT ge.*,
            json_build_object('id', u.id, 'name', u.name, 'photoUrl', u."photoUrl") as "paidBy"
     FROM "GroupExpense" ge
     JOIN "User" u ON ge."paidByUserId" = u.id
     WHERE ge."tripId" = $1
     ORDER BY ge."expenseDate" DESC, ge."createdAt" DESC`,
    [tripId]
  );

  return ApiResponse.send(res, 200, { expenses: expensesRes.rows }, 'Group expenses retrieved');
});

/**
 * Delete own expense
 */
export const deleteGroupExpense = catchAsync(async (req, res) => {
  const { tripId, expenseId } = req.params;

  // Must be a group member
  await assertGroupMember(tripId, req.user.id);

  const expenseRes = await db.query(
    'SELECT * FROM "GroupExpense" WHERE id = $1 AND "tripId" = $2',
    [expenseId, tripId]
  );
  if (expenseRes.rows.length === 0) {
    throw new ApiError(404, 'Expense not found');
  }

  const expense = expenseRes.rows[0];

  // Only the person who paid or the creator can delete
  const memberRes = await db.query(
    'SELECT * FROM "GroupMember" WHERE "tripId" = $1 AND "userId" = $2',
    [tripId, req.user.id]
  );
  const isCreator = memberRes.rows[0]?.role === 'CREATOR';

  if (expense.paidByUserId !== req.user.id && !isCreator) {
    throw new ApiError(403, 'You can only delete your own expenses');
  }

  await db.query('DELETE FROM "GroupExpense" WHERE id = $1', [expenseId]);

  return ApiResponse.send(res, 200, null, 'Expense deleted');
});

/**
 * Calculate settlement — who owes whom
 */
export const getGroupSettlement = catchAsync(async (req, res) => {
  const { tripId } = req.params;

  // Must be a group member
  await assertGroupMember(tripId, req.user.id);

  // Get all members
  const membersRes = await db.query(
    `SELECT gm."userId", u.name, u."photoUrl", u.currency
     FROM "GroupMember" gm
     JOIN "User" u ON gm."userId" = u.id
     WHERE gm."tripId" = $1`,
    [tripId]
  );
  const members = membersRes.rows;

  if (members.length === 0) {
    return ApiResponse.send(res, 200, { settlement: { members: [], transfers: [], totalSpent: 0, fairShare: 0, perPerson: [], byCategory: [] } }, 'No group members');
  }

  // Get all expenses
  const expensesRes = await db.query(
    'SELECT * FROM "GroupExpense" WHERE "tripId" = $1',
    [tripId]
  );
  const expenses = expensesRes.rows;

  // Per-person totals
  const perPersonMap = {};
  members.forEach((m) => {
    perPersonMap[m.userId] = {
      userId: m.userId,
      name: m.name,
      photoUrl: m.photoUrl,
      currency: m.currency,
      totalPaid: 0,
    };
  });

  let totalSpent = 0;
  const byCategoryMap = {};

  expenses.forEach((exp) => {
    const amt = parseFloat(exp.amount) || 0;
    totalSpent += amt;
    if (perPersonMap[exp.paidByUserId]) {
      perPersonMap[exp.paidByUserId].totalPaid += amt;
    }
    byCategoryMap[exp.category] = (byCategoryMap[exp.category] || 0) + amt;
  });

  const fairShare = members.length > 0 ? totalSpent / members.length : 0;

  // Calculate balances
  const perPerson = Object.values(perPersonMap).map((p) => ({
    ...p,
    totalPaid: Number(p.totalPaid.toFixed(2)),
    fairShare: Number(fairShare.toFixed(2)),
    balance: Number((p.totalPaid - fairShare).toFixed(2)),
  }));

  // Generate minimal transfers (greedy algorithm)
  const debtors = perPerson.filter((p) => p.balance < 0).map((p) => ({ ...p, balance: Math.abs(p.balance) }));
  const creditors = perPerson.filter((p) => p.balance > 0).map((p) => ({ ...p }));

  // Sort descending
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const transfers = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0.01) {
      transfers.push({
        from: { userId: debtor.userId, name: debtor.name, photoUrl: debtor.photoUrl },
        to: { userId: creditor.userId, name: creditor.name, photoUrl: creditor.photoUrl },
        amount: Number(amount.toFixed(2)),
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) di++;
    if (creditor.balance < 0.01) ci++;
  }

  const byCategory = Object.entries(byCategoryMap).map(([category, amount]) => ({
    category,
    amount: Number(amount.toFixed(2)),
  }));

  return ApiResponse.send(res, 200, {
    settlement: {
      totalSpent: Number(totalSpent.toFixed(2)),
      fairShare: Number(fairShare.toFixed(2)),
      memberCount: members.length,
      perPerson,
      transfers,
      byCategory,
    },
  }, 'Settlement calculated');
});
