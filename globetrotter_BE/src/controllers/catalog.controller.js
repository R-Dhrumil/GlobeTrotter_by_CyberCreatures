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
  const { tripId } = req.body;
  if (!tripId) {
    throw new ApiError(400, 'Trip ID is required');
  }

  const existingRes = await db.query(
    'SELECT * FROM "SavedTrip" WHERE "userId" = $1 AND "tripId" = $2',
    [req.user.id, tripId]
  );

  if (existingRes.rows.length > 0) {
    await db.query('DELETE FROM "SavedTrip" WHERE id = $1', [existingRes.rows[0].id]);
    return ApiResponse.send(res, 200, { isSaved: false }, 'Trip unsaved');
  } else {
    await db.query(
      'INSERT INTO "SavedTrip" ("userId", "tripId") VALUES ($1, $2)',
      [req.user.id, tripId]
    );
    return ApiResponse.send(res, 200, { isSaved: true }, 'Trip saved');
  }
});

/**
 * Temporary endpoint to seed winter gallery places
 */
export const seedWinterGallery = catchAsync(async (req, res) => {
  const places = [
    { city: "Shimla & Manali", state: "Himachal Pradesh", title: "Snow, Skiing, and Christmas Vibes", desc: "Shimla and Manali are the perfect places to visit in winter in India for those who love the cold and snow. These hill stations offer stunning views, charming colonial architecture, and activities like skiing, snowboarding, and even sledging.", img: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=800&auto=format&fit=crop", category: "Adventure" },
    { city: "Srinagar & Pahalgam", state: "Jammu & Kashmir", title: "A Winter Paradise", desc: "Srinagar and Pahalgam in Jammu & Kashmir offer a perfect blend of natural beauty, adventure, and cultural experiences in the winter months. Srinagar, with its iconic Dal Lake and snow-capped mountains, becomes a dreamy winter wonderland.", img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop", category: "Nature" },
    { city: "Mussoorie", state: "Uttarakhand", title: "A Charming Hill Station", desc: "Mussoorie, often referred to as the 'Queen of Hills,' transforms into a winter wonderland during the colder months. Known for its scenic beauty and colonial charm, It is a popular destination for those seeking a winter retreat.", img: "https://images.unsplash.com/photo-1626714485856-11bf2be33ce1?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Jaipur & Udaipur", state: "Rajasthan", title: "Royal Forts and Palaces", desc: "Rajasthan’s royal cities, Jaipur and Udaipur, are stunning in winter. The cooler temperatures make it ideal for exploring the majestic palaces and forts without the scorching heat.", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Rann of Kutch", state: "Gujarat", title: "Rann Utsav", desc: "The Rann of Kutch in Gujarat offers a unique winter experience. The Rann Utsav, a cultural festival held from November to February, celebrates the culture of Gujarat through dance, music, and local handicrafts.", img: "https://images.unsplash.com/photo-1598254426543-03e0ddfd7d3c?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Goa", state: "Goa", title: "Sunburn Festival & Parties", desc: "Goa in December is a hotspot for tourists looking to enjoy the winter sun. The Sunburn Festival and various Christmas and New Year parties attract thousands every year.", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop", category: "Adventure" },
    { city: "Munnar & Kovalam", state: "Kerala", title: "Serene Hill Stations and Coastal Bliss", desc: "Munnar, with its rolling tea gardens and misty hills, provides a serene escape, ideal for nature lovers. Kovalam, with its pristine beaches, offers a perfect place to unwind.", img: "https://images.unsplash.com/photo-1593693397690-362cb9739cb2?q=80&w=800&auto=format&fit=crop", category: "Nature" },
    { city: "Andaman & Nicobar", state: "Andaman & Nicobar Islands", title: "Scuba Diving & Pristine Beaches", desc: "Offering some of the best beaches and crystal-clear waters in the country, this tropical paradise is a haven for water sports enthusiasts, especially those looking to indulge in scuba diving.", img: "https://images.unsplash.com/photo-1589136777351-fdc9c9cb15af?q=80&w=800&auto=format&fit=crop", category: "Adventure" },
    { city: "Shillong", state: "Meghalaya", title: "Music & Misty Landscapes", desc: "Shillong, often referred to as the “Scotland of the East,” is a beautiful hill station in Meghalaya. Known for its misty landscapes, tranquil vibes, and vibrant music culture.", img: "https://images.unsplash.com/photo-1598910404364-79357494ec2d?q=80&w=800&auto=format&fit=crop", category: "Nature" },
    { city: "Tawang", state: "Arunachal Pradesh", title: "Monasteries & Cultural Richness", desc: "Tawang, located in the northeastern tip of Arunachal Pradesh, is a hidden gem offering a blend of snow-capped mountains, Tibetan culture, and serene landscapes.", img: "https://images.unsplash.com/photo-1626017387224-10ec693ec89f?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Leh-Ladakh", state: "Ladakh", title: "Frozen River Trekking", desc: "For adventure lovers, Leh-Ladakh is one of the most thrilling places to visit in winter in India. January is the ideal time to experience the Chadar Trek, a world-famous trek across the frozen Zanskar River.", img: "https://images.unsplash.com/photo-1594803975551-7892eb463a86?q=80&w=800&auto=format&fit=crop", category: "Adventure" },
    { city: "Pondicherry", state: "Puducherry", title: "French Charm and Serene Beaches", desc: "Known for its French colonial architecture, charming streets, and serene beaches, this coastal town offers a peaceful ambiance perfect for unwinding.", img: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Jaisalmer", state: "Rajasthan", title: "Desert Safaris and Festival", desc: "Jaisalmer, often called the “Golden City,” is a magical destination in Rajasthan known for its golden sandstone architecture and vast desert landscapes.", img: "https://images.unsplash.com/photo-1599059021750-82716ae2b6e1?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Darjeeling", state: "West Bengal", title: "Tea Estates and Toy Train", desc: "For those who enjoy the cool, misty weather, Darjeeling offers a delightful winter retreat. January brings snow to the higher altitudes, giving the hill station a magical feel.", img: "https://images.unsplash.com/photo-1544256729-15886ea5278c?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Ranthambore", state: "Rajasthan", title: "Tiger Spotting", desc: "For wildlife enthusiasts, Ranthambore National Park in Rajasthan offers one of the best winter experiences. January is a prime time for tiger spotting.", img: "https://images.unsplash.com/photo-1596711681283-e1f4094a6135?q=80&w=800&auto=format&fit=crop", category: "Nature" },
    { city: "Varanasi", state: "Uttar Pradesh", title: "Spiritual Vibes & Dev Deepawali", desc: "Varanasi, the spiritual heart of India, is especially beautiful in January. The cooler weather makes exploring the ghats and temples much more comfortable.", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Coorg", state: "Karnataka", title: "Coffee Estates & Winter Trekking", desc: "Nestled in the Western Ghats, Coorg is a beautiful hill station in Karnataka that’s perfect for a winter retreat. The cool, misty weather enhances its lush coffee estates.", img: "https://images.unsplash.com/photo-1601736630043-41a4fa0a4305?q=80&w=800&auto=format&fit=crop", category: "Nature" },
    { city: "Mahabaleshwar", state: "Maharashtra", title: "Strawberries and Cool Climate", desc: "Located in the Sahyadri hills, Mahabaleshwar is a charming hill station in Maharashtra that becomes particularly inviting during the winter months.", img: "https://images.unsplash.com/photo-1616053328599-282bda639ba3?q=80&w=800&auto=format&fit=crop", category: "Nature" },
    { city: "Spiti Valley", state: "Himachal Pradesh", title: "Frozen Beauty", desc: "Spiti Valley is a hidden treasure in the Himalayas that offers dramatic landscapes and a chance to experience the raw beauty of nature.", img: "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?q=80&w=800&auto=format&fit=crop", category: "Adventure" },
    { city: "Khajuraho", state: "Madhya Pradesh", title: "Temples & Cultural Festival", desc: "Known for its intricate temples and stunning architecture, Khajuraho is especially captivating in February when the Khajuraho Dance Festival takes place.", img: "https://images.unsplash.com/photo-1594950346383-7c30f40d4133?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" },
    { city: "Ziro Valley", state: "Arunachal Pradesh", title: "Scenic Winter Landscapes", desc: "Ziro Valley in Arunachal Pradesh is a hidden gem perfect for nature lovers and those looking for an offbeat winter getaway.", img: "https://images.unsplash.com/photo-1563212002-c67db1853f65?q=80&w=800&auto=format&fit=crop", category: "Nature" },
    { city: "Hampi", state: "Karnataka", title: "Ruins and Pleasant Winter Weather", desc: "Hampi, the UNESCO World Heritage Site in Karnataka, is a stunning blend of history, culture, and natural beauty.", img: "https://images.unsplash.com/photo-1600010998849-0639965d1389?q=80&w=800&auto=format&fit=crop", category: "Sightseeing" }
  ];

  for (const p of places) {
    const cityRes = await db.query(
      `INSERT INTO "City" (name, country, region, "imageUrl", description)
       VALUES ($1, 'India', $2, $3, $4)
       RETURNING id`,
      [p.city, p.state, p.img, p.desc]
    );
    const cityId = cityRes.rows[0].id;

    await db.query(
      `INSERT INTO "Activity" ("cityId", name, category, cost, "durationMinutes", description, "imageUrl")
       VALUES ($1, $2, $3, 0, 120, $4, $5)`,
      [cityId, p.title, p.category, p.desc, p.img]
    );
  }

  return ApiResponse.send(res, 200, null, 'Winter places seeded successfully');
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

