import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GlobeTrotter Database Seeding...');

  // 1. Clean existing data
  try {
    await prisma.stopActivity.deleteMany({});
    await prisma.stop.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.siteSetting.deleteMany({});
    await prisma.contactMessage.deleteMany({});
    await prisma.otp.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (err) {
    console.log('⚠️ Notice during cleanup:', err.message);
  }

  // 2. Create Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('Traveler@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'GlobeTrotter Admin',
      email: 'admin@globetrotter.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'Platform Admin',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      languagePref: 'en',
      status: 'ACTIVE',
    },
  });

  const traveler = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'traveler@globetrotter.com',
      password: userPassword,
      role: 'USER',
      department: 'Solo Explorer',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      languagePref: 'en',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Users created: Admin (${admin.email}), Traveler (${traveler.email})`);

  // 3. Create Master Cities Catalog
  const citiesData = [
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      costIndex: 4,
      popularityScore: 98,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      description: 'A captivating metropolis blending neon-lit skyscrapers with historic shrines, unparalleled cuisine, and vibrant neighborhoods.',
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      costIndex: 3,
      popularityScore: 94,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      description: 'The cultural heart of Japan, boasting thousands of classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.',
    },
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      costIndex: 4,
      popularityScore: 99,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      description: 'The City of Light offers world-class art, fashion, gastronomy, and historic architecture along the meandering Seine river.',
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      costIndex: 3,
      popularityScore: 96,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      description: 'An open-air museum where nearly 3,000 years of globally influential art, architecture, and culture are on display at every cobblestone corner.',
    },
    {
      name: 'Santorini',
      country: 'Greece',
      region: 'Europe',
      costIndex: 4,
      popularityScore: 95,
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      description: 'Famous for whitewashed cliffside villages, cobalt blue domes, volcanic beaches, and legendary Aegean sunsets.',
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      costIndex: 2,
      popularityScore: 97,
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      description: 'An Indonesian paradise known for forested volcanic mountains, iconic rice paddies, pristine surf beaches, and holistic coral reefs.',
    },
    {
      name: 'Cape Town',
      country: 'South Africa',
      region: 'Africa',
      costIndex: 2,
      popularityScore: 91,
      imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
      description: 'A dramatic coastal city crowned by Table Mountain, offering world-class wine valleys, penguins on golden beaches, and rich cultural tapestry.',
    },
    {
      name: 'Banff',
      country: 'Canada',
      region: 'North America',
      costIndex: 4,
      popularityScore: 92,
      imageUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
      description: 'A rugged mountain wonderland in the heart of the Canadian Rockies, featuring turquoise glacial lakes and alpine wildlife.',
    },
    {
      name: 'New York City',
      country: 'United States',
      region: 'North America',
      costIndex: 5,
      popularityScore: 97,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
      description: 'The energetic global center for theater, art, gastronomy, and iconic skylines stretching across five dynamic boroughs.',
    },
    {
      name: 'Reykjavik',
      country: 'Iceland',
      region: 'Europe',
      costIndex: 5,
      popularityScore: 89,
      imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
      description: 'Gateway to geothermal lagoons, cascading waterfalls, black sand beaches, and otherworldly Northern Lights displays.',
    },
    {
      name: 'Rio de Janeiro',
      country: 'Brazil',
      region: 'South America',
      costIndex: 2,
      popularityScore: 90,
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
      description: 'A vibrant seaside metropolis famed for Copacabana and Ipanema beaches, Christ the Redeemer, and pulsating samba rhythms.',
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      costIndex: 4,
      popularityScore: 93,
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      description: 'An ultramodern desert oasis known for luxury shopping, futuristic architecture, lively nightlife, and desert dune safaris.',
    },
  ];

  const createdCities = {};
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    createdCities[c.name] = city;
  }
  console.log(`✅ Created ${Object.keys(createdCities).length} cities in catalog.`);

  // 4. Create Master Activities Catalog
  const activitiesData = [
    // Tokyo
    {
      cityName: 'Tokyo',
      name: 'Shibuya Crossing & Harajuku Food Tour',
      category: 'Food & Drink',
      cost: 65,
      durationMinutes: 180,
      description: 'Taste savory street eats, fluffy pancakes, and explore the neon lights of Shibuya and Takeshita Street.',
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Tokyo',
      name: 'TeamLab Planets Immersive Digital Art',
      category: 'Culture',
      cost: 38,
      durationMinutes: 120,
      description: 'Walk through water and become one with mesmerizing digital flower gardens and crystal light realms.',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Tokyo',
      name: 'Sunrise Senso-ji Temple & Asakusa Rickshaw',
      category: 'Sightseeing',
      cost: 45,
      durationMinutes: 90,
      description: 'Explore Tokyo’s oldest Buddhist temple peacefully in the morning glow followed by a traditional rickshaw ride.',
      imageUrl: 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Tokyo',
      name: 'Tsukiji Outer Market Sushi Masterclass',
      category: 'Food & Drink',
      cost: 110,
      durationMinutes: 150,
      description: 'Learn knife skills and nigiri crafting from a veteran sushi chef using freshest fish from the market.',
      imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
    },

    // Kyoto
    {
      cityName: 'Kyoto',
      name: 'Fushimi Inari Torii Gate Early Morning Hike',
      category: 'Nature',
      cost: 0,
      durationMinutes: 150,
      description: 'Ascend the sacred Mount Inari through thousands of vermilion shrine gates amidst serene cedar forests.',
      imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Kyoto',
      name: 'Arashiyama Bamboo Grove & Monkey Park',
      category: 'Adventure',
      cost: 20,
      durationMinutes: 180,
      description: 'Stroll beneath towering green bamboo stalks and climb up to see panoramic valley views and wild macaques.',
      imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Kyoto',
      name: 'Traditional Tea Ceremony in Gion',
      category: 'Culture',
      cost: 40,
      durationMinutes: 60,
      description: 'Participate in a centuries-old matcha preparation ritual inside a historic 200-year-old wooden teahouse.',
      imageUrl: 'https://images.unsplash.com/photo-1545048702-79360700129e?auto=format&fit=crop&w=800&q=80',
    },

    // Paris
    {
      cityName: 'Paris',
      name: 'Louvre Highlights & Hidden Masterpieces',
      category: 'Culture',
      cost: 55,
      durationMinutes: 150,
      description: 'Priority skip-the-line tour through the grand palace corridors, Mona Lisa, Winged Victory, and Venus de Milo.',
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Paris',
      name: 'Sunset Champagne Cruise on the Seine',
      category: 'Sightseeing',
      cost: 75,
      durationMinutes: 90,
      description: 'Glittering views of Notre-Dame, the Conciergerie, and Eiffel Tower sparkle while sipping fine French champagne.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Paris',
      name: 'Montmartre Secret Bakery & Wine Walk',
      category: 'Food & Drink',
      cost: 85,
      durationMinutes: 180,
      description: 'Sample warm baguettes, artisanal cheeses, decadent macarons, and regional wines through bohemian alleys.',
      imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
    },

    // Rome
    {
      cityName: 'Rome',
      name: 'Colosseum Underground & Gladiators Arena',
      category: 'Sightseeing',
      cost: 80,
      durationMinutes: 180,
      description: 'Access restricted subterranean tunnels where beasts were caged before stepping onto the arena floor.',
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Rome',
      name: 'Vatican Museums & Sistine Chapel Tour',
      category: 'Culture',
      cost: 70,
      durationMinutes: 180,
      description: 'Marvel at Michelangelo’s celestial frescoes and Raphael Rooms with expert art historian storytelling.',
      imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Rome',
      name: 'Trastevere Evening Pasta & Wine Tasting',
      category: 'Food & Drink',
      cost: 65,
      durationMinutes: 150,
      description: 'Discover authentic cacio e pepe, supplì, and crisp Roman wines in vibrant ivy-draped piazzas.',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    },

    // Santorini
    {
      cityName: 'Santorini',
      name: 'Oia Sunset Catamaran Sailing & Snorkeling',
      category: 'Adventure',
      cost: 140,
      durationMinutes: 300,
      description: 'Swim in natural volcanic hot springs, snorkel Red Beach, and savor fresh Greek barbecue as the sun dips into the sea.',
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Santorini',
      name: 'Fira to Oia Caldera Ridge Hike',
      category: 'Nature',
      cost: 0,
      durationMinutes: 240,
      description: 'Spectacular 10km cliff-top trek with non-stop Aegean panoramas passing secluded chapels and rocky vistas.',
      imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    },

    // Bali
    {
      cityName: 'Bali',
      name: 'Mount Batur Sunrise Volcano Trek',
      category: 'Adventure',
      cost: 50,
      durationMinutes: 360,
      description: 'Hike by flashlight to the summit crater for breakfast cooked by volcanic steam as the sun illuminates the clouds.',
      imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Bali',
      name: 'Tegallalang Rice Terraces & Jungle Swing',
      category: 'Nature',
      cost: 25,
      durationMinutes: 120,
      description: 'Soar high above emerald rice terraces on iconic jungle swings and capture dreamlike photos.',
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Bali',
      name: 'Uluwatu Cliff Temple & Kecak Fire Dance',
      category: 'Culture',
      cost: 30,
      durationMinutes: 150,
      description: 'Witness an electrifying traditional chorus chant and fire performance against the crashing waves at dusk.',
      imageUrl: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
    },

    // Cape Town
    {
      cityName: 'Cape Town',
      name: 'Table Mountain Cableway & Summit Walk',
      category: 'Sightseeing',
      cost: 35,
      durationMinutes: 150,
      description: 'Rotate 360 degrees as you ascend to 1,086 meters above sea level for sweeping views of Lion’s Head and the bay.',
      imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Cape Town',
      name: 'Boulders Beach Penguin Colony Kayak',
      category: 'Adventure',
      cost: 60,
      durationMinutes: 120,
      description: 'Paddle through crystal ocean waters alongside charming African penguins nesting along the granitic shores.',
      imageUrl: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=800&q=80',
    },

    // Banff
    {
      cityName: 'Banff',
      name: 'Lake Louise & Moraine Lake Glacial Canoe',
      category: 'Nature',
      cost: 95,
      durationMinutes: 180,
      description: 'Glide in a red canoe across mirror-like iridescent turquoise water beneath the towering Valley of the Ten Peaks.',
      imageUrl: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Banff',
      name: 'Columbia Icefield Glacier Skywalk',
      category: 'Adventure',
      cost: 85,
      durationMinutes: 240,
      description: 'Ride an all-terrain Ice Explorer onto ancient glacial ice and step out onto a cliff-edge glass floor.',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    },

    // Reykjavik
    {
      cityName: 'Reykjavik',
      name: 'Blue Lagoon Geothermal Spa & Silica Mask',
      category: 'Culture',
      cost: 90,
      durationMinutes: 240,
      description: 'Soak in mineral-rich milky blue waters surrounded by mossy black volcanic lava fields.',
      imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    },
    {
      cityName: 'Reykjavik',
      name: 'Golden Circle & Kerid Crater Tour',
      category: 'Sightseeing',
      cost: 75,
      durationMinutes: 480,
      description: 'Experience Gullfoss waterfall, erupting Strokkur geyser, and Thingvellir continental rift valley.',
      imageUrl: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const createdActivities = [];
  for (const act of activitiesData) {
    const city = createdCities[act.cityName];
    if (city) {
      const { cityName, ...rest } = act;
      const created = await prisma.activity.create({
        data: {
          ...rest,
          cityId: city.id,
        },
      });
      createdActivities.push(created);
    }
  }
  console.log(`✅ Created ${createdActivities.length} activities in catalog.`);

  // 5. Create Sample User Trips
  const trip1 = await prisma.trip.create({
    data: {
      userId: traveler.id,
      name: 'Grand Japan Discovery: Tokyo to Kyoto',
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-18'),
      description: 'A nine-day adventure spanning hyper-futuristic neon districts, ancient torii gates, culinary wonders, and zen gardens.',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      isPublic: true,
      shareSlug: 'japan-discovery-2026',
    },
  });

  // Trip 1 Stops
  const stop1 = await prisma.stop.create({
    data: {
      tripId: trip1.id,
      cityId: createdCities['Tokyo'].id,
      orderIndex: 0,
      arrivalDate: new Date('2026-09-10'),
      departureDate: new Date('2026-09-14'),
    },
  });

  const stop2 = await prisma.stop.create({
    data: {
      tripId: trip1.id,
      cityId: createdCities['Kyoto'].id,
      orderIndex: 1,
      arrivalDate: new Date('2026-09-14'),
      departureDate: new Date('2026-09-18'),
    },
  });

  // Assign activities to stops
  const tokyoActs = createdActivities.filter((a) => a.cityId === createdCities['Tokyo'].id);
  const kyotoActs = createdActivities.filter((a) => a.cityId === createdCities['Kyoto'].id);

  if (tokyoActs[0]) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop1.id,
        activityId: tokyoActs[0].id,
        scheduledDate: new Date('2026-09-11'),
        scheduledTime: '10:00 AM',
        notes: 'Meet guide at Hachiko statue.',
      },
    });
  }
  if (tokyoActs[1]) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop1.id,
        activityId: tokyoActs[1].id,
        scheduledDate: new Date('2026-09-12'),
        scheduledTime: '02:00 PM',
        notes: 'Wear shorts or clothes that can roll above knees.',
      },
    });
  }
  if (kyotoActs[0]) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop2.id,
        activityId: kyotoActs[0].id,
        scheduledDate: new Date('2026-09-15'),
        scheduledTime: '06:30 AM',
        notes: 'Arrive early before tourist crowds.',
      },
    });
  }

  // Budget for Trip 1
  await prisma.budget.createMany({
    data: [
      { tripId: trip1.id, category: 'TRANSPORT', estimatedAmount: 750, actualAmount: 710, notes: 'Shinkansen bullet train & flights' },
      { tripId: trip1.id, category: 'STAY', estimatedAmount: 1200, actualAmount: 1150, notes: 'Ryokan & Boutique Tokyo hotels' },
      { tripId: trip1.id, category: 'ACTIVITIES', estimatedAmount: 400, actualAmount: 380, notes: 'Tours & museum tickets' },
      { tripId: trip1.id, category: 'MEALS', estimatedAmount: 600, actualAmount: 640, notes: 'Ramen, Wagyu, Matcha sweets' },
      { tripId: trip1.id, category: 'OTHER', estimatedAmount: 200, actualAmount: 150, notes: 'Souvenirs & pocket WiFi' },
    ],
  });

  // Trip 2 (Mediterranean Dreams)
  const trip2 = await prisma.trip.create({
    data: {
      userId: traveler.id,
      name: 'Santorini & Ancient Rome Odyssey',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-09'),
      description: 'Sun-drenched Aegean caldera cruises followed by Roman pasta crawls and Colosseum underground exploration.',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      isPublic: true,
      shareSlug: 'santorini-rome-odyssey',
    },
  });

  const stop3 = await prisma.stop.create({
    data: {
      tripId: trip2.id,
      cityId: createdCities['Santorini'].id,
      orderIndex: 0,
      arrivalDate: new Date('2026-10-01'),
      departureDate: new Date('2026-10-05'),
    },
  });

  const stop4 = await prisma.stop.create({
    data: {
      tripId: trip2.id,
      cityId: createdCities['Rome'].id,
      orderIndex: 1,
      arrivalDate: new Date('2026-10-05'),
      departureDate: new Date('2026-10-09'),
    },
  });

  await prisma.budget.createMany({
    data: [
      { tripId: trip2.id, category: 'TRANSPORT', estimatedAmount: 600, actualAmount: 580 },
      { tripId: trip2.id, category: 'STAY', estimatedAmount: 1400, actualAmount: 1450 },
      { tripId: trip2.id, category: 'ACTIVITIES', estimatedAmount: 500, actualAmount: 490 },
      { tripId: trip2.id, category: 'MEALS', estimatedAmount: 550, actualAmount: 600 },
    ],
  });

  console.log(`✅ Sample trips created with stops, activities, and budget items.`);

  // 6. Create Default Site Settings (SEO, SMTP, Payments)
  const defaultSettings = [
    // SEO
    { key: 'seo_home_title', value: 'GlobeTrotter | Curated Travel Planning & Epic Journeys', group: 'SEO' },
    { key: 'seo_home_description', value: 'Design your dream itinerary with GlobeTrotter. Explore world-class destinations, estimate budgets, and plan activities with ease.', group: 'SEO' },
    { key: 'seo_home_og_image', value: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', group: 'SEO' },
    { key: 'seo_about_title', value: 'About GlobeTrotter | Our Journey & Mission', group: 'SEO' },
    { key: 'seo_about_description', value: 'Learn about our passion for adventure, sustainable travel storytelling, and smart vacation planning.', group: 'SEO' },
    { key: 'seo_gallery_title', value: 'GlobeTrotter Gallery | Visual Inspiration From Around The World', group: 'SEO' },
    { key: 'seo_gallery_description', value: 'Browse hundreds of breathtaking travel moments curated by explorers worldwide.', group: 'SEO' },
    { key: 'seo_google_analytics_id', value: 'G-GLOBETROTTER2026', group: 'SEO' },
    { key: 'seo_search_console_tag', value: 'google-site-verification-globetrotter-token', group: 'SEO' },
    { key: 'seo_meta_pixel_id', value: '987654321012345', group: 'SEO' },

    // SMTP
    { key: 'smtp_host', value: 'smtp.mailtrap.io', group: 'SMTP' },
    { key: 'smtp_port', value: '2525', group: 'SMTP' },
    { key: 'smtp_user', value: 'smtp_demo_user', group: 'SMTP' },
    { key: 'smtp_pass', value: 'smtp_demo_pass', group: 'SMTP' },
    { key: 'smtp_from_email', value: 'concierge@globetrotter.com', group: 'SMTP' },
    { key: 'smtp_from_name', value: 'GlobeTrotter Concierge', group: 'SMTP' },
    { key: 'smtp_secure', value: 'false', group: 'SMTP' },

    // Payment Gateway
    { key: 'payment_gateway', value: 'STRIPE', group: 'PAYMENT' },
    { key: 'payment_currency', value: 'USD', group: 'PAYMENT' },
    { key: 'payment_stripe_pub_key', value: 'pk_test_sample_51Oabcdefghijklmnopqrstuvwxyz', group: 'PAYMENT' },
    { key: 'payment_stripe_secret_key', value: 'sk_test_sample_51Oabcdefghijklmnopqrstuvwxyz', group: 'PAYMENT' },
    { key: 'payment_razorpay_key_id', value: 'rzp_test_sample_key', group: 'PAYMENT' },
    { key: 'payment_razorpay_key_secret', value: 'rzp_test_sample_secret', group: 'PAYMENT' },
    { key: 'payment_mode', value: 'TEST', group: 'PAYMENT' },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.create({ data: s });
  }

  // 7. Create Sample Transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: traveler.id,
        tripId: trip1.id,
        amount: 49.0,
        currency: 'USD',
        gateway: 'STRIPE',
        status: 'COMPLETED',
        gatewayRef: 'ch_3N1abc123987',
        notes: 'GlobeTrotter Pro Trip Exporter & Offline Sync Pass',
      },
      {
        userId: traveler.id,
        tripId: trip2.id,
        amount: 25.0,
        currency: 'USD',
        gateway: 'STRIPE',
        status: 'COMPLETED',
        gatewayRef: 'ch_3N2xyz456123',
        notes: 'Custom Concierge Itinerary Review',
      },
    ],
  });

  // 8. Create Sample Contact Messages
  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        subject: 'Group tour inquiry for Kyoto in Autumn',
        message: 'Hello! I am planning a 12-person family trip to Kyoto in November. Do you offer custom private guide bookings?',
        isRead: false,
      },
      {
        name: 'Liam Chen',
        email: 'liam.chen@wander.io',
        subject: 'Partnership with Eco-Lodges in Bali',
        message: 'We run sustainable villas in Ubud and would love to feature our experiences on GlobeTrotter!',
        isRead: true,
      },
    ],
  });

  console.log(`✅ Site settings, transactions, and contact messages initialized.`);
  console.log('🎉 GlobeTrotter database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
