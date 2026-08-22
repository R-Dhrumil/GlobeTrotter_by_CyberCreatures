import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get cities with search, filter by region/country, and sorting
 */
export const getCities = catchAsync(async (req, res) => {
  const { search, region, country, costIndex, sortBy } = req.query;

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (region && region !== 'ALL') {
    where.region = { equals: region, mode: 'insensitive' };
  }

  if (country) {
    where.country = { equals: country, mode: 'insensitive' };
  }

  if (costIndex) {
    where.costIndex = parseInt(costIndex, 10);
  }

  let orderBy = { popularityScore: 'desc' };
  if (sortBy === 'name') orderBy = { name: 'asc' };
  if (sortBy === 'cost_asc') orderBy = { costIndex: 'asc' };
  if (sortBy === 'cost_desc') orderBy = { costIndex: 'desc' };
  if (sortBy === 'popularity') orderBy = { popularityScore: 'desc' };

  const cities = await prisma.city.findMany({
    where,
    include: {
      _count: {
        select: { activities: true },
      },
    },
    orderBy,
  });

  return ApiResponse.send(res, 200, { cities, total: cities.length }, 'Cities catalog retrieved');
});

/**
 * Get city by ID with all its curated activities
 */
export const getCityById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const city = await prisma.city.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { cost: 'asc' },
      },
    },
  });

  if (!city) {
    throw new ApiError(404, 'City not found');
  }

  return ApiResponse.send(res, 200, { city }, 'City details retrieved');
});

/**
 * Get activities with search, cityId filter, category filter, cost filter
 */
export const getActivities = catchAsync(async (req, res) => {
  const { search, cityId, category, maxCost, minCost } = req.query;

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (cityId) {
    where.cityId = cityId;
  }

  if (category && category !== 'ALL') {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (maxCost || minCost) {
    where.cost = {};
    if (minCost) where.cost.gte = parseFloat(minCost);
    if (maxCost) where.cost.lte = parseFloat(maxCost);
  }

  const activities = await prisma.activity.findMany({
    where,
    include: {
      city: {
        select: { id: true, name: true, country: true },
      },
    },
    orderBy: { cost: 'asc' },
  });

  return ApiResponse.send(res, 200, { activities, total: activities.length }, 'Activities catalog retrieved');
});

/**
 * Get featured/trending destinations for Home Page
 */
export const getFeaturedDestinations = catchAsync(async (req, res) => {
  const featured = await prisma.city.findMany({
    take: 6,
    orderBy: { popularityScore: 'desc' },
    include: {
      _count: {
        select: { activities: true },
      },
    },
  });

  return ApiResponse.send(res, 200, { featured }, 'Featured destinations retrieved');
});

/**
 * Pinterest-style Gallery feed with photo assets, filters, and tags
 */
export const getGallery = catchAsync(async (req, res) => {
  const { tag, search } = req.query;

  // Pull images from Cities, Activities, and Public Trips
  const cities = await prisma.city.findMany({
    select: { id: true, name: true, country: true, region: true, imageUrl: true, description: true },
  });

  const activities = await prisma.activity.findMany({
    include: { city: true },
  });

  let galleryItems = [];

  // Transform cities to gallery items
  cities.forEach((c, index) => {
    if (c.imageUrl) {
      galleryItems.push({
        id: `city-${c.id}`,
        title: `${c.name}, ${c.country}`,
        subtitle: `${c.region} Region`,
        imageUrl: c.imageUrl,
        tag: c.region,
        category: 'Destination',
        description: c.description,
        heightRatio: index % 3 === 0 ? 'tall' : index % 2 === 0 ? 'medium' : 'square',
        likesCount: 120 + index * 17,
      });
    }
  });

  // Transform activities to gallery items
  activities.forEach((a, index) => {
    if (a.imageUrl) {
      galleryItems.push({
        id: `act-${a.id}`,
        title: a.name,
        subtitle: `${a.city?.name || 'World'}, ${a.city?.country || ''}`,
        imageUrl: a.imageUrl,
        tag: a.category,
        category: a.category,
        description: a.description,
        heightRatio: index % 2 === 0 ? 'tall' : 'medium',
        likesCount: 85 + index * 9,
      });
    }
  });

  // Filter if tag provided
  if (tag && tag !== 'ALL') {
    galleryItems = galleryItems.filter(
      (item) => item.tag.toLowerCase() === tag.toLowerCase() || item.category.toLowerCase() === tag.toLowerCase()
    );
  }

  // Filter if search provided
  if (search) {
    const s = search.toLowerCase();
    galleryItems = galleryItems.filter(
      (item) => item.title.toLowerCase().includes(s) || item.description?.toLowerCase().includes(s)
    );
  }

  return ApiResponse.send(res, 200, { items: galleryItems, total: galleryItems.length }, 'Gallery feed retrieved');
});
