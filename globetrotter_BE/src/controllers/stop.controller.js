import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Add a stop/city to a trip
 */
export const addStop = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const { cityId, arrivalDate, departureDate, orderIndex } = req.body;

  if (!cityId) {
    throw new ApiError(400, 'City ID is required');
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to add stops to this trip');
  }

  // Determine orderIndex if not provided
  let finalOrderIndex = orderIndex;
  if (finalOrderIndex === undefined) {
    const count = await prisma.stop.count({ where: { tripId } });
    finalOrderIndex = count;
  }

  const stop = await prisma.stop.create({
    data: {
      tripId,
      cityId,
      orderIndex: finalOrderIndex,
      arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
      departureDate: departureDate ? new Date(departureDate) : null,
    },
    include: {
      city: true,
      activities: { include: { activity: true } },
    },
  });

  return ApiResponse.send(res, 201, { stop }, 'Stop added to trip successfully');
});

/**
 * Update a stop (dates, city)
 */
export const updateStop = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { cityId, arrivalDate, departureDate, orderIndex } = req.body;

  const stop = await prisma.stop.findUnique({
    where: { id },
    include: { trip: true },
  });

  if (!stop) {
    throw new ApiError(404, 'Stop not found');
  }

  if (stop.trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to edit this stop');
  }

  const updated = await prisma.stop.update({
    where: { id },
    data: {
      ...(cityId && { cityId }),
      ...(arrivalDate !== undefined && { arrivalDate: arrivalDate ? new Date(arrivalDate) : null }),
      ...(departureDate !== undefined && { departureDate: departureDate ? new Date(departureDate) : null }),
      ...(orderIndex !== undefined && { orderIndex }),
    },
    include: {
      city: true,
      activities: { include: { activity: true } },
    },
  });

  return ApiResponse.send(res, 200, { stop: updated }, 'Stop updated successfully');
});

/**
 * Delete a stop
 */
export const deleteStop = catchAsync(async (req, res) => {
  const { id } = req.params;

  const stop = await prisma.stop.findUnique({
    where: { id },
    include: { trip: true },
  });

  if (!stop) {
    throw new ApiError(404, 'Stop not found');
  }

  if (stop.trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to delete this stop');
  }

  await prisma.stop.delete({ where: { id } });

  // Re-index remaining stops
  const remainingStops = await prisma.stop.findMany({
    where: { tripId: stop.tripId },
    orderBy: { orderIndex: 'asc' },
  });

  for (let i = 0; i < remainingStops.length; i++) {
    await prisma.stop.update({
      where: { id: remainingStops[i].id },
      data: { orderIndex: i },
    });
  }

  return ApiResponse.send(res, 200, null, 'Stop removed from itinerary');
});

/**
 * Reorder stops in a trip (Drag & Drop support)
 */
export const reorderStops = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const { stopIds } = req.body; // Array of stop IDs in new order

  if (!Array.isArray(stopIds)) {
    throw new ApiError(400, 'stopIds must be an array of IDs');
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to reorder stops for this trip');
  }

  // Update order indices
  for (let i = 0; i < stopIds.length; i++) {
    await prisma.stop.updateMany({
      where: { id: stopIds[i], tripId },
      data: { orderIndex: i },
    });
  }

  const updatedStops = await prisma.stop.findMany({
    where: { tripId },
    include: {
      city: true,
      activities: { include: { activity: true } },
    },
    orderBy: { orderIndex: 'asc' },
  });

  return ApiResponse.send(res, 200, { stops: updatedStops }, 'Stops reordered successfully');
});
