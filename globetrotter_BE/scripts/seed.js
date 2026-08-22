import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

const query = (text, params) => pool.query(text, params);

async function main() {
  console.log('🌱 Starting GlobeTrotter Database Seeding...');

  try {
    await query('DELETE FROM "StopActivity"');
    await query('DELETE FROM "Stop"');
    await query('DELETE FROM "Budget"');
    await query('DELETE FROM "Transaction"');
    await query('DELETE FROM "Trip"');
    await query('DELETE FROM "Activity"');
    await query('DELETE FROM "City"');
    await query('DELETE FROM "SiteSetting"');
    await query('DELETE FROM "ContactMessage"');
    await query('DELETE FROM "Otp"');
    await query('DELETE FROM "User"');
  } catch (err) {
    console.log('⚠️ Notice during cleanup:', err.message);
  }

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('Traveler@123', 10);

  const adminRes = await query(
    `INSERT INTO "User" (id, name, email, password, role, department, "photoUrl", "languagePref", status, "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    ['GlobeTrotter Admin', 'admin@globetrotter.com', adminPassword, 'ADMIN', 'Platform Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'en', 'ACTIVE']
  );
  const admin = adminRes.rows[0];

  const travelerRes = await query(
    `INSERT INTO "User" (id, name, email, password, role, department, "photoUrl", "languagePref", status, "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    ['Alex Rivera', 'traveler@globetrotter.com', userPassword, 'USER', 'Solo Explorer', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 'en', 'ACTIVE']
  );
  const traveler = travelerRes.rows[0];

  console.log(`✅ Users created: Admin (${admin.email}), Traveler (${traveler.email})`);

  const citiesData = [
    { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 4, popularityScore: 98, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', description: 'A captivating metropolis blending neon-lit skyscrapers with historic shrines, unparalleled cuisine, and vibrant neighborhoods.' },
    { name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 3, popularityScore: 94, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', description: 'The cultural heart of Japan, boasting thousands of classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.' },
    { name: 'Paris', country: 'France', region: 'Europe', costIndex: 4, popularityScore: 99, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', description: 'The City of Light offers world-class art, fashion, gastronomy, and historic architecture along the meandering Seine river.' },
    { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 3, popularityScore: 96, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', description: 'An open-air museum where nearly 3,000 years of globally influential art, architecture, and culture are on display at every cobblestone corner.' },
    { name: 'Santorini', country: 'Greece', region: 'Europe', costIndex: 4, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', description: 'Famous for whitewashed cliffside villages, cobalt blue domes, volcanic beaches, and legendary Aegean sunsets.' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 2, popularityScore: 97, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', description: 'An Indonesian paradise known for forested volcanic mountains, iconic rice paddies, pristine surf beaches, and holistic coral reefs.' },
    { name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 2, popularityScore: 91, imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80', description: 'A dramatic coastal city crowned by Table Mountain, offering world-class wine valleys, penguins on golden beaches, and rich cultural tapestry.' },
    { name: 'Banff', country: 'Canada', region: 'North America', costIndex: 4, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80', description: 'A rugged mountain wonderland in the heart of the Canadian Rockies, featuring turquoise glacial lakes and alpine wildlife.' },
    { name: 'New York City', country: 'United States', region: 'North America', costIndex: 5, popularityScore: 97, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', description: 'The energetic global center for theater, art, gastronomy, and iconic skylines stretching across five dynamic boroughs.' },
    { name: 'Reykjavik', country: 'Iceland', region: 'Europe', costIndex: 5, popularityScore: 89, imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80', description: 'Gateway to geothermal lagoons, cascading waterfalls, black sand beaches, and otherworldly Northern Lights displays.' },
  ];

  const createdCities = {};
  for (const c of citiesData) {
    const res = await query(
      `INSERT INTO "City" (id, name, country, region, "costIndex", "popularityScore", "imageUrl", description, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [c.name, c.country, c.region, c.costIndex, c.popularityScore, c.imageUrl, c.description]
    );
    createdCities[c.name] = res.rows[0];
  }
  console.log(`✅ Created ${Object.keys(createdCities).length} cities in catalog.`);

  const activitiesData = [
    { cityName: 'Tokyo', name: 'Shibuya Crossing & Harajuku Food Tour', category: 'Food & Drink', cost: 65, durationMinutes: 180, description: 'Taste savory street eats, fluffy pancakes, and explore Shibuya.', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Tokyo', name: 'TeamLab Planets Immersive Digital Art', category: 'Culture', cost: 38, durationMinutes: 120, description: 'Walk through water and digital flower gardens.', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kyoto', name: 'Fushimi Inari Torii Gate Hike', category: 'Nature', cost: 0, durationMinutes: 150, description: 'Ascend Mount Inari through thousands of vermilion shrine gates.', imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Paris', name: 'Louvre Highlights Tour', category: 'Culture', cost: 55, durationMinutes: 150, description: 'Priority skip-the-line tour through the Louvre.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Rome', name: 'Colosseum Underground Tour', category: 'Sightseeing', cost: 80, durationMinutes: 180, description: 'Access subterranean tunnels and arena floor.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
  ];

  const createdActivities = [];
  for (const act of activitiesData) {
    const city = createdCities[act.cityName];
    if (city) {
      const res = await query(
        `INSERT INTO "Activity" (id, "cityId", name, category, cost, "durationMinutes", description, "imageUrl", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [city.id, act.name, act.category, act.cost, act.durationMinutes, act.description, act.imageUrl]
      );
      createdActivities.push(res.rows[0]);
    }
  }
  console.log(`✅ Created ${createdActivities.length} activities in catalog.`);

  const trip1Res = await query(
    `INSERT INTO "Trip" (id, "userId", name, "startDate", "endDate", description, "coverPhotoUrl", "isPublic", "shareSlug", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [traveler.id, 'Grand Japan Discovery: Tokyo to Kyoto', '2026-09-10', '2026-09-18', 'A nine-day adventure in Japan.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', true, 'japan-discovery-2026']
  );
  const trip1 = trip1Res.rows[0];

  const stop1Res = await query(
    `INSERT INTO "Stop" (id, "tripId", "cityId", "orderIndex", "arrivalDate", "departureDate", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [trip1.id, createdCities['Tokyo'].id, 0, '2026-09-10', '2026-09-14']
  );
  const stop1 = stop1Res.rows[0];

  if (createdActivities[0]) {
    await query(
      `INSERT INTO "StopActivity" (id, "stopId", "activityId", "scheduledDate", "scheduledTime", notes, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [stop1.id, createdActivities[0].id, '2026-09-11', '10:00 AM', 'Meet guide at Hachiko statue.']
    );
  }

  await query(
    `INSERT INTO "Budget" (id, "tripId", category, "estimatedAmount", "actualAmount", notes, "updatedAt")
     VALUES (gen_random_uuid(), $1, 'TRANSPORT', 750, 710, 'Bullet train & flights', NOW()),
            (gen_random_uuid(), $1, 'STAY', 1200, 1150, 'Hotel stays', NOW()),
            (gen_random_uuid(), $1, 'MEALS', 600, 640, 'Dining out', NOW())`,
    [trip1.id]
  );

  const defaultSettings = [
    { key: 'seo_home_title', value: 'GlobeTrotter | Curated Travel Planning & Epic Journeys', group: 'SEO' },
    { key: 'seo_home_description', value: 'Design your dream itinerary with GlobeTrotter.', group: 'SEO' },
    { key: 'smtp_from_email', value: 'concierge@globetrotter.com', group: 'SMTP' },
  ];

  for (const s of defaultSettings) {
    await query(
      `INSERT INTO "SiteSetting" (id, key, value, group, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [s.key, s.value, s.group]
    );
  }

  console.log('🎉 GlobeTrotter database successfully seeded via pg!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
