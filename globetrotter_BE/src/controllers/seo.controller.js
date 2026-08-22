import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Get all SEO settings (Public endpoint consumed by React Helmet Async)
 */
export const getSeoSettings = catchAsync(async (req, res) => {
  const seoSettings = await prisma.siteSetting.findMany({
    where: { group: 'SEO' },
  });

  const seoMap = {
    home: {
      title: 'GlobeTrotter | Curated Travel Planning & Epic Journeys',
      description: 'Design your dream itinerary with GlobeTrotter. Explore world-class destinations, estimate budgets, and plan activities with ease.',
      ogImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    },
    about: {
      title: 'About GlobeTrotter | Our Journey & Mission',
      description: 'Learn about our passion for adventure, sustainable travel storytelling, and smart vacation planning.',
      ogImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    },
    gallery: {
      title: 'GlobeTrotter Gallery | Visual Inspiration From Around The World',
      description: 'Browse hundreds of breathtaking travel moments curated by explorers worldwide.',
      ogImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    },
    contact: {
      title: 'Contact GlobeTrotter | Plan With Our Travel Concierge',
      description: 'Get in touch with our travel designers and support team.',
      ogImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    },
    googleAnalyticsId: 'G-GLOBETROTTER2026',
    searchConsoleTag: 'google-site-verification-globetrotter-token',
    metaPixelId: '987654321012345',
  };

  seoSettings.forEach((s) => {
    if (s.key === 'seo_home_title') seoMap.home.title = s.value;
    if (s.key === 'seo_home_description') seoMap.home.description = s.value;
    if (s.key === 'seo_home_og_image') seoMap.home.ogImage = s.value;
    if (s.key === 'seo_about_title') seoMap.about.title = s.value;
    if (s.key === 'seo_about_description') seoMap.about.description = s.value;
    if (s.key === 'seo_gallery_title') seoMap.gallery.title = s.value;
    if (s.key === 'seo_gallery_description') seoMap.gallery.description = s.value;
    if (s.key === 'seo_contact_title') seoMap.contact.title = s.value;
    if (s.key === 'seo_contact_description') seoMap.contact.description = s.value;
    if (s.key === 'seo_google_analytics_id') seoMap.googleAnalyticsId = s.value;
    if (s.key === 'seo_search_console_tag') seoMap.searchConsoleTag = s.value;
    if (s.key === 'seo_meta_pixel_id') seoMap.metaPixelId = s.value;
  });

  return ApiResponse.send(res, 200, { seo: seoMap }, 'SEO configuration retrieved');
});

/**
 * Update SEO settings (Admin only)
 */
export const updateSeoSettings = catchAsync(async (req, res) => {
  const { seo } = req.body;

  if (!seo || typeof seo !== 'object') {
    throw new ApiError(400, 'SEO object is required');
  }

  const updates = [
    { key: 'seo_home_title', value: seo.home?.title },
    { key: 'seo_home_description', value: seo.home?.description },
    { key: 'seo_home_og_image', value: seo.home?.ogImage },
    { key: 'seo_about_title', value: seo.about?.title },
    { key: 'seo_about_description', value: seo.about?.description },
    { key: 'seo_gallery_title', value: seo.gallery?.title },
    { key: 'seo_gallery_description', value: seo.gallery?.description },
    { key: 'seo_contact_title', value: seo.contact?.title },
    { key: 'seo_contact_description', value: seo.contact?.description },
    { key: 'seo_google_analytics_id', value: seo.googleAnalyticsId },
    { key: 'seo_search_console_tag', value: seo.searchConsoleTag },
    { key: 'seo_meta_pixel_id', value: seo.metaPixelId },
  ];

  for (const item of updates) {
    if (item.value !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: item.key },
        update: { value: String(item.value) },
        create: {
          key: item.key,
          value: String(item.value),
          group: 'SEO',
        },
      });
    }
  }

  return ApiResponse.send(res, 200, null, 'SEO settings saved successfully');
});
