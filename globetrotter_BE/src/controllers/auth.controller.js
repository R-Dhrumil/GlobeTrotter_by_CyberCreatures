import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { env } from '../config/env.js';
import { sendEmail } from '../utils/email.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user
 */
export const register = catchAsync(async (req, res) => {
  const { name, email, password, photoUrl, languagePref } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const cleanEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'USER',
      photoUrl: photoUrl || '',
      languagePref: languagePref || 'en',
      status: 'ACTIVE',
    },
  });

  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;

  return ApiResponse.send(res, 201, { user: safeUser, token }, 'Registration successful');
});

/**
 * Login with email and password
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password');
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'SUSPENDED' || user.isActive === false) {
    throw new ApiError(403, 'Account is suspended or inactive. Please contact support.');
  }

  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;

  return ApiResponse.send(res, 200, { user: safeUser, token }, 'Login successful');
});

/**
 * Get current authenticated user profile
 */
export const getMe = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      photoUrl: true,
      languagePref: true,
      status: true,
      department: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return ApiResponse.send(res, 200, { user }, 'User profile retrieved');
});

/**
 * Update current user profile
 */
export const updateProfile = catchAsync(async (req, res) => {
  const { name, photoUrl, languagePref, department } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name: name.trim() }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(languagePref && { languagePref }),
      ...(department && { department }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      photoUrl: true,
      languagePref: true,
      status: true,
      department: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return ApiResponse.send(res, 200, { user: updated }, 'Profile updated successfully');
});

/**
 * Change user password
 */
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });

  return ApiResponse.send(res, 200, null, 'Password updated successfully');
});

/**
 * Forgot Password - Send OTP code
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    // For security, respond standard message even if user doesn't exist
    return ApiResponse.send(res, 200, { email: cleanEmail }, 'If an account exists, a reset code has been sent.');
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await prisma.otp.deleteMany({ where: { email: cleanEmail } });
  await prisma.otp.create({
    data: {
      email: cleanEmail,
      otp: otpCode,
      expiresAt,
    },
  });

  console.log(`\n🔑 [GLOBETROTTER PASSWORD RESET OTP]: ${otpCode} for ${cleanEmail}\n`);

  try {
    await sendEmail({
      to: cleanEmail,
      subject: `GlobeTrotter - Password Reset Code: ${otpCode}`,
      html: `<div style="font-family:sans-serif;padding:20px;">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>Use the 6-digit code below to reset your GlobeTrotter account password:</p>
        <div style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#d97706;padding:12px;background:#fef3c7;display:inline-block;border-radius:8px;">${otpCode}</div>
        <p>This code will expire in 15 minutes.</p>
      </div>`,
    });
  } catch (err) {
    console.log('⚠️ Notice: Could not send email, check terminal for OTP.');
  }

  return ApiResponse.send(res, 200, { email: cleanEmail }, 'Reset code generated successfully');
});

/**
 * Reset Password with OTP
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'Email, OTP, and new password are required');
  }

  const cleanEmail = email.toLowerCase().trim();
  const validOtp = await prisma.otp.findFirst({
    where: {
      email: cleanEmail,
      otp: otp.trim(),
      expiresAt: { gte: new Date() },
    },
  });

  if (!validOtp) {
    throw new ApiError(400, 'Invalid or expired reset code');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: cleanEmail },
    data: { password: hashedPassword },
  });

  await prisma.otp.deleteMany({ where: { email: cleanEmail } });

  return ApiResponse.send(res, 200, null, 'Password has been reset successfully. You can now login.');
});
