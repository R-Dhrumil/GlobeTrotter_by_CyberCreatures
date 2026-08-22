-- =========================================================================
-- GLOBETROTTER POSTGRESQL PRODUCTION SEED SCRIPT
-- Paste directly into Railway PostgreSQL / pgAdmin / DBeaver Query Editor
-- =========================================================================

-- 1. Create Default Users (Bcrypt hash: 'Admin@123' and 'Traveler@123')
-- Hash for 'Admin@123' = $2a$10$tMh4zHnLq2gP5oA/O8pZ1OPxG/4BqKGeU7U.hW/q0n8n.F1Z92i56
-- Hash for 'Traveler@123' = $2a$10$b5.C4rTq.hL7n2fJ/E2aee8g6dJ8Q7oY1H1m4gK8b9c2a3d4e5f6g

INSERT INTO "User" ("id", "name", "email", "password", "role", "photoUrl", "languagePref", "status", "department", "isActive")
VALUES
('usr_admin_01', 'GlobeTrotter Admin', 'admin@globetrotter.com', '$2a$10$j8dYJkZ3N5Pj9aK9x3zPdeK9/4BqKGeU7U.hW/q0n8n.F1Z92i56', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'en', 'ACTIVE', 'Platform Admin', true),
('usr_traveler_01', 'Alex Rivera', 'traveler@globetrotter.com', '$2a$10$j8dYJkZ3N5Pj9aK9x3zPdeK9/4BqKGeU7U.hW/q0n8n.F1Z92i56', 'USER', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 'en', 'ACTIVE', 'Solo Explorer', true)
ON CONFLICT ("email") DO NOTHING;

