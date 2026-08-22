import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { db } from '../config/db.js';

export const authenticate = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please provide a valid Bearer token in headers.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const { rows } = await db.query('SELECT * FROM "User" WHERE id = $1', [decoded.id]);
    const user = rows[0];

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account no longer exists or is deactivated.');
    }

    delete user.password;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Invalid or expired authentication token');
    }
    throw error;
  }
});
