import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
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

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'USER',
      department: department || 'General',
    },
  });

  delete user.password;

  // Send styled HTML account creation notification email asynchronously
  sendEmail({
    to: email,
    subject: 'Welcome! Your Account Has Been Created',
    html: accountCreatedTemplate({ name, email, role: user.role }),
  }).catch((err) => console.error('Failed to dispatch welcome email:', err));

  return ApiResponse.send(res, 201, { user }, 'User created successfully by Admin');
});

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true },
  });
  return ApiResponse.send(res, 200, { count: users.length, users }, 'All users fetched successfully');
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true },
  });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return ApiResponse.send(res, 200, { user }, 'User details fetched');
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, department: true },
  });
  return ApiResponse.send(res, 200, { user }, 'User role updated successfully');
});
