import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSeo } from '../../context/SeoContext';
import { catalogAPI } from '../../api/client';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const HomePage = () => {
  const { seoConfig } = useSeo();
  const [featuredCities, setFeaturedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await catalogAPI.getFeatured();
        if (res.data?.featured) {
          setFeaturedCities(res.data.featured);
        }
      } catch (err) {
        console.error('Failed to load featured destinations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/cities?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/app/cities');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6]">
      <Helmet>
        <title>{seoConfig.home.title}</title>
        <meta name="description" content={seoConfig.home.description} />
        <meta property="og:title" content={seoConfig.home.title} />
        <meta property="og:description" content={seoConfig.home.description} />
        <meta property="og:image" content={seoConfig.home.ogImage} />
      </Helmet>

      {/* 1. HERO SECTION (Wix Adventure Tour Inspiration) */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Warm Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=85"
            alt="Adventure Travel Landscape"
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b18] via-stone-900/60 to-black/40"></div>
          <div className="absolute inset-0 bg-amber-950/20 mix-blend-multiply"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Next-Generation Expedition & Travel Planner
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
            Where Wilderness Meets <br />
            <span className="text-amber-400 italic font-serif">Curated Perfection</span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light drop-shadow">
            Architect custom multi-city journeys, schedule authentic local activities, monitor live budgets, and share breathtaking itineraries with the world.
          </p>

          {/* Interactive Hero Search / Action Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-3 border border-stone-200/80"
          >
            <div className="flex items-center gap-3 w-full px-4 py-2 text-stone-800">
              <Search className="w-5 h-5 text-amber-600 shrink-0" />
              <input
                type="text"
                placeholder="Where do you want to explore? (e.g. Tokyo, Paris, Bali)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-sm sm:text-base shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Stat Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-2xl font-bold font-serif text-amber-300">50+</p>
              <p className="text-xs text-stone-300">Curated Experiences</p>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-2xl font-bold font-serif text-amber-300">100%</p>
              <p className="text-xs text-stone-300">Dynamic Budget Sync</p>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-2xl font-bold font-serif text-amber-300">1-Click</p>
              <p className="text-xs text-stone-300">Shared Itineraries</p>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-2xl font-bold font-serif text-amber-300">4.9/5</p>
              <p className="text-xs text-stone-300">Explorer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED DESTINATIONS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-widest mb-2">
              <TrendingUp className="w-4 h-4" />
              Handcrafted Expedition Spots
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
              Trending Global Destinations
            </h2>
          </div>
          <Link
            to="/app/cities"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition"
          >
            View All Catalog Cities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Discovering extraordinary destinations..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCities.map((city) => (
              <div
                key={city.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium border border-stone-200/80 transition-all duration-300 flex flex-col"
              >
                {/* Image & Badges */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={city.imageUrl}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent"></div>

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/20">
                      {city.region}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-900 shadow-md">
                    <Star className="w-3 h-3 fill-stone-900" />
                    <span>{city.popularityScore}%</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-bold font-serif leading-tight">{city.name}</h3>
                    <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {city.country}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                    {city.description}
                  </p>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold block">
                        Cost Index
                      </span>
                      <div className="flex text-amber-600 font-bold text-xs">
                        {'★'.repeat(city.costIndex)}
                        <span className="text-stone-300">{'★'.repeat(5 - city.costIndex)}</span>
                      </div>
                    </div>

                    <Link
                      to={`/app/cities`}
                      className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      Plan Stop
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. HOW GLOBETROTTER WORKS (Visual Cards) */}
      <section className="py-20 bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-2">
              Streamlined Travel Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 mb-4">
              Everything Needed for Seamless Expeditions
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Built for discerning explorers who crave flexible daily itineraries and absolute financial clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-soft hover:shadow-premium transition">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">1. Multi-City Stopover Builder</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Add global cities to your route, define arrival & departure windows, and drag-and-drop stops to reorder your itinerary on the fly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-soft hover:shadow-premium transition">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">2. Day-by-Day Activity Scheduling</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Browse curated local tours, culinary food walks, and sacred temples. Assign timed slots and private notes to each day.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-soft hover:shadow-premium transition">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-3">3. Real-Time Budget Intelligence</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Set estimates by category (transport, stays, dining, activities) and log real expenses. Receive automatic alerts before going over budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white p-8 sm:p-14 shadow-2xl border border-stone-800">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80"
              alt="Mountain Lake"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-transparent z-0"></div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              Start Your Expedition
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif mb-6 leading-tight">
              Ready to Design Your Next Unforgettable Journey?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mb-8 leading-relaxed">
              Join thousands of globetrotters who plan their dream routes effortlessly. Create your free account today and start building your custom itinerary in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xl shadow-amber-600/30 transition text-center"
              >
                Create Free Account
              </Link>
              <Link
                to="/gallery"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition text-center"
              >
                Explore Photo Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
