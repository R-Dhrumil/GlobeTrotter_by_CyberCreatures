import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Add an activity to a specific stop
 */
export const addStopActivity = catchAsync(async (req, res) => {
  const { stopId } = req.params;
  const { activityId, scheduledDate, scheduledTime, notes } = req.body;

  if (!activityId) {
    throw new ApiError(400, 'Activity ID is required');
  }

  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop) {
    throw new ApiError(404, 'Stop not found');
  }

  if (stop.trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to add activities to this stop');
  }

  const stopActivity = await prisma.stopActivity.create({
    data: {
      stopId,
      activityId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime: scheduledTime || '',
      notes: notes || '',
    },
    include: {
      activity: true,
    },
  });

  return ApiResponse.send(res, 201, { stopActivity }, 'Activity added to stop');
});

/**
 * Update a scheduled stop activity (notes, time, date)
 */
export const updateStopActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { scheduledDate, scheduledTime, notes } = req.body;

  const stopActivity = await prisma.stopActivity.findUnique({
    where: { id },
    include: {
      stop: { include: { trip: true } },
      activity: true,
    },
  });

  if (!stopActivity) {
    throw new ApiError(404, 'Stop activity item not found');
  }

  if (stopActivity.stop.trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to update this activity');
  }

  const updated = await prisma.stopActivity.update({
    where: { id },
    data: {
      ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
      ...(scheduledTime !== undefined && { scheduledTime }),
      ...(notes !== undefined && { notes }),
    },
    include: {
      activity: true,
    },
  });

  return ApiResponse.send(res, 200, { stopActivity: updated }, 'Activity schedule updated');
});

/**
 * Remove an activity from a stop
 */
export const deleteStopActivity = catchAsync(async (req, res) => {
  const { id } = req.params;

  const stopActivity = await prisma.stopActivity.findUnique({
    where: { id },
    include: {
      stop: { include: { trip: true } },
    },
  });

  if (!stopActivity) {
    throw new ApiError(404, 'Stop activity not found');
  }

  if (stopActivity.stop.trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to remove this activity');
  }

  await prisma.stopActivity.delete({ where: { id } });

  return ApiResponse.send(res, 200, null, 'Activity removed from stop');
});
