import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const places = [
  {
    city: "Shimla & Manali",
    state: "Himachal Pradesh",
    title: "Snow, Skiing, and Christmas Vibes",
    desc: "Shimla and Manali are the perfect places to visit in winter in India for those who love the cold and snow. These hill stations offer stunning views, charming colonial architecture, and activities like skiing, snowboarding, and even sledging.",
    img: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=800&auto=format&fit=crop",
    category: "Adventure"
  },
  {
    city: "Srinagar & Pahalgam",
    state: "Jammu & Kashmir",
    title: "A Winter Paradise",
    desc: "Srinagar and Pahalgam in Jammu & Kashmir offer a perfect blend of natural beauty, adventure, and cultural experiences in the winter months. Srinagar, with its iconic Dal Lake and snow-capped mountains, becomes a dreamy winter wonderland.",
    img: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=800&auto=format&fit=crop",
    category: "Nature"
  },
  {
    city: "Mussoorie",
    state: "Uttarakhand",
    title: "A Charming Hill Station",
    desc: "Mussoorie, often referred to as the 'Queen of Hills,' transforms into a winter wonderland during the colder months. Known for its scenic beauty and colonial charm, It is a popular destination for those seeking a winter retreat.",
    img: "https://images.unsplash.com/photo-1626714485856-11bf2be33ce1?q=80&w=800&auto=format&fit=crop",
    category: "Sightseeing"
  },
  {
    city: "Jaipur & Udaipur",
    state: "Rajasthan",
    title: "Royal Forts and Palaces",
    desc: "Rajasthan’s royal cities, Jaipur and Udaipur, are stunning in winter. The cooler temperatures make it ideal for exploring the majestic palaces and forts without the scorching heat.",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
    category: "Sightseeing"
  },
  {
    city: "Rann of Kutch",
    state: "Gujarat",
    title: "Rann Utsav",
    desc: "The Rann of Kutch in Gujarat offers a unique winter experience. The Rann Utsav, a cultural festival held from November to February, celebrates the culture of Gujarat through dance, music, and local handicrafts.",
    img: "https://images.unsplash.com/photo-1598254426543-03e0ddfd7d3c?q=80&w=800&auto=format&fit=crop",
    category: "Culture"
  },
  {
    city: "Goa",
    state: "Goa",
    title: "Sunburn Festival & Parties",
    desc: "Goa in December is a hotspot for tourists looking to enjoy the winter sun. The Sunburn Festival and various Christmas and New Year parties attract thousands every year.",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
    category: "Adventure"
  },
  {
    city: "Munnar & Kovalam",
    state: "Kerala",
    title: "Serene Hill Stations and Coastal Bliss",
    desc: "Munnar, with its rolling tea gardens and misty hills, provides a serene escape, ideal for nature lovers. Kovalam, with its pristine beaches, offers a perfect place to unwind.",
    img: "https://images.unsplash.com/photo-1593693397690-362cb9739cb2?q=80&w=800&auto=format&fit=crop",
    category: "Nature"
  },
  {
    city: "Andaman & Nicobar",
    state: "Andaman & Nicobar Islands",
    title: "Scuba Diving & Pristine Beaches",
    desc: "Offering some of the best beaches and crystal-clear waters in the country, this tropical paradise is a haven for water sports enthusiasts, especially those looking to indulge in scuba diving.",
    img: "https://images.unsplash.com/photo-1589136777351-fdc9c9cb15af?q=80&w=800&auto=format&fit=crop",
    category: "Adventure"
  },
  {
    city: "Shillong",
    state: "Meghalaya",
    title: "Music & Misty Landscapes",
    desc: "Shillong, often referred to as the “Scotland of the East,” is a beautiful hill station in Meghalaya. Known for its misty landscapes, tranquil vibes, and vibrant music culture.",
    img: "https://images.unsplash.com/photo-1598910404364-79357494ec2d?q=80&w=800&auto=format&fit=crop",
    category: "Nature"
  },
  {
    city: "Tawang",
    state: "Arunachal Pradesh",
    title: "Monasteries & Cultural Richness",
    desc: "Tawang, located in the northeastern tip of Arunachal Pradesh, is a hidden gem offering a blend of snow-capped mountains, Tibetan culture, and serene landscapes.",
    img: "https://images.unsplash.com/photo-1626017387224-10ec693ec89f?q=80&w=800&auto=format&fit=crop",
    category: "Culture"
  },
  {
    city: "Leh-Ladakh",
    state: "Ladakh",
    title: "Frozen River Trekking",
    desc: "For adventure lovers, Leh-Ladakh is one of the most thrilling places to visit in winter in India. January is the ideal time to experience the Chadar Trek, a world-famous trek across the frozen Zanskar River.",
    img: "https://images.unsplash.com/photo-1594803975551-7892eb463a86?q=80&w=800&auto=format&fit=crop",
    category: "Adventure"
  },
  {
    city: "Pondicherry",
    state: "Puducherry",
    title: "French Charm and Serene Beaches",
    desc: "Known for its French colonial architecture, charming streets, and serene beaches, this coastal town offers a peaceful ambiance perfect for unwinding.",
    img: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop",
    category: "Sightseeing"
  },
  {
    city: "Jaisalmer",
    state: "Rajasthan",
    title: "Desert Safaris and Festival",
    desc: "Jaisalmer, often called the “Golden City,” is a magical destination in Rajasthan known for its golden sandstone architecture and vast desert landscapes.",
    img: "https://images.unsplash.com/photo-1599059021750-82716ae2b6e1?q=80&w=800&auto=format&fit=crop",
    category: "Culture"
  },
  {
    city: "Darjeeling",
    state: "West Bengal",
    title: "Tea Estates and Toy Train",
    desc: "For those who enjoy the cool, misty weather, Darjeeling offers a delightful winter retreat. January brings snow to the higher altitudes, giving the hill station a magical feel.",
    img: "https://images.unsplash.com/photo-1544256729-15886ea5278c?q=80&w=800&auto=format&fit=crop",
    category: "Sightseeing"
  },
  {
    city: "Ranthambore",
    state: "Rajasthan",
    title: "Tiger Spotting",
    desc: "For wildlife enthusiasts, Ranthambore National Park in Rajasthan offers one of the best winter experiences. January is a prime time for tiger spotting.",
    img: "https://images.unsplash.com/photo-1596711681283-e1f4094a6135?q=80&w=800&auto=format&fit=crop",
    category: "Nature"
  },
  {
    city: "Varanasi",
    state: "Uttar Pradesh",
    title: "Spiritual Vibes & Dev Deepawali",
    desc: "Varanasi, the spiritual heart of India, is especially beautiful in January. The cooler weather makes exploring the ghats and temples much more comfortable.",
    img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop",
    category: "Culture"
  },
  {
    city: "Coorg",
    state: "Karnataka",
    title: "Coffee Estates & Winter Trekking",
    desc: "Nestled in the Western Ghats, Coorg is a beautiful hill station in Karnataka that’s perfect for a winter retreat. The cool, misty weather enhances its lush coffee estates.",
    img: "https://images.unsplash.com/photo-1601736630043-41a4fa0a4305?q=80&w=800&auto=format&fit=crop",
    category: "Nature"
  },
  {
    city: "Mahabaleshwar",
    state: "Maharashtra",
    title: "Strawberries and Cool Climate",
    desc: "Located in the Sahyadri hills, Mahabaleshwar is a charming hill station in Maharashtra that becomes particularly inviting during the winter months.",
    img: "https://images.unsplash.com/photo-1616053328599-282bda639ba3?q=80&w=800&auto=format&fit=crop",
    category: "Nature"
  },
  {
    city: "Spiti Valley",
    state: "Himachal Pradesh",
    title: "Frozen Beauty",
    desc: "Spiti Valley is a hidden treasure in the Himalayas that offers dramatic landscapes and a chance to experience the raw beauty of nature.",
    img: "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?q=80&w=800&auto=format&fit=crop",
    category: "Adventure"
  },
  {
    city: "Khajuraho",
    state: "Madhya Pradesh",
    title: "Temples & Cultural Festival",
    desc: "Known for its intricate temples and stunning architecture, Khajuraho is especially captivating in February when the Khajuraho Dance Festival takes place.",
    img: "https://images.unsplash.com/photo-1594950346383-7c30f40d4133?q=80&w=800&auto=format&fit=crop",
    category: "Culture"
  },
  {
    city: "Ziro Valley",
    state: "Arunachal Pradesh",
    title: "Scenic Winter Landscapes",
    desc: "Ziro Valley in Arunachal Pradesh is a hidden gem perfect for nature lovers and those looking for an offbeat winter getaway.",
    img: "https://images.unsplash.com/photo-1563212002-c67db1853f65?q=80&w=800&auto=format&fit=crop",
    category: "Nature"
  },
  {
    city: "Hampi",
    state: "Karnataka",
    title: "Ruins and Pleasant Winter Weather",
    desc: "Hampi, the UNESCO World Heritage Site in Karnataka, is a stunning blend of history, culture, and natural beauty.",
    img: "https://images.unsplash.com/photo-1600010998849-0639965d1389?q=80&w=800&auto=format&fit=crop",
    category: "Sightseeing"
  }
];

async function seed() {
  try {
    for (const p of places) {
      // Create City
      const cityRes = await pool.query(
        `INSERT INTO "City" (name, country, region, "imageUrl", description)
         VALUES ($1, 'India', $2, $3, $4)
         RETURNING id`,
        [p.city, p.state, p.img, p.desc]
      );
      const cityId = cityRes.rows[0].id;

      // Create Activity
      // To ensure it shows up in Gallery, we'll map Culture -> Sightseeing for now
      // as our getGallery explicitly fetches Sightseeing, Adventure, Nature, Food & Drink, Culinary
      let cat = p.category;
      if (cat === 'Culture') cat = 'Sightseeing';

      await pool.query(
        `INSERT INTO "Activity" ("cityId", name, category, cost, "durationMinutes", description, "imageUrl")
         VALUES ($1, $2, $3, 0, 120, $4, $5)`,
        [cityId, p.title, cat, p.desc, p.img]
      );
    }
    console.log('Successfully seeded places and activities!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    pool.end();
  }
}

seed();