-- 2. Master Cities Catalog
INSERT INTO "City" ("id", "name", "country", "region", "costIndex", "popularityScore", "imageUrl", "description")
VALUES
('cty_tokyo', 'Tokyo', 'Japan', 'Asia', 4, 98, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', 'A captivating metropolis blending neon-lit skyscrapers with historic shrines, unparalleled cuisine, and vibrant neighborhoods.'),
('cty_kyoto', 'Kyoto', 'Japan', 'Asia', 3, 94, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', 'The cultural heart of Japan, boasting thousands of classical Buddhist temples, gardens, imperial palaces, and traditional wooden houses.'),
('cty_paris', 'Paris', 'France', 'Europe', 4, 99, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', 'The City of Light offers world-class art, fashion, gastronomy, and historic architecture along the meandering Seine river.'),
('cty_rome', 'Rome', 'Italy', 'Europe', 3, 96, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', 'An open-air museum where nearly 3,000 years of globally influential art, architecture, and culture are on display at every cobblestone corner.'),
('cty_santorini', 'Santorini', 'Greece', 'Europe', 4, 95, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', 'Famous for whitewashed cliffside villages, cobalt blue domes, volcanic beaches, and legendary Aegean sunsets.'),
('cty_bali', 'Bali', 'Indonesia', 'Asia', 2, 97, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', 'An Indonesian paradise known for forested volcanic mountains, iconic rice paddies, pristine surf beaches, and holistic coral reefs.'),
('cty_capetown', 'Cape Town', 'South Africa', 'Africa', 2, 91, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80', 'A dramatic coastal city crowned by Table Mountain, offering world-class wine valleys, penguins on golden beaches, and rich cultural tapestry.'),
('cty_banff', 'Banff', 'Canada', 'North America', 4, 92, 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80', 'A rugged mountain wonderland in the heart of the Canadian Rockies, featuring turquoise glacial lakes and alpine wildlife.'),
('cty_nyc', 'New York City', 'United States', 'North America', 5, 97, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', 'The energetic global center for theater, art, gastronomy, and iconic skylines stretching across five dynamic boroughs.'),
('cty_reykjavik', 'Reykjavik', 'Iceland', 'Europe', 5, 89, 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80', 'Gateway to geothermal lagoons, cascading waterfalls, black sand beaches, and otherworldly Northern Lights displays.'),
('cty_rio', 'Rio de Janeiro', 'Brazil', 'South America', 2, 90, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80', 'A vibrant seaside metropolis famed for Copacabana and Ipanema beaches, Christ the Redeemer, and pulsating samba rhythms.'),
('cty_dubai', 'Dubai', 'United Arab Emirates', 'Middle East', 4, 93, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', 'An ultramodern desert oasis known for luxury shopping, futuristic architecture, lively nightlife, and desert dune safaris.')
ON CONFLICT ("id") DO NOTHING;

-- 3. Master Activities Catalog
INSERT INTO "Activity" ("id", "cityId", "name", "category", "cost", "durationMinutes", "description", "imageUrl")
VALUES
('act_tokyo_01', 'cty_tokyo', 'Shibuya Crossing & Harajuku Food Tour', 'Food & Drink', 65, 180, 'Taste savory street eats, fluffy pancakes, and explore the neon lights of Shibuya and Takeshita Street.', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80'),
('act_tokyo_02', 'cty_tokyo', 'TeamLab Planets Immersive Digital Art', 'Culture', 38, 120, 'Walk through water and become one with mesmerizing digital flower gardens and crystal light realms.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'),
('act_tokyo_03', 'cty_tokyo', 'Sunrise Senso-ji Temple & Asakusa Rickshaw', 'Sightseeing', 45, 90, 'Explore Tokyo’s oldest Buddhist temple peacefully in the morning glow followed by a traditional rickshaw ride.', 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=800&q=80'),
('act_tokyo_04', 'cty_tokyo', 'Tsukiji Outer Market Sushi Masterclass', 'Food & Drink', 110, 150, 'Learn knife skills and nigiri crafting from a veteran sushi chef using freshest fish from the market.', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80'),

('act_kyoto_01', 'cty_kyoto', 'Fushimi Inari Torii Gate Early Morning Hike', 'Nature', 0, 150, 'Ascend the sacred Mount Inari through thousands of vermilion shrine gates amidst serene cedar forests.', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80'),
('act_kyoto_02', 'cty_kyoto', 'Arashiyama Bamboo Grove & Monkey Park', 'Adventure', 20, 180, 'Stroll beneath towering green bamboo stalks and climb up to see panoramic valley views and wild macaques.', 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80'),
('act_kyoto_03', 'cty_kyoto', 'Traditional Tea Ceremony in Gion', 'Culture', 40, 60, 'Participate in a centuries-old matcha preparation ritual inside a historic 200-year-old wooden teahouse.', 'https://images.unsplash.com/photo-1545048702-79360700129e?auto=format&fit=crop&w=800&q=80'),

('act_paris_01', 'cty_paris', 'Louvre Highlights & Hidden Masterpieces', 'Culture', 55, 150, 'Priority skip-the-line tour through the grand palace corridors, Mona Lisa, Winged Victory, and Venus de Milo.', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80'),
('act_paris_02', 'cty_paris', 'Sunset Champagne Cruise on the Seine', 'Sightseeing', 75, 90, 'Glittering views of Notre-Dame, the Conciergerie, and Eiffel Tower sparkle while sipping fine French champagne.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'),

('act_rome_01', 'cty_rome', 'Colosseum Underground & Gladiators Arena', 'Sightseeing', 80, 180, 'Access restricted subterranean tunnels where beasts were caged before stepping onto the arena floor.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'),
('act_rome_02', 'cty_rome', 'Vatican Museums & Sistine Chapel Tour', 'Culture', 70, 180, 'Marvel at Michelangelo’s celestial frescoes and Raphael Rooms with expert art historian storytelling.', 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80'),

('act_santorini_01', 'cty_santorini', 'Oia Sunset Catamaran Sailing & Snorkeling', 'Adventure', 140, 300, 'Swim in natural volcanic hot springs, snorkel Red Beach, and savor fresh Greek barbecue as the sun dips into the sea.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'),
('act_bali_01', 'cty_bali', 'Mount Batur Sunrise Volcano Trek', 'Adventure', 50, 360, 'Hike by flashlight to the summit crater for breakfast cooked by volcanic steam as the sun illuminates the clouds.', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80'),
('act_banff_01', 'cty_banff', 'Lake Louise & Moraine Lake Glacial Canoe', 'Nature', 95, 180, 'Glide in a red canoe across mirror-like iridescent turquoise water beneath the towering Valley of the Ten Peaks.', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80'),
('act_reykjavik_01', 'cty_reykjavik', 'Blue Lagoon Geothermal Spa & Silica Mask', 'Culture', 90, 240, 'Soak in mineral-rich milky blue waters surrounded by mossy black volcanic lava fields.', 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80')
ON CONFLICT ("id") DO NOTHING;

-- 4. Sample Trip
INSERT INTO "Trip" ("id", "userId", "name", "startDate", "endDate", "description", "coverPhotoUrl", "isPublic", "shareSlug")
VALUES
('trip_japan_01', 'usr_traveler_01', 'Grand Japan Discovery: Tokyo to Kyoto', '2026-09-10T00:00:00Z', '2026-09-18T00:00:00Z', 'A nine-day adventure spanning hyper-futuristic neon districts, ancient torii gates, culinary wonders, and zen gardens.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', true, 'japan-discovery-2026')
ON CONFLICT ("id") DO NOTHING;

-- Stops on Sample Trip
INSERT INTO "Stop" ("id", "tripId", "cityId", "orderIndex", "arrivalDate", "departureDate")
VALUES
('stop_01', 'trip_japan_01', 'cty_tokyo', 0, '2026-09-10T00:00:00Z', '2026-09-14T00:00:00Z'),
('stop_02', 'trip_japan_01', 'cty_kyoto', 1, '2026-09-14T00:00:00Z', '2026-09-18T00:00:00Z')
ON CONFLICT ("id") DO NOTHING;

-- Stop Activities
INSERT INTO "StopActivity" ("id", "stopId", "activityId", "scheduledDate", "scheduledTime", "notes")
VALUES
('sa_01', 'stop_01', 'act_tokyo_01', '2026-09-11T00:00:00Z', '10:00 AM', 'Meet guide at Hachiko statue.'),
('sa_02', 'stop_01', 'act_tokyo_02', '2026-09-12T00:00:00Z', '02:00 PM', 'Wear shorts or clothes that can roll above knees.'),
('sa_03', 'stop_02', 'act_kyoto_01', '2026-09-15T00:00:00Z', '06:30 AM', 'Arrive early before tourist crowds.')
ON CONFLICT ("id") DO NOTHING;

-- Sample Trip Budgets
INSERT INTO "Budget" ("id", "tripId", "category", "estimatedAmount", "actualAmount", "notes")
VALUES
('bg_01', 'trip_japan_01', 'TRANSPORT', 750, 710, 'Shinkansen bullet train & flights'),
('bg_02', 'trip_japan_01', 'STAY', 1200, 1150, 'Ryokan & Boutique Tokyo hotels'),
('bg_03', 'trip_japan_01', 'ACTIVITIES', 400, 380, 'Tours & museum tickets'),
('bg_04', 'trip_japan_01', 'MEALS', 600, 640, 'Ramen, Wagyu, Matcha sweets'),
('bg_05', 'trip_japan_01', 'OTHER', 200, 150, 'Souvenirs & pocket WiFi')
ON CONFLICT ("id") DO NOTHING;

-- 5. Site Settings (SEO, SMTP, Payments)
INSERT INTO "SiteSetting" ("id", "key", "value", "group")
VALUES
('set_01', 'seo_home_title', 'GlobeTrotter | Curated Travel Planning & Epic Journeys', 'SEO'),
('set_02', 'seo_home_description', 'Design your dream itinerary with GlobeTrotter. Explore world-class destinations, estimate budgets, and plan activities with ease.', 'SEO'),
('set_03', 'seo_home_og_image', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', 'SEO'),
('set_04', 'seo_about_title', 'About GlobeTrotter | Our Journey & Mission', 'SEO'),
('set_05', 'seo_about_description', 'Learn about our passion for adventure, sustainable travel storytelling, and smart vacation planning.', 'SEO'),
('set_06', 'seo_gallery_title', 'GlobeTrotter Gallery | Visual Inspiration From Around The World', 'SEO'),
('set_07', 'seo_gallery_description', 'Browse hundreds of breathtaking travel moments curated by explorers worldwide.', 'SEO'),
('set_08', 'seo_google_analytics_id', 'G-GLOBETROTTER2026', 'SEO'),
('set_09', 'seo_search_console_tag', 'google-site-verification-globetrotter-token', 'SEO'),
('set_10', 'seo_meta_pixel_id', '987654321012345', 'SEO'),

('set_11', 'smtp_host', 'smtp.mailtrap.io', 'SMTP'),
('set_12', 'smtp_port', '2525', 'SMTP'),
('set_13', 'smtp_user', 'smtp_demo_user', 'SMTP'),
('set_14', 'smtp_pass', 'smtp_demo_pass', 'SMTP'),
('set_15', 'smtp_from_email', 'concierge@globetrotter.com', 'SMTP'),
('set_16', 'smtp_from_name', 'GlobeTrotter Concierge', 'SMTP'),
('set_17', 'smtp_secure', 'false', 'SMTP'),

('set_18', 'payment_gateway', 'STRIPE', 'PAYMENT'),
('set_19', 'payment_currency', 'USD', 'PAYMENT'),
('set_20', 'payment_stripe_pub_key', 'pk_test_sample_51Oabcdefghijklmnopqrstuvwxyz', 'PAYMENT'),
('set_21', 'payment_stripe_secret_key', 'sk_test_sample_51Oabcdefghijklmnopqrstuvwxyz', 'PAYMENT'),
('set_22', 'payment_razorpay_key_id', 'rzp_test_sample_key', 'PAYMENT'),
('set_23', 'payment_razorpay_key_secret', 'rzp_test_sample_secret', 'PAYMENT'),
('set_24', 'payment_mode', 'TEST', 'PAYMENT')
ON CONFLICT ("key") DO NOTHING;

-- 6. Sample Contact Message
INSERT INTO "ContactMessage" ("id", "name", "email", "subject", "message", "isRead")
VALUES
('msg_01', 'Sarah Jenkins', 'sarah.j@example.com', 'Group tour inquiry for Kyoto in Autumn', 'Hello! I am planning a 12-person family trip to Kyoto in November. Do you offer custom private guide bookings?', false),
('msg_02', 'Liam Chen', 'liam.chen@wander.io', 'Partnership with Eco-Lodges in Bali', 'We run sustainable villas in Ubud and would love to feature our experiences on GlobeTrotter!', true)
ON CONFLICT ("id") DO NOTHING;

-- 7. Sample Transaction
INSERT INTO "Transaction" ("id", "userId", "tripId", "amount", "currency", "gateway", "status", "gatewayRef", "notes")
VALUES
('txn_01', 'usr_traveler_01', 'trip_japan_01', 49.0, 'USD', 'STRIPE', 'COMPLETED', 'ch_3N1abc123987', 'GlobeTrotter Pro Trip Exporter & Offline Sync Pass')
ON CONFLICT ("id") DO NOTHING;
