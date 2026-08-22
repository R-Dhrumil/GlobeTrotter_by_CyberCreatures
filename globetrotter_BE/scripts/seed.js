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
    { country: 'India', state: 'Rajasthan', name: 'Jaipur', region: 'Asia', costIndex: 2, popularityScore: 95, lat: 26.9124, lng: 75.7873, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80', description: 'The Pink City of Rajasthan filled with royal hill fortresses, pink sandstone palaces, and vibrant bazaars.' },
    { country: 'India', state: 'Rajasthan', name: 'Udaipur', region: 'Asia', costIndex: 2, popularityScore: 93, lat: 24.5854, lng: 73.7125, imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=1200&q=80', description: 'The City of Lakes featuring marble water palaces, serene boat rides, and Aravalli mountain views.' },
    { country: 'India', state: 'Rajasthan', name: 'Jodhpur', region: 'Asia', costIndex: 2, popularityScore: 91, lat: 26.2389, lng: 73.0243, imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80', description: 'The Sun City & Blue City crowned by colossal Mehrangarh Fort towering above blue indigo houses.' },
    { country: 'India', state: 'Uttar Pradesh', name: 'Agra', region: 'Asia', costIndex: 2, popularityScore: 97, lat: 27.1767, lng: 78.0081, imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', description: 'Home to the world wonder Taj Mahal, Mughal emperor fortresses, and historic marble craftsmanship.' },
    { country: 'India', state: 'Uttar Pradesh', name: 'Varanasi', region: 'Asia', costIndex: 1, popularityScore: 92, lat: 25.3176, lng: 82.9739, imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80', description: 'Spiritual capital of India on the sacred Ganges River known for ancient evening Aarti rituals.' },
    { country: 'India', state: 'Maharashtra', name: 'Mumbai', region: 'Asia', costIndex: 3, popularityScore: 95, lat: 19.0760, lng: 72.8777, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80', description: 'Bustling coastal financial capital home to the Gateway of India, Marine Drive promenade, and Bollywood.' },
    { country: 'India', state: 'Delhi (NCT)', name: 'New Delhi', region: 'Asia', costIndex: 2, popularityScore: 94, lat: 28.6139, lng: 77.2090, imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80', description: 'Historic national capital with Mughal monuments, Red Fort, Qutub Minar, and spicy street food.' },
    { country: 'India', state: 'Goa', name: 'North Goa', region: 'Asia', costIndex: 2, popularityScore: 96, lat: 15.5187, lng: 73.7626, imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', description: 'Tropical coastal haven famous for golden sand beaches, Portuguese forts, and vibrant night markets.' },
    { country: 'India', state: 'Kerala', name: 'Alleppey', region: 'Asia', costIndex: 2, popularityScore: 90, lat: 9.4981, lng: 76.3388, imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', description: 'Venice of the East renowned for tranquil backwater houseboat cruises and coconut palm canals.' },
    { country: 'India', state: 'Kerala', name: 'Kochi', region: 'Asia', costIndex: 2, popularityScore: 89, lat: 9.9312, lng: 76.2673, imageUrl: 'https://images.unsplash.com/photo-1609828913639-6f634bfe0d47?auto=format&fit=crop&w=1200&q=80', description: 'Queen of the Arabian Sea featuring Chinese fishing nets, Dutch colonial palaces, and spice markets.' },
    { country: 'India', state: 'Karnataka', name: 'Bengaluru', region: 'Asia', costIndex: 3, popularityScore: 91, lat: 12.9716, lng: 77.5946, imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80', description: 'India’s Silicon Valley & Garden City famous for Lalbagh, Tudor-style Bangalore Palace, and craft breweries.' },
    { country: 'India', state: 'West Bengal', name: 'Kolkata', region: 'Asia', costIndex: 2, popularityScore: 90, lat: 22.5726, lng: 88.3639, imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80', description: 'Cultural capital of India featuring Victoria Memorial, Howrah Bridge, vintage tram rides, and street cuisine.' },
    { country: 'India', state: 'Telangana', name: 'Hyderabad', region: 'Asia', costIndex: 2, popularityScore: 92, lat: 17.3850, lng: 78.4867, imageUrl: 'https://images.unsplash.com/photo-1626014903708-691955774b14?auto=format&fit=crop&w=1200&q=80', description: 'City of Pearls & Nizam royalty renowned for Charminar, Golconda Fort, and world-famous Hyderabadi Biryani.' },
    { country: 'India', state: 'Punjab', name: 'Amritsar', region: 'Asia', costIndex: 1, popularityScore: 94, lat: 31.6340, lng: 74.8723, imageUrl: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=1200&q=80', description: 'Spiritual heart of Sikhism home to the gleaming Golden Temple, Wagah Border parade, and Amritsari Kulcha.' },
    { country: 'India', state: 'Uttarakhand', name: 'Rishikesh', region: 'Asia', costIndex: 1, popularityScore: 93, lat: 30.0869, lng: 78.2676, imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80', description: 'Yoga Capital of the World along the turquoise Ganges, offering white-water rafting, ashrams, and Ganga Aarti.' },
    { country: 'India', state: 'Himachal Pradesh', name: 'Shimla', region: 'Asia', costIndex: 2, popularityScore: 89, lat: 31.1048, lng: 77.1734, imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80', description: 'Queen of Hill Stations set against Himalayan peaks, featuring UNESCO toy train, Ridge & Mall Road walk.' },
    { country: 'India', state: 'Himachal Pradesh', name: 'Manali', region: 'Asia', costIndex: 2, popularityScore: 92, lat: 32.2432, lng: 77.1892, imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80', description: 'High-altitude Himalayan valley adventure hub famous for Solang paragliding, Rohtang Pass, and pine forests.' },
    { country: 'India', state: 'West Bengal', name: 'Darjeeling', region: 'Asia', costIndex: 2, popularityScore: 88, lat: 27.0410, lng: 88.2663, imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', description: 'Queen of the Hills renowned for Tiger Hill sunrise over Mount Kanchenjunga, tea gardens, and Toy Train.' },
    { country: 'India', state: 'Jammu and Kashmir', name: 'Srinagar', region: 'Asia', costIndex: 2, popularityScore: 93, lat: 34.0837, lng: 74.7973, imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80', description: 'Paradise on Earth famed for Dal Lake Shikara rides, carved houseboats, and Mughal terraced gardens.' },
    { country: 'India', state: 'Gujarat', name: 'Ahmedabad', region: 'Asia', costIndex: 2, popularityScore: 87, lat: 23.0225, lng: 72.5714, imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80', description: 'India’s first UNESCO World Heritage City, home to Sabarmati Ashram, intricate stepwells, and night food markets.' },
    { country: 'India', state: 'Puducherry (UT)', name: 'Pondicherry', region: 'Asia', costIndex: 2, popularityScore: 89, lat: 11.9416, lng: 79.8083, imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', description: 'French Riviera of the East with mustard-yellow colonial villas, Auroville township, and seaside promenades.' },
    { country: 'India', state: 'Tamil Nadu', name: 'Chennai', region: 'Asia', costIndex: 2, popularityScore: 88, lat: 13.0827, lng: 80.2707, imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', description: 'Cultural capital of South India home to Marina Beach, ancient Dravidian temples, and filter coffee culture.' },

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
    // --- INDIA ACTIVITIES ---
    // JAIPUR
    { cityName: 'Jaipur', name: 'Amber Fort & Sheesh Mahal Royal Palace Tour', category: 'Sightseeing', cost: 20, durationMinutes: 180, description: 'Explore mirror halls and pink sandstone ramparts atop Cheel ka Teela hill.', imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Jaipur', name: 'Hawa Mahal & City Palace Heritage Walk', category: 'Culture', cost: 15, durationMinutes: 120, description: 'Photograph the Palace of Winds, Jantar Mantar observatory, and royal courtyards.', imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Jaipur', name: 'Johari Bazaar Pink City Food & Gem Market Crawl', category: 'Food & Drink', cost: 12, durationMinutes: 150, description: 'Sample Pyaz Kachori, Ghewar sweets, and shop traditional Kundan jewellery.', imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Jaipur', name: 'Nahargarh Fort Sunset Panorama & Jal Mahal View', category: 'Sightseeing', cost: 10, durationMinutes: 120, description: 'Watch the sun set over the entire Pink City skyline from Aravalli ridge cliffs.', imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80' },

    // UDAIPUR
    { cityName: 'Udaipur', name: 'Lake Pichola Sunset Boat Cruise past Jag Mandir', category: 'Sightseeing', cost: 25, durationMinutes: 120, description: 'Glide past marble water palaces and Aravalli hills in the Golden hour glow.', imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Udaipur', name: 'Udaipur City Palace Museum & Peacock Courtyard', category: 'Culture', cost: 18, durationMinutes: 180, description: 'Tour Rajasthan’s largest royal palace complex with intricate mirror mosaics.', imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Udaipur', name: 'Bagore Ki Haveli Folk Dance & Puppet Performance', category: 'Culture', cost: 8, durationMinutes: 90, description: 'Witness traditional Rajasthani Dharohar folk dances on Gangaur Ghat.', imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=800&q=80' },

    // JODHPUR
    { cityName: 'Jodhpur', name: 'Mehrangarh Fort & Flying Fox Zipline Adventure', category: 'Adventure', cost: 35, durationMinutes: 180, description: 'Fly across fort ramparts and battlements with aerial views of the Blue City.', imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Jodhpur', name: 'Toorji Ka Jhalra Stepwell & Blue City Walk', category: 'Culture', cost: 12, durationMinutes: 120, description: 'Navigate indigo-painted alleyways and historic 1740s carved stepwell reservoir.', imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Jodhpur', name: 'Jaswant Thada & Thar Desert Camel Safari', category: 'Nature', cost: 30, durationMinutes: 240, description: 'Visit royal marble cenotaphs followed by sunset camel rides over desert sand dunes.', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },

    // AGRA
    { cityName: 'Agra', name: 'Taj Mahal Sunrise Guided Tour & Marble Inlay', category: 'Sightseeing', cost: 35, durationMinutes: 180, description: 'Witness morning sunlight reflect on pure white marble followed by inlay craft workshop.', imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Agra', name: 'Agra Fort Mughal Palaces & Yamuna Viewpoints', category: 'Culture', cost: 20, durationMinutes: 150, description: 'Explore Shah Jahan’s red sandstone fortress and prisoner tower facing the Taj Mahal.', imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Agra', name: 'Mehtab Bagh Sunset Taj Reflection Walk', category: 'Nature', cost: 10, durationMinutes: 90, description: 'Photograph peaceful riverbed views of the Taj Mahal across the Yamuna River.', imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },

    // VARANASI
    { cityName: 'Varanasi', name: 'Dashashwamedh Ghat Evening Ganga Aarti Ceremony', category: 'Culture', cost: 25, durationMinutes: 150, description: 'Experience brass lamp fire rituals, chanting, and floating flower lamps from a riverboat.', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Varanasi', name: 'Sunrise Ganges Boat Ride & Manikarnika Ghat Walk', category: 'Sightseeing', cost: 18, durationMinutes: 120, description: 'Glide past bathing ghats as pilgrims greet the rising sun along the sacred river.', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Varanasi', name: 'Sarnath Stupa & Banarasi Silk Weaving Village', category: 'Culture', cost: 20, durationMinutes: 180, description: 'Visit Lord Buddha’s first sermon site and watch master artisans weave silk saris.', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80' },

    // MUMBAI
    { cityName: 'Mumbai', name: 'Gateway of India & Elephanta Caves Speedboat', category: 'Culture', cost: 30, durationMinutes: 240, description: 'Cruise Mumbai harbor to 5th-century rock-cut Shiva cave temples on Elephanta Island.', imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Mumbai', name: 'Marine Drive & Chowpatty Street Food Crawl', category: 'Food & Drink', cost: 15, durationMinutes: 120, description: 'Walk the Queen’s Necklace promenade and feast on Vada Pav, Pav Bhaji, and Bhel Puri.', imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Mumbai', name: 'Dharavi Local Industry & Crafts Heritage Walk', category: 'Culture', cost: 20, durationMinutes: 180, description: 'Discover recycling hubs, leather workshops, and pottery quarters with a local guide.', imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },

    // NEW DELHI
    { cityName: 'New Delhi', name: 'Red Fort & Chandni Chowk Rickshaw Food Crawl', category: 'Food & Drink', cost: 25, durationMinutes: 180, description: 'Cycle through narrow spice alleys tasting Paranthas, Jalebis, and Chole Bhature.', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'New Delhi', name: 'Qutub Minar & Humayun’s Tomb Mughal Heritage', category: 'Culture', cost: 20, durationMinutes: 180, description: 'Explore UNESCO World Heritage red sandstone minarets and Persian-style garden tombs.', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'New Delhi', name: 'Lotus Temple & Swaminarayan Akshardham Show', category: 'Sightseeing', cost: 15, durationMinutes: 150, description: 'Visit Baháʼí Lotus Temple followed by Akshardham’s musical fountain and light show.', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80' },

    // NORTH GOA
    { cityName: 'North Goa', name: 'Aguada Fort & Baga Beach Watersports', category: 'Adventure', cost: 40, durationMinutes: 240, description: 'Explore 17th-century Portuguese lighthouse fort followed by parasailing and jet-skiing.', imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'North Goa', name: 'Dudhsagar Waterfalls Jeep Safari & Spice Farm', category: 'Nature', cost: 45, durationMinutes: 360, description: 'Ride 4x4 jeeps through Bhagwan Mahavir sanctuary to four-tiered cascading falls.', imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'North Goa', name: 'Fontainhas Latin Quarter Heritage Walk', category: 'Culture', cost: 20, durationMinutes: 150, description: 'Stroll colorful Portuguese villas, art galleries, and traditional bakeries in Panjim.', imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },

    // ALLEPPEY
    { cityName: 'Alleppey', name: 'Overnight Traditional Houseboat Backwater Cruise', category: 'Nature', cost: 120, durationMinutes: 720, description: 'Sail private Kettuvallam houseboats through Vembanad Lake, paddy fields, and palm canals.', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Alleppey', name: 'Shikara Boat & Village Canal Kayaking Tour', category: 'Adventure', cost: 30, durationMinutes: 180, description: 'Paddle narrow lotus creeks and explore tranquil coir-making fishing villages.', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' },

    // KOCHI
    { cityName: 'Kochi', name: 'Fort Kochi Heritage Walk & Chinese Fishing Nets', category: 'Culture', cost: 10, durationMinutes: 120, description: 'Photograph giant cantilevered fishing nets and St. Francis Church.', imageUrl: 'https://images.unsplash.com/photo-1609828913639-6f634bfe0d47?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kochi', name: 'Mattancherry Palace & Jew Town Antique Spice Crawl', category: 'Sightseeing', cost: 15, durationMinutes: 150, description: 'Tour Dutch Palace Ramayana murals and smell cardamom & ginger in spice warehouses.', imageUrl: 'https://images.unsplash.com/photo-1609828913639-6f634bfe0d47?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kochi', name: 'Kathakali Classical Dance & Makeup Demonstration', category: 'Culture', cost: 18, durationMinutes: 120, description: 'Watch elaborate face painting live before an expressive temple drama performance.', imageUrl: 'https://images.unsplash.com/photo-1609828913639-6f634bfe0d47?auto=format&fit=crop&w=800&q=80' },

    // BENGALURU
    { cityName: 'Bengaluru', name: 'Lalbagh Botanical Garden & Glass House Walk', category: 'Nature', cost: 8, durationMinutes: 120, description: 'Stroll 240 acres of rare tropical flora, century-old trees, and lotus ponds.', imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Bengaluru', name: 'Bangalore Palace & Tipu Sultan’s Summer Palace', category: 'Culture', cost: 18, durationMinutes: 150, description: 'Explore Tudor-style turrets, royal oil paintings, and teakwood pillars.', imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Bengaluru', name: 'Indiranagar Craft Brewery & Pub Crawl', category: 'Food & Drink', cost: 25, durationMinutes: 180, description: 'Sample craft IPAs, stouts, and South Indian fusion small plates in Pub Capital of India.', imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80' },

    // KOLKATA
    { cityName: 'Kolkata', name: 'Victoria Memorial & St. Paul’s Cathedral Walk', category: 'Sightseeing', cost: 12, durationMinutes: 150, description: 'Admire white marble British Raj monuments and Maidan green gardens.', imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kolkata', name: 'Howrah Bridge & Mallick Ghat Flower Market Crawl', category: 'Culture', cost: 10, durationMinutes: 120, description: 'Cross iconic cantilever bridge and explore Asia’s largest wholesale flower market.', imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kolkata', name: 'Park Street Kathi Roll & Rosogolla Food Crawl', category: 'Food & Drink', cost: 15, durationMinutes: 150, description: 'Feast on legendary Nizam Kathi rolls, Mishti Doi, and authentic Bengali sweets.', imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80' },

    // HYDERABAD
    { cityName: 'Hyderabad', name: 'Charminar & Laad Bazaar Biryani Culinary Tour', category: 'Food & Drink', cost: 20, durationMinutes: 180, description: 'Climb 16th-century four-minaret monument, shop lac bangles, and savor authentic Hyderabadi Dum Biryani.', imageUrl: 'https://images.unsplash.com/photo-1626014903708-691955774b14?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Hyderabad', name: 'Golconda Fort Light & Sound Show', category: 'Sightseeing', cost: 15, durationMinutes: 210, description: 'Explore acoustic citadel halls, diamond vaults, and evening history narrative.', imageUrl: 'https://images.unsplash.com/photo-1626014903708-691955774b14?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Hyderabad', name: 'Chowmahalla Palace & Salar Jung Museum Tour', category: 'Culture', cost: 18, durationMinutes: 180, description: 'View Nizam vintage cars, clock tower collections, and royal throne chandeliers.', imageUrl: 'https://images.unsplash.com/photo-1626014903708-691955774b14?auto=format&fit=crop&w=800&q=80' },

    // AMRITSAR
    { cityName: 'Amritsar', name: 'Golden Temple (Harmandir Sahib) & Langar Kitchen', category: 'Culture', cost: 0, durationMinutes: 180, description: 'Visit holy golden sanctum and volunteer at world’s largest free community kitchen serving 100k daily.', imageUrl: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Amritsar', name: 'Wagah Border Flag-Lowering Ceremony VIP Parade', category: 'Sightseeing', cost: 15, durationMinutes: 240, description: 'Witness high-kicking border guards military ceremony at India-Pakistan border gate.', imageUrl: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Amritsar', name: 'Jallianwala Bagh & Amritsari Kulcha Food Crawl', category: 'Food & Drink', cost: 12, durationMinutes: 120, description: 'Pay homage at freedom memorial and taste butter-oozing clay oven stuffed naan kulchas.', imageUrl: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80' },

    // RISHIKESH
    { cityName: 'Rishikesh', name: 'Ganges White Water Rafting & Cliff Jumping', category: 'Adventure', cost: 25, durationMinutes: 240, description: 'Raft Grade III/IV rapids down the Himalayan Ganges from Shivpuri to Laxman Jhula.', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Rishikesh', name: 'Triveni Ghat Evening Ganga Aarti Spiritual Ceremony', category: 'Culture', cost: 0, durationMinutes: 120, description: 'Join Vedic chants, drum beats, and oil lamp offerings at confluence of three holy rivers.', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Rishikesh', name: 'Beatles Ashram (Chaurasi Kutia) & Meditation Walk', category: 'Culture', cost: 12, durationMinutes: 150, description: 'Explore graffiti dome meditation huts where The Beatles composed the White Album in 1968.', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80' },

    // SHIMLA
    { cityName: 'Shimla', name: 'Kalka-Shimla UNESCO Heritage Toy Train Scenic Ride', category: 'Sightseeing', cost: 15, durationMinutes: 180, description: 'Ride narrow-gauge steam train through 102 tunnels and pine-covered mountain bridges.', imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Shimla', name: 'The Ridge & Mall Road Colonial Heritage Walk', category: 'Culture', cost: 8, durationMinutes: 120, description: 'Stroll neo-Gothic Christ Church, Gaiety Theatre, and Lakkar Bazaar wooden handicrafts.', imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Shimla', name: 'Jakhoo Hill Hanuman Temple Trek & Viewpoint', category: 'Nature', cost: 10, durationMinutes: 150, description: 'Hike through alpine cedar forests to Shimla’s highest peak crowned by 108-ft statue.', imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80' },

    // MANALI
    { cityName: 'Manali', name: 'Solang Valley Paragliding & ATV Quad Biking', category: 'Adventure', cost: 45, durationMinutes: 240, description: 'Glide high over Himalayan snowfields and ride quad bikes across riverbed trails.', imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Manali', name: 'Hadimba Temple & Old Manali Village Cafe Crawl', category: 'Culture', cost: 12, durationMinutes: 180, description: 'Visit 1553 pagoda wooden temple surrounded by giant deodar trees and organic cafes.', imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Manali', name: 'Rohtang Pass Glacier & Snow Scooter Excursion', category: 'Nature', cost: 50, durationMinutes: 360, description: 'Ascend 13,000 feet to snow glaciers connecting Kullu and Lahaul valleys.', imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80' },

    // DARJEELING
    { cityName: 'Darjeeling', name: 'Tiger Hill Sunrise View over Mount Kanchenjunga', category: 'Nature', cost: 12, durationMinutes: 180, description: 'Watch golden dawn rays illuminate the world’s 3rd highest peak from 8,400 ft summit.', imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Darjeeling', name: 'Darjeeling Himalayan Railway & Batasia Loop', category: 'Sightseeing', cost: 18, durationMinutes: 150, description: 'Ride historic steam toy train around 360-degree spiral loop with War Memorial views.', imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Darjeeling', name: 'Happy Valley Tea Estate Tour & Fresh Tasting', category: 'Food & Drink', cost: 15, durationMinutes: 120, description: 'Walk lush hillside tea gardens and taste world-renowned Champagne of Teas.', imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },

    // SRINAGAR
    { cityName: 'Srinagar', name: 'Dal Lake Shikara Ride & Floating Vegetable Market', category: 'Sightseeing', cost: 20, durationMinutes: 150, description: 'Glide canopy wooden shikaras past water lilies, floating bazaars, and lotus gardens.', imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Srinagar', name: 'Shalimar Bagh & Nishat Bagh Mughal Gardens', category: 'Culture', cost: 12, durationMinutes: 150, description: 'Explore terraced Mughal water fountains and Zabarwan mountain views.', imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Srinagar', name: 'Gulmarg Gondola Cable Car & Snow Peak Panorama', category: 'Adventure', cost: 40, durationMinutes: 300, description: 'Ride Asia’s highest cable car to Apharwat Peak at 13,780 feet for skiing and snow views.', imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80' },

    // AHMEDABAD
    { cityName: 'Ahmedabad', name: 'Sabarmati Ashram (Gandhi Ashram) Heritage Walk', category: 'Culture', cost: 5, durationMinutes: 120, description: 'Walk Mahatma Gandhi’s tranquil riverside ashram, spinning wheel museum, and library.', imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Ahmedabad', name: 'Adalaj Stepwell (Adalaj ni Vav) Photography Tour', category: 'Sightseeing', cost: 10, durationMinutes: 120, description: 'Marvel at 1498 five-story subterranean Solanki carved sandstone architecture.', imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Ahmedabad', name: 'Manek Chowk Night Street Food Market Crawl', category: 'Food & Drink', cost: 12, durationMinutes: 150, description: 'Taste famous Gwalior Dosa, Pineapple Sandwich, and Kulfi Falooda in historic square.', imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80' },

    // PONDICHERRY
    { cityName: 'Pondicherry', name: 'French Quarter Colonial Architecture & Cafe Bike Tour', category: 'Culture', cost: 12, durationMinutes: 150, description: 'Cycle mustard-yellow streets of White Town, coastal bougainvillea villas, and French bakeries.', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Pondicherry', name: 'Auroville Township & Matrimandir Meditation Walk', category: 'Culture', cost: 15, durationMinutes: 180, description: 'Visit global experimental township, amphitheatre, and golden geodesic Matrimandir dome.', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80' },

    // CHENNAI
    { cityName: 'Chennai', name: 'Kapaleeshwarar Temple & Mylapore Cultural Walk', category: 'Culture', cost: 10, durationMinutes: 120, description: 'Explore 7th-century Dravidian gopuram towers, bronze idols, and flower bazaars.', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Chennai', name: 'Marina Beach Promenade Sunset & Filter Coffee Crawl', category: 'Food & Drink', cost: 8, durationMinutes: 120, description: 'Walk India’s longest natural urban beach and sample hot Murukku & degree filter coffee.', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80' },

    // --- INTERNATIONAL CITIES ACTIVITIES ---
    // TOKYO
    { cityName: 'Tokyo', name: 'Shibuya Crossing & Harajuku Street Food Tour', category: 'Food & Drink', cost: 65, durationMinutes: 180, description: 'Taste authentic ramen, takoyaki, and crepe delicacies through Shibuya neon alleys.', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Tokyo', name: 'Senso-ji Temple & Asakusa Traditional Walk', category: 'Culture', cost: 0, durationMinutes: 120, description: 'Explore Tokyo’s oldest Buddhist temple, Nakamise shopping street, and incense rituals.', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Tokyo', name: 'teamLab Planets Digital Immersive Art Museum', category: 'Culture', cost: 38, durationMinutes: 90, description: 'Walk through body-immersive water galleries and glowing digital gardens.', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Tokyo', name: 'Tsukiji Outer Market Fresh Seafood Crawl', category: 'Food & Drink', cost: 50, durationMinutes: 150, description: 'Sample fresh sashimi, tamagoyaki, wagyu skewers, and matcha ice cream.', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },

    // KYOTO
    { cityName: 'Kyoto', name: 'Fushimi Inari Torii Gate Early Morning Hike', category: 'Nature', cost: 0, durationMinutes: 150, description: 'Ascend Mount Inari through thousands of sacred vermilion torii gates.', imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kyoto', name: 'Arashiyama Bamboo Grove & Tenryu-ji Zen Garden', category: 'Sightseeing', cost: 10, durationMinutes: 120, description: 'Stroll beneath towering bamboo stalks and UNESCO World Heritage gardens.', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Kyoto', name: 'Gion Geisha District Evening Lantern Tour', category: 'Culture', cost: 35, durationMinutes: 90, description: 'Discover traditional wooden machiya townhouses and teahouse culture.', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },

    // OSAKA
    { cityName: 'Osaka', name: 'Dotonbori Neon Canal & Takoyaki Food Crawl', category: 'Food & Drink', cost: 35, durationMinutes: 180, description: 'Feast on octopus balls, okonomiyaki, and kushikatsu under Glico Man lights.', imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Osaka', name: 'Osaka Castle Citadel & Cherry Blossom Park Walk', category: 'Sightseeing', cost: 15, durationMinutes: 150, description: 'Tour stone rampart moats and five-story gilded samurai castle tower.', imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80' },

    // PARIS
    { cityName: 'Paris', name: 'Louvre Museum Skip-the-Line Masterpiece Tour', category: 'Culture', cost: 55, durationMinutes: 150, description: 'Priority access seeing the Mona Lisa, Venus de Milo, and Winged Victory.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Paris', name: 'Eiffel Tower Summit & Seine River Sunset Cruise', category: 'Sightseeing', cost: 75, durationMinutes: 180, description: 'Ascend to the top of Paris followed by a romantic glass boat river cruise.', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Paris', name: 'Palace of Versailles Hall of Mirrors & Royal Gardens', category: 'Culture', cost: 45, durationMinutes: 240, description: 'Explore opulent royal apartments, glittering mirrors, and fountain gardens.', imageUrl: 'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?auto=format&fit=crop&w=800&q=80' },

    // NICE
    { cityName: 'Nice', name: 'Promenade des Anglais & Castle Hill Sunset View', category: 'Sightseeing', cost: 0, durationMinutes: 120, description: 'Walk Mediterranean pebble beaches and climb waterfall park for Baie des Anges views.', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Nice', name: 'Old Town Vieux Nice & Cours Saleya Market Crawl', category: 'Food & Drink', cost: 30, durationMinutes: 150, description: 'Sample authentic Socca chickpea crepes, Niçoise salad, and lavender soaps.', imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },

    // ROME
    { cityName: 'Rome', name: 'Colosseum Underground & Gladiators Arena Floor', category: 'Sightseeing', cost: 80, durationMinutes: 180, description: 'Access subterranean staging tunnels and step onto the restored arena floor.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Rome', name: 'Vatican Museums & Sistine Chapel Priority Tour', category: 'Culture', cost: 65, durationMinutes: 210, description: 'Marvel at Michelangelo’s ceiling frescoes and St. Peter’s Basilica.', imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Rome', name: 'Trastevere Evening Food & Wine Tasting Crawl', category: 'Food & Drink', cost: 70, durationMinutes: 180, description: 'Sample carbonara, supplì, artisanal gelato, and Chianti wines.', imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80' },

    // VENICE
    { cityName: 'Venice', name: 'Grand Canal Gondola Ride & St. Mark’s Basilica', category: 'Sightseeing', cost: 60, durationMinutes: 90, description: 'Glide along historic canals under Rialto Bridge with Venetian gondolier.', imageUrl: 'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Venice', name: 'Murano Glassblowing & Burano Lace Island Boat Tour', category: 'Culture', cost: 45, durationMinutes: 240, description: 'Visit brightly painted fishermen houses and watch master glass artisans.', imageUrl: 'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?auto=format&fit=crop&w=800&q=80' },

    // FLORENCE
    { cityName: 'Florence', name: 'Uffizi Gallery Botticelli & Renaissance Masters', category: 'Culture', cost: 45, durationMinutes: 180, description: 'Guided entry seeing Botticelli’s Birth of Venus, Leonardo, and Caravaggio.', imageUrl: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Florence', name: 'Duomo Dome Climb & Tuscan Wine Tasting', category: 'Sightseeing', cost: 50, durationMinutes: 150, description: 'Climb Brunelleschi’s terracotta cupola followed by Chianti red wine pairing.', imageUrl: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80' },

    // LONDON
    { cityName: 'London', name: 'Tower of London & Crown Jewels Guided Tour', category: 'Sightseeing', cost: 45, durationMinutes: 150, description: 'See the glittering Crown Jewels and historic fortress with Yeoman Warders.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'London', name: 'London Eye Flight & Thames River Hop-on Boat', category: 'Sightseeing', cost: 40, durationMinutes: 120, description: 'Soar 135 meters above the skyline with views of Big Ben and Parliament.', imageUrl: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=800&q=80' },

    // EDINBURGH
    { cityName: 'Edinburgh', name: 'Edinburgh Castle & Royal Mile Heritage Tour', category: 'Sightseeing', cost: 35, durationMinutes: 180, description: 'Explore volcanic castle rock, Honours of Scotland, and cobblestone alleys.', imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Edinburgh', name: 'Scotch Whisky Experience & Cellar Tasting', category: 'Food & Drink', cost: 30, durationMinutes: 120, description: 'Take barrel ride through malt whisky production and sample single malts.', imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80' },

    // BARCELONA
    { cityName: 'Barcelona', name: 'Sagrada Familia Priority Entry & Gaudi Tower Climb', category: 'Culture', cost: 40, durationMinutes: 120, description: 'Marvel at Gaudí’s stained-glass forest columns and city panorama towers.', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Barcelona', name: 'Park Güell Mosaic Terrace & Dragon Staircase', category: 'Sightseeing', cost: 20, durationMinutes: 90, description: 'Explore whimsical mosaic benches and gingerbread houses overlooking the sea.', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a771deda?auto=format&fit=crop&w=800&q=80' },

    // MADRID
    { cityName: 'Madrid', name: 'Prado Museum Masterpieces & Royal Palace Tour', category: 'Culture', cost: 35, durationMinutes: 180, description: 'See Velázquez, Goya, and Hieronymus Bosch before visiting 3,400-room royal palace.', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Madrid', name: 'Plaza Mayor & Mercado de San Miguel Tapas Tour', category: 'Food & Drink', cost: 40, durationMinutes: 150, description: 'Taste Jamón Ibérico, Manchego cheese, churros con chocolate, and sangria.', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80' },

    // BANGKOK
    { cityName: 'Bangkok', name: 'Grand Palace & Emerald Buddha Guided Tour', category: 'Culture', cost: 25, durationMinutes: 150, description: 'Marvel at gold-spired Siamese architecture and sacred emerald Buddha.', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Bangkok', name: 'Damnoen Saduak Floating Market Longtail Boat', category: 'Food & Drink', cost: 30, durationMinutes: 240, description: 'Ride wooden boats sampling coconut pancakes and boat noodles from vendors.', imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80' },

    // PHUKET
    { cityName: 'Phuket', name: 'Phi Phi Islands Speedboat Snorkeling & Maya Bay', category: 'Adventure', cost: 70, durationMinutes: 480, description: 'Cruise limestone island lagoons and snorkel crystal clear waters.', imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Phuket', name: 'Big Buddha Summit & Old Phuket Town Cultural Walk', category: 'Culture', cost: 20, durationMinutes: 180, description: 'Visit 45-meter white marble Buddha statue and Sino-Portuguese shophouse streets.', imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80' },

    // DUBAI
    { cityName: 'Dubai', name: 'Burj Khalifa 124th Floor Skydeck & Fountain Show', category: 'Sightseeing', cost: 60, durationMinutes: 120, description: 'Stand atop the world’s tallest skyscraper followed by dancing fountain lights.', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Dubai', name: 'Red Dune Desert Safari, Camel Ride & BBQ Dinner', category: 'Adventure', cost: 85, durationMinutes: 360, description: '4x4 dune bashing, sandboarding, falconry, camel riding, and starlit buffet.', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },

    // SYDNEY
    { cityName: 'Sydney', name: 'Sydney Opera House Guided Architectural Tour', category: 'Culture', cost: 35, durationMinutes: 90, description: 'Explore behind the scenes of Bennelong Point’s famous vaulted sails.', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Sydney', name: 'Bondi to Coogee Coastal Walk & Surf Lesson', category: 'Adventure', cost: 50, durationMinutes: 180, description: 'Walk ocean cliffs, spot whales, and catch waves with certified surfers.', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },

    // MELBOURNE
    { cityName: 'Melbourne', name: 'Great Ocean Road & Twelve Apostles Day Tour', category: 'Nature', cost: 75, durationMinutes: 600, description: 'Drive spectacular coastal roads seeing wild koalas and limestone sea stacks.', imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Melbourne', name: 'Hosier Lane Street Art & Laneway Coffee Crawl', category: 'Culture', cost: 25, durationMinutes: 150, description: 'Tour vibrant mural arcades and taste flat whites in Australia’s coffee capital.', imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80' },

    // NEW YORK CITY
    { cityName: 'New York City', name: 'Statue of Liberty & Ellis Island Priority Ferry', category: 'Sightseeing', cost: 30, durationMinutes: 210, description: 'Step onto Liberty Island and explore the historic immigration museum.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'New York City', name: 'Empire State Building 86th Floor Observatory', category: 'Sightseeing', cost: 44, durationMinutes: 90, description: '360-degree open-air views of Manhattan skyscrapers and Hudson River.', imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80' },

    // LOS ANGELES
    { cityName: 'Los Angeles', name: 'Hollywood Sign & Griffith Observatory Scenic Hike', category: 'Adventure', cost: 25, durationMinutes: 180, description: 'Hike through Hollywood Hills for close-up photo ops of the iconic sign.', imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Los Angeles', name: 'Santa Monica Pier & Venice Beach Boardwalk Bike', category: 'Sightseeing', cost: 30, durationMinutes: 180, description: 'Cruise Pacific coastal bike paths past Muscle Beach, skaters, and Ferris wheel.', imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80' },

    // SAN FRANCISCO
    { cityName: 'San Francisco', name: 'Golden Gate Bridge Bike Ride to Sausalito', category: 'Adventure', cost: 35, durationMinutes: 240, description: 'Pedal across the iconic red suspension bridge down to bayfront Sausalito cafes.', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'San Francisco', name: 'Alcatraz Island Maximum Security Prison Tour', category: 'Culture', cost: 45, durationMinutes: 210, description: 'Ferry across San Francisco Bay and listen to cellhouse audio tours by former inmates.', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80' },

    // MIAMI
    { cityName: 'Miami', name: 'South Beach Art Deco Historic District Walk', category: 'Culture', cost: 20, durationMinutes: 120, description: 'Tour pastel neon 1930s oceanfront architecture and Ocean Drive celebrity spots.', imageUrl: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Miami', name: 'Everglades National Park Airboat Wildlife Safari', category: 'Nature', cost: 40, durationMinutes: 240, description: 'Glide across sawgrass river of grass spotting wild American alligators and herons.', imageUrl: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=800&q=80' },

    // LAS VEGAS
    { cityName: 'Las Vegas', name: 'High Roller Observation Wheel & Strip Night Tour', category: 'Sightseeing', cost: 35, durationMinutes: 120, description: 'Ride 550-foot giant wheel overlooking glowing casinos and Bellagio fountain lights.', imageUrl: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=800&q=80' },

    // HONOLULU
    { cityName: 'Honolulu', name: 'Pearl Harbor & USS Arizona Memorial Tour', category: 'Culture', cost: 40, durationMinutes: 240, description: 'Pay tribute at WWII sunken battleship memorial and harbor museum exhibits.', imageUrl: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=800&q=80' },
    { cityName: 'Honolulu', name: 'Diamond Head Crater Sunrise Summit Hike', category: 'Nature', cost: 15, durationMinutes: 150, description: 'Climb volcanic tuff crater stairs for panoramic sunrise views over Waikiki Beach.', imageUrl: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=800&q=80' },

    // BANFF
    { cityName: 'Banff', name: 'Lake Louise & Moraine Lake Canadian Rockies Tour', category: 'Nature', cost: 40, durationMinutes: 300, description: 'Photograph turquoise glacier waters surrounded by Ten Peaks.', imageUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80' },

    // CAIRO
    { cityName: 'Cairo', name: 'Giza Pyramids & Great Sphinx Camel Safari', category: 'Sightseeing', cost: 50, durationMinutes: 240, description: 'Ride camels across Sahara desert dunes with views of Great Pyramids.', imageUrl: 'https://images.unsplash.com/photo-1572252821128-44477d612e43?auto=format&fit=crop&w=800&q=80' },

    // CAPE TOWN
    { cityName: 'Cape Town', name: 'Table Mountain Aerial Cableway Sunset Summit', category: 'Nature', cost: 22, durationMinutes: 120, description: 'Ride revolving cable cars to flat-topped summit overlooking Atlantic coast.', imageUrl: 'https://images.unsplash.com/photo-15806518672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80' },

    // RIO DE JANEIRO
    { cityName: 'Rio de Janeiro', name: 'Christ the Redeemer & Corcovado Train', category: 'Sightseeing', cost: 30, durationMinutes: 180, description: 'Ride cog train through Tijuca rainforest to the feet of the giant statue.', imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80' },
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

  const tokyoShibuya = createdActivities.find((a) => a.name && a.name.includes('Shibuya Crossing')) || createdActivities[0];
  if (tokyoShibuya) {
    await query(
      `INSERT INTO "StopActivity" (id, "stopId", "activityId", "scheduledDate", "scheduledTime", notes, "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [stop1.id, tokyoShibuya.id, '2026-09-11', '10:00 AM', 'Meet guide at Hachiko statue near Shibuya station.']
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
