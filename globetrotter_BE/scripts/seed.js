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
    { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 4, popularityScore: 98, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', description: 'A captivating metropolis blending neon skyscrapers with historic shrines, robot cafes, and world-class ramen.' },
    { name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 3, popularityScore: 94, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', description: 'The cultural heart of Japan featuring thousands of classical Buddhist temples, bamboo groves, and geisha districts.' },
    { name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 2, popularityScore: 93, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80', description: 'A vibrant capital famous for ornate golden shrines, bustling floating markets, and Michelin-rated street food.' },
    { name: 'Singapore', country: 'Singapore', region: 'Asia', costIndex: 4, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80', description: 'A global garden city featuring futuristic Supertree groves, rooftop infinity pools, and multicultural hawker centers.' },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 2, popularityScore: 97, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', description: 'Island of the Gods known for volcanic mountains, iconic rice terraces, ocean surf breaks, and spiritual retreats.' },
    { name: 'Jaipur', country: 'India', region: 'Asia', costIndex: 2, popularityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80', description: 'The Pink City of Rajasthan filled with royal hill fortresses, pink sandstone palaces, and vibrant bazaars.' },

    { name: 'Paris', country: 'France', region: 'Europe', costIndex: 4, popularityScore: 99, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', description: 'The City of Light offers world-class art, fashion, gastronomy, and romantic cruises along the Seine.' },
    { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 3, popularityScore: 96, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', description: 'An open-air museum where ancient gladiator arenas, Vatican treasures, and authentic pasta trattorias meet.' },
    { name: 'London', country: 'United Kingdom', region: 'Europe', costIndex: 4, popularityScore: 97, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80', description: 'A royal metropolis home to Big Ben, historic tower fortresses, West End theatre, and classic pub culture.' },
    { name: 'Barcelona', country: 'Spain', region: 'Europe', costIndex: 3, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80', description: 'Gaudí’s surreal architectural playground, Mediterranean beaches, lively Gothic Quarter, and tapas culture.' },
    { name: 'Venice', country: 'Italy', region: 'Europe', costIndex: 4, popularityScore: 94, imageUrl: 'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?auto=format&fit=crop&w=1200&q=80', description: 'Floating city of romantic canals, gothic palaces, traditional gondola serenades, and Murano glassblowing.' },
    { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', costIndex: 4, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80', description: 'Picturesque canal ring city renowned for bicycle paths, Van Gogh art masterpieces, and historic gabled townhouses.' },
    { name: 'Prague', country: 'Czech Republic', region: 'Europe', costIndex: 2, popularityScore: 91, imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80', description: 'City of a Hundred Spires featuring fairytale castles, medieval Astronomical Clock, and iconic Charles Bridge.' },
    { name: 'Reykjavik', country: 'Iceland', region: 'Europe', costIndex: 5, popularityScore: 89, imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80', description: 'Gateway to geothermal lagoons, cascading waterfalls, black sand beaches, and Northern Lights aurora hunts.' },
    { name: 'Istanbul', country: 'Turkey', region: 'Europe', costIndex: 2, popularityScore: 94, imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80', description: 'Transcontinental city bridging Europe & Asia with Hagia Sophia, Grand Bazaar, and Bosphorus sunset cruises.' },

    { name: 'New York City', country: 'United States', region: 'North America', costIndex: 5, popularityScore: 98, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', description: 'The ultimate global city for Broadway theater, Times Square neon, Central Park, and iconic skyline views.' },
    { name: 'Los Angeles', country: 'United States', region: 'North America', costIndex: 4, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80', description: 'Entertainment capital of Hollywood studios, Griffith Observatory, Santa Monica Pier, and Pacific Coast beaches.' },
    { name: 'Banff', country: 'Canada', region: 'North America', costIndex: 4, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80', description: 'Canadian Rockies mountain paradise featuring turquoise glacial lakes, alpine hiking, and wildlife watching.' },

    { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', costIndex: 2, popularityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80', description: 'Marvelous coastal metropolis famed for Christ the Redeemer, Sugarloaf Mountain, and Copacabana beach.' },
    { name: 'Cusco', country: 'Peru', region: 'South America', costIndex: 2, popularityScore: 93, imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80', description: 'Ancient capital of the Inca Empire and Gateway to the mystical mountain sanctuary of Machu Picchu.' },

    { name: 'Cairo', country: 'Egypt', region: 'Africa', costIndex: 2, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1572252821128-44477d612e43?auto=format&fit=crop&w=1200&q=80', description: 'Ancient wonderland home to the Great Pyramids of Giza, Sphinx, Egyptian Museum, and Nile felucca cruises.' },
    { name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 2, popularityScore: 91, imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80', description: 'Dramatic coastal city crowned by Table Mountain, penguin beaches, and scenic coastal drives.' },

    { name: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', costIndex: 4, popularityScore: 96, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', description: 'Futuristic desert oasis known for Burj Khalifa tower, luxury shopping, and red dune desert safaris.' },

    { name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 4, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80', description: 'Harbourfront paradise famous for Sydney Opera House, Harbour Bridge climb, and Bondi coastal walks.' },
    { name: 'Auckland', country: 'New Zealand', region: 'Oceania', costIndex: 4, popularityScore: 88, imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80', description: 'City of Sails gateway to volcanic islands, Maori culture, and Hobbiton movie set landscapes.' },
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
    // Tokyo
    { cityName: 'Tokyo', name: 'Shibuya Crossing & Harajuku Food Tour', category: 'Food & Drink', cost: 65, durationMinutes: 180, description: 'Taste savory street eats, fluffy pancakes, and explore Shibuya neon lights.', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Tokyo', name: 'TeamLab Planets Immersive Digital Art', category: 'Culture', cost: 38, durationMinutes: 120, description: 'Walk through water and become one with mesmerizing digital flower gardens.', imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Tokyo', name: 'Senso-ji Temple & Asakusa Rickshaw Ride', category: 'Sightseeing', cost: 45, durationMinutes: 90, description: 'Explore Tokyo’s oldest Buddhist temple followed by a traditional rickshaw ride.', imageUrl: 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=800&q=80' },

    // Kyoto
    { cityName: 'Kyoto', name: 'Fushimi Inari Torii Gate Early Hike', category: 'Nature', cost: 0, durationMinutes: 150, description: 'Ascend Mount Inari through thousands of vermilion shrine gates.', imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kyoto', name: 'Arashiyama Bamboo Grove & Monkey Park', category: 'Adventure', cost: 20, durationMinutes: 180, description: 'Stroll beneath towering green bamboo stalks and visit wild macaques.', imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80' },

    // Bangkok
    { cityName: 'Bangkok', name: 'Grand Palace & Emerald Buddha Guided Tour', category: 'Culture', cost: 30, durationMinutes: 150, description: 'Marvel at golden stupas and the revered Emerald Buddha inside the royal complex.', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Bangkok', name: 'Damnoen Saduak Floating Market Boat Tour', category: 'Food & Drink', cost: 40, durationMinutes: 240, description: 'Ride wooden longtail boats while buying fresh mango sticky rice from canal vendors.', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80' },

    // Singapore
    { cityName: 'Singapore', name: 'Gardens by the Bay & Supertree Observatory', category: 'Sightseeing', cost: 32, durationMinutes: 150, description: 'Explore the Flower Dome, Cloud Forest waterfall, and futuristic Supertrees.', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Singapore', name: 'Chinatown & Lau Pa Sat Hawker Feast', category: 'Food & Drink', cost: 25, durationMinutes: 120, description: 'Savor Michelin-lauded Hainanese chicken rice, satay skewers, and laksa.', imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80' },

    // Bali
    { cityName: 'Bali', name: 'Mount Batur Sunrise Volcano Trek', category: 'Adventure', cost: 50, durationMinutes: 360, description: 'Hike to the volcanic summit for breakfast cooked by natural mountain steam.', imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Bali', name: 'Tegallalang Rice Terraces & Jungle Swing', category: 'Nature', cost: 25, durationMinutes: 120, description: 'Soar high above emerald rice terraces on iconic swings with valley views.', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },

    // Jaipur
    { cityName: 'Jaipur', name: 'Amber Fort & Elephant Palace Tour', category: 'Sightseeing', cost: 20, durationMinutes: 180, description: 'Explore opulent mirror halls and pink sandstone ramparts of Amber Fort.', imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80' },

    // Paris
    { cityName: 'Paris', name: 'Louvre Museum Skip-the-Line Guided Tour', category: 'Culture', cost: 55, durationMinutes: 150, description: 'Priority tour seeing Mona Lisa, Winged Victory, and royal crown jewels.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Paris', name: 'Eiffel Tower & Sunset Seine River Cruise', category: 'Sightseeing', cost: 75, durationMinutes: 120, description: 'Glittering evening views of Paris landmarks while sipping French champagne.', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },

    // Rome
    { cityName: 'Rome', name: 'Colosseum Underground & Gladiators Arena', category: 'Sightseeing', cost: 80, durationMinutes: 180, description: 'Access subterranean staging tunnels and walk directly onto the arena floor.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Rome', name: 'Vatican Museums & Sistine Chapel Tour', category: 'Culture', cost: 70, durationMinutes: 180, description: 'Marvel at Michelangelo’s ceiling frescoes and St. Peter’s Basilica.', imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80' },

    // London
    { cityName: 'London', name: 'Tower of London & Crown Jewels Tour', category: 'Sightseeing', cost: 45, durationMinutes: 150, description: 'See the glittering Crown Jewels and hear history from Yeoman Warders.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'London', name: 'West End Theatre Show & Historic Pub Crawl', category: 'Nightlife', cost: 85, durationMinutes: 240, description: 'Watch top musicals in Covent Garden followed by historic pub tastings.', imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80' },

    // Barcelona
    { cityName: 'Barcelona', name: 'Sagrada Familia Priority Entry Tour', category: 'Culture', cost: 40, durationMinutes: 120, description: 'Marvel at Gaudí’s stained-glass forest columns inside his masterpiece.', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80' },

    // Venice
    { cityName: 'Venice', name: 'Grand Canal Gondola Serenade', category: 'Sightseeing', cost: 90, durationMinutes: 60, description: 'Glide along historic canals past Renaissance palaces on a private gondola.', imageUrl: 'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?auto=format&fit=crop&w=800&q=80' },

    // Amsterdam
    { cityName: 'Amsterdam', name: 'Open-Boat Canal Cruise with Cheese & Wine', category: 'Sightseeing', cost: 35, durationMinutes: 90, description: 'Navigate historic UNESCO canal belt bridges with Dutch gouda tasting.', imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80' },

    // Prague
    { cityName: 'Prague', name: 'Charles Bridge & Prague Castle Sunrise Walk', category: 'Sightseeing', cost: 0, durationMinutes: 120, description: 'Cross iconic statues on Charles Bridge before entering Prague Castle grounds.', imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80' },

    // Reykjavik
    { cityName: 'Reykjavik', name: 'Blue Lagoon Geothermal Spa Pass', category: 'Culture', cost: 90, durationMinutes: 240, description: 'Soak in mineral-rich milky blue waters in black volcanic lava fields.', imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80' },

    // Istanbul
    { cityName: 'Istanbul', name: 'Hagia Sophia & Blue Mosque Guided Tour', category: 'Culture', cost: 35, durationMinutes: 150, description: 'Discover Byzantine mosaics, Ottoman domes, and Islamic calligraphy.', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80' },

    // New York City
    { cityName: 'New York City', name: 'Statue of Liberty & Ellis Island Ferry', category: 'Sightseeing', cost: 30, durationMinutes: 210, description: 'Climb Liberty island and explore American immigration history.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },

    // Los Angeles
    { cityName: 'Los Angeles', name: 'Hollywood Sign & Griffith Observatory Hike', category: 'Adventure', cost: 25, durationMinutes: 180, description: 'Hike through Hollywood Hills for sweeping LA views and telescope shows.', imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80' },

    // Banff
    { cityName: 'Banff', name: 'Lake Louise & Moraine Lake Glacial Canoe', category: 'Nature', cost: 95, durationMinutes: 180, description: 'Paddle red canoes across turquoise glacial waters beneath Rocky peaks.', imageUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80' },

    // Rio de Janeiro
    { cityName: 'Rio de Janeiro', name: 'Christ the Redeemer & Corcovado Train', category: 'Sightseeing', cost: 40, durationMinutes: 180, description: 'Ride cog train through Tijuca rainforest to the feet of Christ statue.', imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80' },

    // Cusco
    { cityName: 'Cusco', name: 'Machu Picchu Sanctuary Day Tour', category: 'Sightseeing', cost: 150, durationMinutes: 480, description: 'Experience the world wonder citadel nestled in high Andean clouds.', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80' },

    // Cairo
    { cityName: 'Cairo', name: 'Giza Pyramids & Sphinx Camel Safari', category: 'Sightseeing', cost: 50, durationMinutes: 240, description: 'Ride camels across desert dunes with views of Khufu’s Great Pyramid.', imageUrl: 'https://images.unsplash.com/photo-1572252821128-44477d612e43?auto=format&fit=crop&w=800&q=80' },

    // Cape Town
    { cityName: 'Cape Town', name: 'Table Mountain Cableway Summit Walk', category: 'Sightseeing', cost: 35, durationMinutes: 150, description: 'Rotate 360 degrees as you ascend to 1,086 meters above sea level.', imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80' },

    // Dubai
    { cityName: 'Dubai', name: 'Burj Khalifa Observation Deck & Fountain Show', category: 'Sightseeing', cost: 60, durationMinutes: 120, description: 'Stand on 124th floor skydeck followed by musical fountain light show.', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },

    // Sydney
    { cityName: 'Sydney', name: 'Sydney Opera House Guided Architectural Tour', category: 'Culture', cost: 35, durationMinutes: 90, description: 'Explore behind the scenes of Bennelong Point’s iconic sails.', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },

    // Auckland
    { cityName: 'Auckland', name: 'Hobbiton Movie Set Day Tour', category: 'Culture', cost: 110, durationMinutes: 360, description: 'Step into Middle-earth visiting 44 hobbit holes and Green Dragon Inn.', imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80' },
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
      `INSERT INTO "SiteSetting" (id, key, value, "group", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [s.key, s.value, s.group]
    );
  }

  console.log('🎉 GlobeTrotter database successfully seeded with global cities & iconic activities via pg!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
