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
  console.log('🌱 Starting GlobeTrotter Hierarchical Worldwide Seeding (Country -> State -> City)...');

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

  // Master Cities Catalog with Country -> State -> City structure
  const citiesData = [
    // INDIA
    { country: 'India', state: 'Rajasthan', name: 'Jaipur', region: 'Asia', costIndex: 2, popularityScore: 92, lat: 26.9124, lng: 75.7873, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80', description: 'The Pink City of Rajasthan filled with royal hill fortresses, pink sandstone palaces, and vibrant bazaars.' },
    { country: 'India', state: 'Rajasthan', name: 'Udaipur', region: 'Asia', costIndex: 2, popularityScore: 90, lat: 24.5854, lng: 73.7125, imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=1200&q=80', description: 'The City of Lakes featuring marble water palaces, serene boat rides, and Aravalli mountain views.' },
    { country: 'India', state: 'Uttar Pradesh', name: 'Agra', region: 'Asia', costIndex: 2, popularityScore: 96, lat: 27.1767, lng: 78.0081, imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', description: 'Home to the world wonder Taj Mahal, Mughal emperor fortresses, and historic marble craftsmanship.' },
    { country: 'India', state: 'Uttar Pradesh', name: 'Varanasi', region: 'Asia', costIndex: 1, popularityScore: 89, lat: 25.3176, lng: 82.9739, imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80', description: 'Spiritual capital of India on the sacred Ganges River known for ancient evening Aarti rituals.' },
    { country: 'India', state: 'Maharashtra', name: 'Mumbai', region: 'Asia', costIndex: 3, popularityScore: 93, lat: 19.0760, lng: 72.8777, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80', description: 'Bustling coastal financial capital home to the Gateway of India, Marine Drive promenade, and Bollywood.' },
    { country: 'India', state: 'Delhi (NCT)', name: 'New Delhi', region: 'Asia', costIndex: 2, popularityScore: 91, lat: 28.6139, lng: 77.2090, imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80', description: 'Historic national capital with Mughal monuments, Red Fort, Qutub Minar, and spicy street food.' },
    { country: 'India', state: 'Goa', name: 'North Goa', region: 'Asia', costIndex: 2, popularityScore: 94, lat: 15.5187, lng: 73.7626, imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', description: 'Tropical coastal haven famous for golden sand beaches, Portuguese forts, and vibrant night markets.' },
    { country: 'India', state: 'Kerala', name: 'Alleppey', region: 'Asia', costIndex: 2, popularityScore: 88, lat: 9.4981, lng: 76.3388, imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', description: 'Venice of the East renowned for tranquil backwater houseboat cruises and coconut palm canals.' },

    // UNITED STATES
    { country: 'United States', state: 'New York', name: 'New York City', region: 'North America', costIndex: 5, popularityScore: 98, lat: 40.7128, lng: -74.0060, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', description: 'The ultimate global city for Broadway theater, Times Square neon, Central Park, and iconic skyline views.' },
    { country: 'United States', state: 'California', name: 'Los Angeles', region: 'North America', costIndex: 4, popularityScore: 94, lat: 34.0522, lng: -118.2437, imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80', description: 'Entertainment capital of Hollywood studios, Griffith Observatory, Santa Monica Pier, and Pacific beaches.' },
    { country: 'United States', state: 'California', name: 'San Francisco', region: 'North America', costIndex: 5, popularityScore: 93, lat: 37.7749, lng: -122.4194, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80', description: 'Iconic city of the Golden Gate Bridge, historic cable cars, Alcatraz island, and Fisherman’s Wharf.' },
    { country: 'United States', state: 'Florida', name: 'Miami', region: 'North America', costIndex: 4, popularityScore: 91, lat: 25.7617, lng: -80.1918, imageUrl: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=1200&q=80', description: 'Sun-kissed coastal city with Art Deco architecture, South Beach nightlife, and Wynwood murals.' },
    { country: 'United States', state: 'Nevada', name: 'Las Vegas', region: 'North America', costIndex: 4, popularityScore: 95, lat: 36.1699, lng: -115.1398, imageUrl: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1200&q=80', description: 'Resort city famed for vibrant casinos, world-class entertainment shows, and Bellagio fountains.' },
    { country: 'United States', state: 'Hawaii', name: 'Honolulu', region: 'North America', costIndex: 4, popularityScore: 92, lat: 21.3069, lng: -157.8583, imageUrl: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1200&q=80', description: 'Pacific island paradise with Waikiki beach, Diamond Head crater, and traditional Luau celebrations.' },

    // JAPAN
    { country: 'Japan', state: 'Tokyo Metropolis', name: 'Tokyo', region: 'Asia', costIndex: 4, popularityScore: 99, lat: 35.6762, lng: 139.6503, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', description: 'Neon skyscrapers, robot cafes, Senso-ji temple, Shibuya crossing, and world-class sushi.' },
    { country: 'Japan', state: 'Kyoto Prefecture', name: 'Kyoto', region: 'Asia', costIndex: 3, popularityScore: 96, lat: 35.0116, lng: 135.7681, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', description: 'Thousands of classical Buddhist temples, vermilion Fushimi Inari Torii gates, and Gion tea houses.' },
    { country: 'Japan', state: 'Osaka Prefecture', name: 'Osaka', region: 'Asia', costIndex: 3, popularityScore: 94, lat: 34.6937, lng: 135.5023, imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200&q=80', description: 'Japan’s food capital famed for Dotonbori neon canal, takoyaki street food, and Osaka Castle.' },

    // FRANCE
    { country: 'France', state: 'Île-de-France', name: 'Paris', region: 'Europe', costIndex: 4, popularityScore: 99, lat: 48.8566, lng: 2.3522, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', description: 'The City of Light offers Louvre art treasures, Eiffel Tower, and romantic cruises along the Seine.' },
    { country: 'France', state: "Provence-Alpes-Côte d'Azur", name: 'Nice', region: 'Europe', costIndex: 4, popularityScore: 91, lat: 43.7102, lng: 7.2620, imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', description: 'French Riviera coastal resort with pebble beaches, Promenade des Anglais, and Mediterranean sunshine.' },

    // ITALY
    { country: 'Italy', state: 'Lazio', name: 'Rome', region: 'Europe', costIndex: 3, popularityScore: 97, lat: 41.9028, lng: 12.4964, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', description: 'Ancient gladiator arenas, Vatican museums, Trevi Fountain, and authentic pasta trattorias.' },
    { country: 'Italy', state: 'Veneto', name: 'Venice', region: 'Europe', costIndex: 4, popularityScore: 95, lat: 45.4408, lng: 12.3155, imageUrl: 'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?auto=format&fit=crop&w=1200&q=80', description: 'Floating city of romantic canals, gothic palaces, gondola serenades, and Murano glassblowing.' },
    { country: 'Italy', state: 'Tuscany', name: 'Florence', region: 'Europe', costIndex: 3, popularityScore: 94, lat: 43.7696, lng: 11.2558, imageUrl: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80', description: 'Renaissance art birthplace featuring Michelangelo’s David, Duomo cathedral, and Tuscan wine.' },

    // UNITED KINGDOM
    { country: 'United Kingdom', state: 'Greater London', name: 'London', region: 'Europe', costIndex: 4, popularityScore: 98, lat: 51.5074, lng: -0.1278, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80', description: 'Royal metropolis home to Big Ben, Tower of London, West End theatre, and classic pubs.' },
    { country: 'United Kingdom', state: 'Scotland', name: 'Edinburgh', region: 'Europe', costIndex: 3, popularityScore: 92, lat: 55.9533, lng: -3.1883, imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', description: 'Historic Scottish capital with dramatic hilltop castle, Royal Mile cobblestones, and scotch whisky tours.' },

    // SPAIN
    { country: 'Spain', state: 'Catalonia', name: 'Barcelona', region: 'Europe', costIndex: 3, popularityScore: 96, lat: 41.3851, lng: 2.1734, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80', description: 'Gaudí’s Sagrada Familia, Park Güell, Mediterranean beaches, and vibrant tapas culture.' },
    { country: 'Spain', state: 'Madrid Community', name: 'Madrid', region: 'Europe', costIndex: 3, popularityScore: 93, lat: 40.4168, lng: -3.7038, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80', description: 'Spanish capital with Royal Palace, Prado Museum masterpieces, and lively Plaza Mayor plazas.' },

    // THAILAND
    { country: 'Thailand', state: 'Bangkok Metropolis', name: 'Bangkok', region: 'Asia', costIndex: 2, popularityScore: 94, lat: 13.7563, lng: 100.5018, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80', description: 'Ornate golden shrines, floating river markets, and Michelin-rated street food.' },
    { country: 'Thailand', state: 'Phuket Province', name: 'Phuket', region: 'Asia', costIndex: 2, popularityScore: 93, lat: 7.8804, lng: 98.3923, imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80', description: 'Andaman Sea island resort with limestone karsts, Phi Phi speedboats, and beach clubs.' },

    // UNITED ARAB EMIRATES
    { country: 'United Arab Emirates', state: 'Dubai Emirate', name: 'Dubai', region: 'Middle East', costIndex: 4, popularityScore: 97, lat: 25.2048, lng: 55.2708, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', description: 'Burj Khalifa skydeck, luxury shopping malls, and red dune desert safaris with camel rides.' },

    // AUSTRALIA
    { country: 'Australia', state: 'New South Wales', name: 'Sydney', region: 'Oceania', costIndex: 4, popularityScore: 96, lat: -33.8688, lng: 151.2093, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80', description: 'Sydney Opera House sails, Harbour Bridge climb, and Bondi to Coogee coastal walks.' },
    { country: 'Australia', state: 'Victoria', name: 'Melbourne', region: 'Oceania', costIndex: 4, popularityScore: 92, lat: -37.8136, lng: 144.9631, imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=1200&q=80', description: 'Cultural capital of laneway coffee culture, street art, and Great Ocean Road excursions.' },

    // CANADA
    { country: 'Canada', state: 'Alberta', name: 'Banff', region: 'North America', costIndex: 4, popularityScore: 93, lat: 51.1784, lng: -115.5708, imageUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80', description: 'Canadian Rockies mountain paradise featuring turquoise Lake Louise and alpine glaciers.' },

    // EGYPT
    { country: 'Egypt', state: 'Cairo Governorate', name: 'Cairo', region: 'Africa', costIndex: 2, popularityScore: 93, lat: 30.0444, lng: 31.2357, imageUrl: 'https://images.unsplash.com/photo-1572252821128-44477d612e43?auto=format&fit=crop&w=1200&q=80', description: 'Ancient Great Pyramids of Giza, Sphinx, Egyptian Museum, and Nile felucca cruises.' },

    // SOUTH AFRICA
    { country: 'South Africa', state: 'Western Cape', name: 'Cape Town', region: 'Africa', costIndex: 2, popularityScore: 92, lat: -33.9249, lng: 18.4241, imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80', description: 'Table Mountain cableway, Boulders Beach penguin colonies, and scenic coastal drives.' },

    // BRAZIL
    { country: 'Brazil', state: 'Rio de Janeiro State', name: 'Rio de Janeiro', region: 'South America', costIndex: 2, popularityScore: 91, lat: -22.9068, lng: -43.1729, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80', description: 'Christ the Redeemer statue, Corcovado train, Sugarloaf cable car, and Copacabana beach.' },
  ];

  const createdCities = {};
  for (const c of citiesData) {
    const res = await query(
      `INSERT INTO "City" (id, name, state, country, region, "costIndex", "popularityScore", lat, lng, "imageUrl", description, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [c.name, c.state, c.country, c.region, c.costIndex, c.popularityScore, c.lat, c.lng, c.imageUrl, c.description]
    );
    createdCities[c.name] = res.rows[0];
  }
  console.log(`✅ Created ${Object.keys(createdCities).length} worldwide cities across Countries & States.`);

  const activitiesData = [
    // Jaipur & Agra & Mumbai
    { cityName: 'Jaipur', name: 'Amber Fort & Elephant Palace Tour', category: 'Sightseeing', cost: 20, durationMinutes: 180, description: 'Explore mirror halls and pink sandstone ramparts.', imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Udaipur', name: 'Lake Pichola Sunset Boat Cruise', category: 'Sightseeing', cost: 25, durationMinutes: 120, description: 'Glide past Jag Mandir and Lake Palace at sunset.', imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Agra', name: 'Taj Mahal Sunrise Guided Tour', category: 'Sightseeing', cost: 35, durationMinutes: 180, description: 'Witness sunrise over the white marble mausoleum.', imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Mumbai', name: 'Gateway of India & Elephanta Caves Speedboat', category: 'Culture', cost: 30, durationMinutes: 240, description: 'Boat trip across Mumbai harbour to ancient rock-cut cave temples.', imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },

    // Tokyo & Kyoto
    { cityName: 'Tokyo', name: 'Shibuya Crossing & Harajuku Food Tour', category: 'Food & Drink', cost: 65, durationMinutes: 180, description: 'Taste street eats and explore Shibuya neon lights.', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kyoto', name: 'Fushimi Inari Torii Gate Early Hike', category: 'Nature', cost: 0, durationMinutes: 150, description: 'Ascend Mount Inari through thousands of vermilion gates.', imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80' },

    // Paris & Rome & London & Barcelona
    { cityName: 'Paris', name: 'Louvre Museum Skip-the-Line Guided Tour', category: 'Culture', cost: 55, durationMinutes: 150, description: 'Priority tour seeing Mona Lisa and Venus de Milo.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Rome', name: 'Colosseum Underground & Gladiators Arena', category: 'Sightseeing', cost: 80, durationMinutes: 180, description: 'Access subterranean staging tunnels and walk arena floor.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'London', name: 'Tower of London & Crown Jewels Tour', category: 'Sightseeing', cost: 45, durationMinutes: 150, description: 'See the glittering Crown Jewels with Yeoman Warders.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Barcelona', name: 'Sagrada Familia Priority Entry Tour', category: 'Culture', cost: 40, durationMinutes: 120, description: 'Marvel at Gaudí’s stained-glass forest columns.', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80' },

    // NYC & LA & Cairo & Dubai & Sydney
    { cityName: 'New York City', name: 'Statue of Liberty & Ellis Island Ferry', category: 'Sightseeing', cost: 30, durationMinutes: 210, description: 'Climb Liberty island and explore American history.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Los Angeles', name: 'Hollywood Sign & Griffith Observatory Hike', category: 'Adventure', cost: 25, durationMinutes: 180, description: 'Hike through Hollywood Hills for sweeping views.', imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Cairo', name: 'Giza Pyramids & Sphinx Camel Safari', category: 'Sightseeing', cost: 50, durationMinutes: 240, description: 'Ride camels across desert dunes with views of Great Pyramid.', imageUrl: 'https://images.unsplash.com/photo-1572252821128-44477d612e43?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Dubai', name: 'Burj Khalifa Observation Deck & Fountain Show', category: 'Sightseeing', cost: 60, durationMinutes: 120, description: 'Stand on 124th floor skydeck followed by fountain show.', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Sydney', name: 'Sydney Opera House Guided Architectural Tour', category: 'Culture', cost: 35, durationMinutes: 90, description: 'Explore behind the scenes of Bennelong Point sails.', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
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

  if (createdActivities[4]) {
    await query(
      `INSERT INTO "StopActivity" (id, "stopId", "activityId", "scheduledDate", "scheduledTime", notes, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [stop1.id, createdActivities[4].id, '2026-09-11', '10:00 AM', 'Meet guide at Hachiko statue.']
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

  console.log('🎉 GlobeTrotter database successfully seeded with hierarchical Country -> State -> City worldwide data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
