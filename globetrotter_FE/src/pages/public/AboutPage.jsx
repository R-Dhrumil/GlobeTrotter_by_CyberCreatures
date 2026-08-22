import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeo } from '../../context/SeoContext';
import { Compass, Globe, Heart, Shield, Award, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  const { seoConfig } = useSeo();

  return (
    <div className="min-h-screen bg-[#fbf9f6] pb-24">
      <Helmet>
        <title>{seoConfig.about.title}</title>
        <meta name="description" content={seoConfig.about.description} />
      </Helmet>

      {/* Hero Banner */}
      <div className="relative py-24 bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
            alt="Travel Landscape"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4 border border-amber-500/30">
            Our Purpose & Heritage
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold font-serif mb-6 leading-tight">
            Crafting Journeys That Inspire Lifetime Memories
          </h1>
          <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            GlobeTrotter was founded with one singular ambition: to bridge the gap between dream vacation ideas and actionable, stress-free travel plans.
          </p>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-premium border border-stone-200/80">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">Our Mission</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              To empower modern explorers with intuitive itinerary building tools, curated global destinations, and crystal-clear financial budgeting.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-premium border border-stone-200/80">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">Our Vision</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              A connected world where every passionate traveler can easily discover off-the-beaten-path experiences and share their journeys with loved ones.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-premium border border-stone-200/80">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">Our Values</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Authenticity, sustainable tourism, radical transparency in cost estimations, and deep respect for local cultures worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Story & Numbers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-2">
              The GlobeTrotter Origin
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 mb-6">
              Built by Adventurers, Designed for Travelers
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
              We started GlobeTrotter after countless chaotic vacations filled with scattered spreadsheets, lost reservations, and unpredictable costs. We envisioned an elegant workspace where planning an expedition feels just as magical as stepping foot in a new country.
            </p>
            <div className="space-y-3">
              {[
                'Curated catalogs verified by experienced local guides',
                'Visual drag-and-drop itinerary builders for multi-city routes',
                'Comprehensive budget categorizations with live cost tracking',
                'Public shareable links to inspire friends and fellow travelers',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-stone-800 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 bg-stone-100 rounded-3xl text-center border border-stone-200">
              <p className="text-4xl font-bold font-serif text-amber-600 mb-2">12+</p>
              <p className="text-xs text-stone-600 font-semibold uppercase tracking-wider">Iconic Global Cities</p>
            </div>
            <div className="p-8 bg-stone-100 rounded-3xl text-center border border-stone-200">
              <p className="text-4xl font-bold font-serif text-amber-600 mb-2">50+</p>
              <p className="text-xs text-stone-600 font-semibold uppercase tracking-wider">Curated Activities</p>
            </div>
            <div className="p-8 bg-stone-100 rounded-3xl text-center border border-stone-200">
              <p className="text-4xl font-bold font-serif text-amber-600 mb-2">99.8%</p>
              <p className="text-xs text-stone-600 font-semibold uppercase tracking-wider">Satisfaction Rate</p>
            </div>
            <div className="p-8 bg-stone-100 rounded-3xl text-center border border-stone-200">
              <p className="text-4xl font-bold font-serif text-amber-600 mb-2">24/7</p>
              <p className="text-xs text-stone-600 font-semibold uppercase tracking-wider">Concierge Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
