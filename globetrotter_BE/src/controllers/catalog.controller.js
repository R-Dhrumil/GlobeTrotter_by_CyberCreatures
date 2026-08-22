import { db } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get cities with search, filter by region/country, and sorting
 */
export const getCities = catchAsync(async (req, res) => {
  const { search, region, country, state, costIndex, sortBy } = req.query;

  const whereConditions = [];
  const params = [];
  let paramIdx = 1;

  if (search) {
    whereConditions.push(`(c.name ILIKE $${paramIdx} OR c.state ILIKE $${paramIdx} OR c.country ILIKE $${paramIdx} OR c.description ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }

  if (region && region !== 'ALL') {
    whereConditions.push(`c.region ILIKE $${paramIdx++}`);
    params.push(region);
  }

  if (country) {
    whereConditions.push(`c.country ILIKE $${paramIdx++}`);
    params.push(country);
  }

  if (state) {
    whereConditions.push(`c.state ILIKE $${paramIdx++}`);
    params.push(state);
  }

  if (costIndex) {
    whereConditions.push(`c."costIndex" = $${paramIdx++}`);
    params.push(parseInt(costIndex, 10));
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  let orderClause = 'ORDER BY c."popularityScore" DESC';
  if (sortBy === 'name') orderClause = 'ORDER BY c.name ASC';
  if (sortBy === 'cost_asc') orderClause = 'ORDER BY c."costIndex" ASC';
  if (sortBy === 'cost_desc') orderClause = 'ORDER BY c."costIndex" DESC';
  if (sortBy === 'popularity') orderClause = 'ORDER BY c."popularityScore" DESC';

  const queryText = `
    SELECT c.*, 
           (SELECT COUNT(*)::int FROM "Activity" a WHERE a."cityId" = c.id) as act_count
    FROM "City" c
    ${whereClause}
    ${orderClause}
  `;

  const citiesRes = await db.query(queryText, params);

  const cities = citiesRes.rows.map((row) => {
    const { act_count, ...city } = row;
    return {
      ...city,
      _count: { activities: act_count },
    };
  });

  return ApiResponse.send(res, 200, { cities, total: cities.length }, 'Cities catalog retrieved');
});

/**
 * Get city by ID with all its curated activities
 */
export const getCityById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const cityRes = await db.query('SELECT * FROM "City" WHERE id = $1', [id]);
  if (cityRes.rows.length === 0) {
    throw new ApiError(404, 'City not found');
  }
  const city = cityRes.rows[0];

  const activitiesRes = await db.query(
    'SELECT * FROM "Activity" WHERE "cityId" = $1 ORDER BY cost ASC',
    [id]
  );
  city.activities = activitiesRes.rows;

  return ApiResponse.send(res, 200, { city }, 'City details retrieved');
});

/**
 * Get activities with search, cityId filter, category filter, cost filter
 */
export const getActivities = catchAsync(async (req, res) => {
  const { search, cityId, category, maxCost, minCost } = req.query;

  const whereConditions = [];
  const params = [];
  let paramIdx = 1;

  if (search) {
    whereConditions.push(`(a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }

  if (cityId) {
    whereConditions.push(`a."cityId" = $${paramIdx++}`);
    params.push(cityId);
  }

  if (category && category !== 'ALL') {
    whereConditions.push(`a.category ILIKE $${paramIdx++}`);
    params.push(category);
  }

  if (minCost) {
    whereConditions.push(`a.cost >= $${paramIdx++}`);
    params.push(parseFloat(minCost));
  }

  if (maxCost) {
    whereConditions.push(`a.cost <= $${paramIdx++}`);
    params.push(parseFloat(maxCost));
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const queryText = `
    SELECT a.*, json_build_object('id', c.id, 'name', c.name, 'country', c.country) as city
    FROM "Activity" a
    LEFT JOIN "City" c ON a."cityId" = c.id
    ${whereClause}
    ORDER BY a.cost ASC
  `;

  const activitiesRes = await db.query(queryText, params);

  return ApiResponse.send(res, 200, { activities: activitiesRes.rows, total: activitiesRes.rows.length }, 'Activities catalog retrieved');
});

/**
 * Get featured/trending destinations for Home Page
 */
export const getFeaturedDestinations = catchAsync(async (req, res) => {
  const queryText = `
    SELECT c.*, 
           (SELECT COUNT(*)::int FROM "Activity" a WHERE a."cityId" = c.id) as act_count
    FROM "City" c
    ORDER BY c."popularityScore" DESC
    LIMIT 6
  `;

  const featuredRes = await db.query(queryText);

  const featured = featuredRes.rows.map((row) => {
    const { act_count, ...city } = row;
    return {
      ...city,
      _count: { activities: act_count },
    };
  });

  return ApiResponse.send(res, 200, { featured }, 'Featured destinations retrieved');
});

/**
 * Pinterest-style Gallery feed with photo assets, filters, and tags
 */
export const getGallery = catchAsync(async (req, res) => {
  const { tag, search } = req.query;
  const userId = req.user?.id; // from softAuthenticate

  // 1. Fetch Spots (Sightseeing, Adventure, Nature) & Foods
  const activitiesRes = await db.query(
    `SELECT a.*, json_build_object('id', c.id, 'name', c.name, 'country', c.country) as city
     FROM "Activity" a
     LEFT JOIN "City" c ON a."cityId" = c.id
     WHERE a.category IN ('Sightseeing', 'Adventure', 'Nature', 'Food & Drink', 'Culinary')`
  );

  // 2. Fetch Public Trips
  const tripsRes = await db.query(
    `SELECT t.id, t.name, t.description, t."coverPhotoUrl", t."shareSlug",
            json_build_object('id', u.id, 'name', u.name) as creator
     FROM "Trip" t
     LEFT JOIN "User" u ON t."userId" = u.id
     WHERE t."isPublic" = true`
  );

  let galleryItems = [];
  let likedItemsMap = {};
  let savedTripsMap = {};

  if (userId) {
    const likesRes = await db.query('SELECT "itemId", "itemType" FROM "LikedItem" WHERE "userId" = $1', [userId]);
    likesRes.rows.forEach(row => {
      likedItemsMap[`${row.itemType}-${row.itemId}`] = true;
    });

    const savesRes = await db.query('SELECT "tripId" FROM "SavedTrip" WHERE "userId" = $1', [userId]);
    savesRes.rows.forEach(row => {
      savedTripsMap[row.tripId] = true;
    });
  }

  activitiesRes.rows.forEach((a, index) => {
    if (a.imageUrl) {
      const isFood = ['Food & Drink', 'Culinary'].includes(a.category);
      galleryItems.push({
        id: a.id,
        itemType: 'ACTIVITY',
        title: a.name,
        subtitle: `${a.city?.name || 'World'}, ${a.city?.country || ''}`,
        imageUrl: a.imageUrl,
        tag: isFood ? 'Food & Drink' : 'Spots',
        category: a.category,
        description: a.description,
        heightRatio: index % 2 === 0 ? 'tall' : 'medium',
        likesCount: 85 + index * 9,
        isLiked: !!likedItemsMap[`ACTIVITY-${a.id}`],
      });
    }
  });

  tripsRes.rows.forEach((t, index) => {
    if (t.coverPhotoUrl) {
      galleryItems.push({
        id: t.id,
        itemType: 'TRIP',
        title: t.name,
        subtitle: `Curated by ${t.creator?.name || 'Traveler'}`,
        imageUrl: t.coverPhotoUrl,
        tag: 'Public Trips',
        category: 'Trip',
        description: t.description,
        shareSlug: t.shareSlug,
        heightRatio: index % 3 === 0 ? 'tall' : 'square',
        likesCount: 120 + index * 12,
        isLiked: !!likedItemsMap[`TRIP-${t.id}`],
        isSaved: !!savedTripsMap[t.id],
      });
    }
  });

  // Deterministic shuffle based on ID to avoid hydration issues, or just a simple sort
  galleryItems.sort((a, b) => a.id.localeCompare(b.id));

  if (tag && tag !== 'ALL') {
    galleryItems = galleryItems.filter(
      (item) => item.tag.toLowerCase() === tag.toLowerCase() || item.category.toLowerCase() === tag.toLowerCase()
    );
  }

  if (search) {
    const s = search.toLowerCase();
    galleryItems = galleryItems.filter(
      (item) => item.title.toLowerCase().includes(s) || item.description?.toLowerCase().includes(s)
    );
  }

  return ApiResponse.send(res, 200, { items: galleryItems, total: galleryItems.length }, 'Gallery feed retrieved');
});

/**
 * Get Country -> State -> City hierarchy for cascading dropdowns and grouped catalogs
 */
export const getHierarchy = catchAsync(async (req, res) => {
  const citiesRes = await db.query(
    'SELECT id, name, state, country, region, "costIndex", "popularityScore", lat, lng, "imageUrl", description FROM "City" ORDER BY country ASC, state ASC, name ASC'
  );

  const hierarchyMap = {};
  citiesRes.rows.forEach((c) => {
    const country = c.country || 'Other';
    const state = c.state || 'General';

    if (!hierarchyMap[country]) {
      hierarchyMap[country] = { country, states: {} };
    }
    if (!hierarchyMap[country].states[state]) {
      hierarchyMap[country].states[state] = { state, cities: [] };
    }
    hierarchyMap[country].states[state].cities.push(c);
  });

  const hierarchy = Object.values(hierarchyMap).map((cObj) => ({
    country: cObj.country,
    states: Object.values(cObj.states),
  }));

  return ApiResponse.send(res, 200, { hierarchy }, 'Location hierarchy retrieved');
});

/**
 * Get public trips for the homepage explore section
 */
export const getPublicTrips = catchAsync(async (req, res) => {
  const { limit = 8 } = req.query;

  const tripsRes = await db.query(
    `SELECT t.id, t.name, t.description, t."coverPhotoUrl", t."startDate", t."endDate", t."shareSlug", t."createdAt",
            json_build_object('id', u.id, 'name', u.name, 'photoUrl', u."photoUrl") as creator,
            (SELECT COUNT(*) FROM "Stop" s WHERE s."tripId" = t.id) as "stopCount",
            (SELECT COUNT(*) FROM "GroupMember" gm WHERE gm."tripId" = t.id) as "groupMemberCount"
     FROM "Trip" t
     LEFT JOIN "User" u ON t."userId" = u.id
     WHERE t."isPublic" = true
     ORDER BY t."createdAt" DESC
     LIMIT $1`,
    [parseInt(limit)]
  );

  return ApiResponse.send(res, 200, { trips: tripsRes.rows }, 'Public trips retrieved');
});

/**
 * Toggle Like on Activity or Trip
 */
export const toggleLike = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { itemId, itemType } = req.body;

  const check = await db.query(
    'SELECT * FROM "LikedItem" WHERE "userId" = $1 AND "itemId" = $2 AND "itemType" = $3',
    [userId, itemId, itemType]
  );

  let isLiked = false;
  if (check.rows.length > 0) {
    await db.query(
      'DELETE FROM "LikedItem" WHERE "userId" = $1 AND "itemId" = $2 AND "itemType" = $3',
      [userId, itemId, itemType]
    );
    isLiked = false;
  } else {
    await db.query(
      `INSERT INTO "LikedItem" (id, "userId", "itemId", "itemType", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      [userId, itemId, itemType]
    );
    isLiked = true;
  }

  return ApiResponse.send(res, 200, { isLiked }, isLiked ? 'Item liked' : 'Item unliked');
});

/**
 * Toggle Save Trip
 */
export const toggleSaveTrip = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { tripId } = req.body;

  const check = await db.query(
    'SELECT * FROM "SavedTrip" WHERE "userId" = $1 AND "tripId" = $2',
    [userId, tripId]
  );

  let isSaved = false;
  if (check.rows.length > 0) {
    await db.query(
      'DELETE FROM "SavedTrip" WHERE "userId" = $1 AND "tripId" = $2',
      [userId, tripId]
    );
    isSaved = false;
  } else {
    await db.query(
      `INSERT INTO "SavedTrip" (id, "userId", "tripId", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, NOW())`,
      [userId, tripId]
    );
    isSaved = true;
  }

  return ApiResponse.send(res, 200, { isSaved }, isSaved ? 'Trip saved' : 'Trip unsaved');
});

const DEFAULT_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', ratePerInr: 1.0, isBase: true, enabled: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', ratePerInr: 0.012, isBase: false, enabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', ratePerInr: 0.011, isBase: false, enabled: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', ratePerInr: 0.0095, isBase: false, enabled: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', ratePerInr: 0.044, isBase: false, enabled: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', ratePerInr: 1.82, isBase: false, enabled: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', ratePerInr: 0.018, isBase: false, enabled: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', ratePerInr: 0.016, isBase: false, enabled: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', ratePerInr: 0.016, isBase: false, enabled: true },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', ratePerInr: 0.42, isBase: false, enabled: true },
];

/**
 * Get active currency settings & exchange rates
 */
export const getCurrencies = catchAsync(async (req, res) => {
  const resCurrency = await db.query('SELECT * FROM "SiteSetting" WHERE "group" = $1', ['CURRENCY']);
  let baseCurrency = 'INR';
  let currencies = DEFAULT_CURRENCIES;

  resCurrency.rows.forEach((s) => {
    if (s.key === 'currency_base') baseCurrency = s.value;
    if (s.key === 'currency_rates') {
      try {
        const parsed = JSON.parse(s.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currencies = parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
  });

  return ApiResponse.send(
    res,
    200,
    { baseCurrency, currencies, enabledCurrencies: currencies.filter((c) => c.enabled !== false) },
    'Currencies retrieved successfully'
  );
});

