import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from '../utils/email.js';
import { accountCreatedTemplate } from '../utils/emailTemplates.js';

export const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const existingRes = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
  if (existingRes.rows.length > 0) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertRes = await db.query(
    `INSERT INTO "User" (id, name, email, password, role, department, "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [name, email, hashedPassword, role || 'USER', department || 'General']
  );

  const user = insertRes.rows[0];
  delete user.password;

  sendEmail({
    to: email,
    subject: 'Welcome! Your Account Has Been Created',
    html: accountCreatedTemplate({ name, email, role: user.role }),
  }).catch((err) => console.error('Failed to dispatch welcome email:', err));

  return ApiResponse.send(res, 201, { user }, 'User created successfully by Admin');
});

export const getAllUsers = catchAsync(async (req, res) => {
  const usersRes = await db.query(
    'SELECT id, name, email, role, department, "isActive", "createdAt" FROM "User" ORDER BY "createdAt" DESC'
  );
  return ApiResponse.send(res, 200, { count: usersRes.rows.length, users: usersRes.rows }, 'All users fetched successfully');
});

export const getUserById = catchAsync(async (req, res) => {
  const userRes = await db.query(
    'SELECT id, name, email, role, department, "isActive", "createdAt" FROM "User" WHERE id = $1',
    [req.params.id]
  );
  if (userRes.rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }
  return ApiResponse.send(res, 200, { user: userRes.rows[0] }, 'User details fetched');
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  const updateRes = await db.query(
    'UPDATE "User" SET role = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, name, email, role, department',
    [role, req.params.id]
  );
  if (updateRes.rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }
  return ApiResponse.send(res, 200, { user: updateRes.rows[0] }, 'User role updated successfully');
});
