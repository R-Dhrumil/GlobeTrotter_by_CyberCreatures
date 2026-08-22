import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

// Helper to generate unique share slug
const generateSlug = (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
};

/**
 * Create a new Trip
 */
export const createTrip = catchAsync(async (req, res) => {
  const { name, startDate, endDate, description, coverPhotoUrl, isPublic } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Trip name is required');
  }

  const shareSlug = generateSlug(name);

  const trip = await prisma.trip.create({
    data: {
      userId: req.user.id,
      name: name.trim(),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      description: description || '',
      coverPhotoUrl: coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      isPublic: Boolean(isPublic),
      shareSlug,
    },
    include: {
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
      budgets: true,
    },
  });

  return ApiResponse.send(res, 201, { trip }, 'Trip created successfully');
});

/**
 * Get all trips for current logged-in user
 */
export const getMyTrips = catchAsync(async (req, res) => {
  const trips = await prisma.trip.findMany({
    where: { userId: req.user.id },
    include: {
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
      budgets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return ApiResponse.send(res, 200, { trips }, 'User trips retrieved successfully');
});

/**
 * Get single trip by ID (with authorization check or public access)
 */
export const getTripById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          photoUrl: true,
        },
      },
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
      budgets: true,
    },
  });

  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  // Check access: owner or admin or public
  const isOwner = req.user && req.user.id === trip.userId;
  const isAdmin = req.user && req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin && !trip.isPublic) {
    throw new ApiError(403, 'You do not have permission to view this private trip');
  }

  return ApiResponse.send(res, 200, { trip }, 'Trip details retrieved');
});

/**
 * Update trip details
 */
export const updateTrip = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, startDate, endDate, description, coverPhotoUrl, isPublic } = req.body;

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to edit this trip');
  }

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(description !== undefined && { description }),
      ...(coverPhotoUrl !== undefined && { coverPhotoUrl }),
      ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
    },
    include: {
      stops: {
        include: {
          city: true,
          activities: { include: { activity: true } },
        },
        orderBy: { orderIndex: 'asc' },
      },
      budgets: true,
    },
  });

  return ApiResponse.send(res, 200, { trip: updated }, 'Trip updated successfully');
});

/**
 * Delete a trip
 */
export const deleteTrip = catchAsync(async (req, res) => {
  const { id } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }

  if (trip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to delete this trip');
  }

  await prisma.trip.delete({ where: { id } });

  return ApiResponse.send(res, 200, null, 'Trip deleted successfully');
});

/**
 * Get Public Shared Trip by Slug (read-only)
 */
export const getPublicTripBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const trip = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          photoUrl: true,
        },
      },
      stops: {
        include: {
          city: true,
          activities: {
            include: { activity: true },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
      budgets: true,
    },
  });

  if (!trip) {
    throw new ApiError(404, 'Shared trip not found');
  }

  if (!trip.isPublic) {
    throw new ApiError(403, 'This trip is marked as private by the author');
  }

  return ApiResponse.send(res, 200, { trip }, 'Shared trip details retrieved');
});

/**
 * Copy/Clone a public or existing trip to current user's trips
 */
export const copyTrip = catchAsync(async (req, res) => {
  const { id } = req.params;

  const sourceTrip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        include: {
          activities: true,
        },
        orderBy: { orderIndex: 'asc' },
      },
      budgets: true,
    },
  });

  if (!sourceTrip) {
    throw new ApiError(404, 'Source trip not found');
  }

  if (!sourceTrip.isPublic && sourceTrip.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Cannot copy a private trip');
  }

  const newSlug = generateSlug(`${sourceTrip.name} (Copy)`);

  const clonedTrip = await prisma.trip.create({
    data: {
      userId: req.user.id,
      name: `${sourceTrip.name} (Copy)`,
      startDate: sourceTrip.startDate,
      endDate: sourceTrip.endDate,
      description: sourceTrip.description,
      coverPhotoUrl: sourceTrip.coverPhotoUrl,
      isPublic: false,
      shareSlug: newSlug,
    },
  });

  // Clone stops and stop activities
  for (const stop of sourceTrip.stops) {
    const newStop = await prisma.stop.create({
      data: {
        tripId: clonedTrip.id,
        cityId: stop.cityId,
        orderIndex: stop.orderIndex,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
      },
    });

    for (const act of stop.activities) {
      await prisma.stopActivity.create({
        data: {
          stopId: newStop.id,
          activityId: act.activityId,
          scheduledDate: act.scheduledDate,
          scheduledTime: act.scheduledTime,
          notes: act.notes,
        },
      });
    }
  }

  // Clone budgets
  for (const b of sourceTrip.budgets) {
    await prisma.budget.create({
      data: {
        tripId: clonedTrip.id,
        category: b.category,
        estimatedAmount: b.estimatedAmount,
        actualAmount: b.actualAmount,
        notes: b.notes,
      },
    });
  }

  const completeTrip = await prisma.trip.findUnique({
    where: { id: clonedTrip.id },
    include: {
      stops: {
        include: {
          city: true,
          activities: { include: { activity: true } },
        },
        orderBy: { orderIndex: 'asc' },
      },
      budgets: true,
    },
  });

  return ApiResponse.send(res, 201, { trip: completeTrip }, 'Trip copied to your itinerary!');
});
