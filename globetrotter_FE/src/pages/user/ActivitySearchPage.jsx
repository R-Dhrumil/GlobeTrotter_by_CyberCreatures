import React, { useState, useEffect } from 'react';
import { catalogAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Compass,
  Search,
  Clock,
  DollarSign,
  Tag,
  MapPin,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export const ActivitySearchPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [maxCost, setMaxCost] = useState('');

  const categories = ['ALL', 'Sightseeing', 'Adventure', 'Food & Drink', 'Nature', 'Culture'];

  useEffect(() => {
    fetchActivities();
  }, [category, maxCost]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await catalogAPI.getActivities({
        search: search || undefined,
        category: category !== 'ALL' ? category : undefined,
        maxCost: maxCost || undefined,
      });
      if (res.data?.activities) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-stone-900">Curated Activity Catalog</h1>
        <p className="text-xs text-stone-500 mt-1">
          Discover culinary walks, private museum tours, alpine treks, and sacred temple visits
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search experiences (e.g. Sushi masterclass, Louvre, Catamaran sailing)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-100 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:bg-white focus:border-amber-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
          >
            Filter Activities
          </button>
        </form>

        {/* Category Pills & Price Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  category === c
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <span>Max Price:</span>
            <select
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none"
            >
              <option value="">Any Price</option>
              <option value="0">Free Only</option>
              <option value="50">Under $50</option>
              <option value="100">Under $100</option>
              <option value="200">Under $200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <LoadingSpinner text="Loading curated activities..." />
      ) : activities.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-3xl border border-stone-200">
          <p className="text-stone-500 font-medium">No experiences found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft hover:shadow-premium transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-stone-900">
                  <img
                    src={act.imageUrl}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent"></div>

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md">
                    {act.category}
                  </span>

                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-900 shadow-md">
                    {act.cost === 0 ? 'Free' : `$${act.cost}`}
                  </span>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold font-serif leading-snug">{act.name}</h3>
                    {act.city && (
                      <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {act.city.name}, {act.city.country}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1 font-medium text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {act.durationMinutes} mins
                    </span>
                    <span>•</span>
                    <span className="text-stone-500">Verified Guide Tour</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
