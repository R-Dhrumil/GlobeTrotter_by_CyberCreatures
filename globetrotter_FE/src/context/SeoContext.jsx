import React, { createContext, useContext, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { seoAPI } from '../api/client';

const SeoContext = createContext(null);

export const SeoProvider = ({ children }) => {
  const [seoConfig, setSeoConfig] = useState({
    home: {
      title: 'GlobeTrotter — Curated Travel Planning & Itineraries',
      description: 'Design bespoke journeys, explore world-class destinations, estimate budgets, and plan custom adventures with GlobeTrotter.',
      ogImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    },
    about: {
      title: 'About GlobeTrotter — Our Story & Mission',
      description: 'Learn about our passion for adventure, sustainable travel storytelling, and smart vacation planning.',
      ogImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    },
    gallery: {
      title: 'GlobeTrotter Gallery — Inspiring Travel Moments',
      description: 'Browse hundreds of breathtaking travel moments curated by explorers worldwide.',
      ogImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    },
    contact: {
      title: 'Contact GlobeTrotter — Concierge Travel Support',
      description: 'Get in touch with our travel designers and support team.',
      ogImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    },
    googleAnalyticsId: 'G-GLOBETROTTER2026',
    searchConsoleTag: 'google-site-verification-globetrotter-token',
    metaPixelId: '987654321012345',
  });

  const refreshSeo = async () => {
    try {
      const res = await seoAPI.getSeo();
      if (res.data?.seo) {
        setSeoConfig(res.data.seo);
      }
    } catch (err) {
      console.log('Using default SEO configs');
    }
  };

  useEffect(() => {
    refreshSeo();
  }, []);

  return (
    <SeoContext.Provider value={{ seoConfig, refreshSeo }}>
      {/* Global verification tags and tracking scripts rendered directly in head */}
      <Helmet>
        {seoConfig.searchConsoleTag && (
          <meta name="google-site-verification" content={seoConfig.searchConsoleTag} />
        )}
        {seoConfig.googleAnalyticsId && (
          <meta name="analytics-id" content={seoConfig.googleAnalyticsId} />
        )}
        {seoConfig.metaPixelId && (
          <meta name="pixel-id" content={seoConfig.metaPixelId} />
        )}
      </Helmet>
      {children}
    </SeoContext.Provider>
  );
};

export const useSeo = () => {
  const context = useContext(SeoContext);
  if (!context) {
    throw new Error('useSeo must be used within a SeoProvider');
  }
  return context;
};
