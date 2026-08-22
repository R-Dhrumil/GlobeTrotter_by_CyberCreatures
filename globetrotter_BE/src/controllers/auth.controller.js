import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { env } from '../config/env.js';
import { sendEmail } from '../utils/email.js';
import { welcomeEmailTemplate, firstTimeLoginTemplate } from '../utils/emailTemplates.js';

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
  const existingUserRes = await db.query('SELECT * FROM "User" WHERE email = $1', [cleanEmail]);
  if (existingUserRes.rows.length > 0) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const insertRes = await db.query(
    `INSERT INTO "User" (id, name, email, password, role, "photoUrl", "languagePref", status, "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [name.trim(), cleanEmail, hashedPassword, 'USER', photoUrl || '', languagePref || 'en', 'ACTIVE']
  );
  const user = insertRes.rows[0];

  // Dispatch Welcome Email in non-blocking background task
  setImmediate(async () => {
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to GlobeTrotter! ✈️ Your Explorer Pass is Ready',
        html: welcomeEmailTemplate({ name: user.name, email: user.email }),
      });
    } catch (err) {
      console.error('⚠️ Notice: Could not send welcome email:', err.message);
    }
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
  const userRes = await db.query('SELECT * FROM "User" WHERE email = $1', [cleanEmail]);
  const user = userRes.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'SUSPENDED' || user.isActive === false) {
    throw new ApiError(403, 'Account is suspended or inactive. Please contact support.');
  }

  // Check if this is the user's first time logging in
  const isFirstLogin = !user.lastLoginAt;

  if (isFirstLogin) {
    // Send First-Time Login Alert Email in non-blocking background task
    setImmediate(async () => {
      try {
        await sendEmail({
          to: user.email,
          subject: '🎉 First Sign-In Confirmed - Welcome to GlobeTrotter',
          html: firstTimeLoginTemplate({ name: user.name, loginTime: new Date().toLocaleString() }),
        });
      } catch (err) {
        console.error('⚠️ Notice: Could not send first-login email:', err.message);
      }
    });
  }

  // Update lastLoginAt timestamp in database asynchronously
  db.query('UPDATE "User" SET "lastLoginAt" = NOW() WHERE id = $1', [user.id]).catch((err) =>
    console.error('Failed to update lastLoginAt:', err.message)
  );

  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;

  return ApiResponse.send(res, 200, { user: safeUser, token }, 'Login successful');
});

/**
 * Get current authenticated user profile
 */
export const getMe = catchAsync(async (req, res) => {
  const userRes = await db.query(
    'SELECT id, name, email, role, "photoUrl", "languagePref", status, department, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
    [req.user.id]
  );
  const user = userRes.rows[0];

  return ApiResponse.send(res, 200, { user }, 'User profile retrieved');
});

/**
 * Update current user profile
 */
export const updateProfile = catchAsync(async (req, res) => {
  const { name, photoUrl, languagePref, department, currency, country } = req.body;

  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (name) {
    fields.push(`name = $${paramIdx++}`);
    values.push(name.trim());
  }
  if (photoUrl !== undefined) {
    fields.push(`"photoUrl" = $${paramIdx++}`);
    values.push(photoUrl);
  }
  if (languagePref) {
    fields.push(`"languagePref" = $${paramIdx++}`);
    values.push(languagePref);
  }
  if (department) {
    fields.push(`department = $${paramIdx++}`);
    values.push(department);
  }
  if (currency !== undefined) {
    fields.push(`currency = $${paramIdx++}`);
    values.push(currency);
  }
  if (country !== undefined) {
    fields.push(`country = $${paramIdx++}`);
    values.push(country);
  }

  if (fields.length === 0) {
    throw new ApiError(400, 'No fields provided to update');
  }

  fields.push(`"updatedAt" = NOW()`);
  values.push(req.user.id);

  const queryText = `UPDATE "User" SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING id, name, email, role, "photoUrl", "languagePref", status, department, currency, country, "createdAt", "updatedAt"`;
  const updateRes = await db.query(queryText, values);

  return ApiResponse.send(res, 200, { user: updateRes.rows[0] }, 'Profile updated successfully');
});

/**
 * Change user password
 */
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }

  const userRes = await db.query('SELECT * FROM "User" WHERE id = $1', [req.user.id]);
  const user = userRes.rows[0];
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE id = $2', [hashedPassword, req.user.id]);

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
  const userRes = await db.query('SELECT * FROM "User" WHERE email = $1', [cleanEmail]);
  const user = userRes.rows[0];
  if (!user) {
    return ApiResponse.send(res, 200, { email: cleanEmail }, 'If an account exists, a reset code has been sent.');
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.query('DELETE FROM "Otp" WHERE email = $1', [cleanEmail]);
  await db.query(
    'INSERT INTO "Otp" (id, email, otp, "expiresAt") VALUES (gen_random_uuid(), $1, $2, $3)',
    [cleanEmail, otpCode, expiresAt]
  );

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
  const otpRes = await db.query(
    'SELECT * FROM "Otp" WHERE email = $1 AND otp = $2 AND "expiresAt" >= NOW()',
    [cleanEmail, otp.trim()]
  );

  if (otpRes.rows.length === 0) {
    throw new ApiError(400, 'Invalid or expired reset code');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE email = $2', [hashedPassword, cleanEmail]);
  await db.query('DELETE FROM "Otp" WHERE email = $1', [cleanEmail]);

  return ApiResponse.send(res, 200, null, 'Password has been reset successfully. You can now login.');
});
