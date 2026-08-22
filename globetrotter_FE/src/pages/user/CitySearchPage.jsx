import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { catalogAPI, tripAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { InteractiveWorldMap } from '../../components/common/InteractiveWorldMap';
import {
  Compass,
  Search,
  MapPin,
  Star,
  DollarSign,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  Globe,
  Grid,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CitySearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [cities, setCities] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [region, setRegion] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [costIndex, setCostIndex] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  // Add to trip modal
  const [addToTripModalOpen, setAddToTripModalOpen] = useState(false);
  const [selectedCityForTrip, setSelectedCityForTrip] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [addingStop, setAddingStop] = useState(false);

  const regions = ['ALL', 'Asia', 'Europe', 'North America', 'Africa', 'South America', 'Middle East'];

  useEffect(() => {
    fetchHierarchy();
  }, []);

  useEffect(() => {
    fetchCities();
  }, [region, selectedCountry, selectedState, costIndex, sortBy]);

  const fetchHierarchy = async () => {
    try {
      const res = await catalogAPI.getHierarchy();
      if (res.data?.hierarchy) {
        setHierarchy(res.data.hierarchy);
      }
    } catch (e) {}
  };

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await catalogAPI.getCities({
        search: search || undefined,
        region: region !== 'ALL' ? region : undefined,
        country: selectedCountry || undefined,
        state: selectedState || undefined,
        costIndex: costIndex || undefined,
        sortBy,
      });
      if (res.data?.cities) {
        setCities(res.data.cities);
      }
    } catch (err) {
      console.error('Failed to load cities catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCities();
  };

  const handleOpenAddToTrip = async (city) => {
    setSelectedCityForTrip(city);
    try {
      const res = await tripAPI.getMyTrips();
      if (res.data?.trips) {
        setUserTrips(res.data.trips);
        if (res.data.trips.length > 0) {
          setSelectedTripId(res.data.trips[0].id);
        }
      }
    } catch (err) {}
    setAddToTripModalOpen(true);
  };

  const handleConfirmAddStop = async (e) => {
    e.preventDefault();
    if (!selectedTripId || !selectedCityForTrip) return;

    setAddingStop(true);
    try {
      await tripAPI.addStop(selectedTripId, {
        cityId: selectedCityForTrip.id,
      });
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}
      alert(`✨ ${selectedCityForTrip.name} added to your chosen itinerary!`);
      setAddToTripModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to add stop to trip');
    } finally {
      setAddingStop(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-stone-900">Explore Global Destinations</h1>
        <p className="text-xs text-stone-500 mt-1">
          Search iconic cities across the globe and add them straight into your itineraries
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by city name, country, or keyword (e.g. Kyoto, Tokyo, Paris)..."
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
            Search Catalog
          </button>
        </form>

        {/* Cascading Country -> State Location Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              1. Country Filter
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-semibold"
            >
              <option value="">-- All Countries --</option>
              {hierarchy.map((h) => (
                <option key={h.country} value={h.country}>
                  {h.country} ({h.states?.reduce((acc, st) => acc + (st.cities?.length || 0), 0)} cities)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              2. State / Province Filter
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              disabled={!selectedCountry}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-semibold disabled:opacity-50"
            >
              <option value="">-- All States / Provinces --</option>
              {hierarchy
                .find((h) => h.country === selectedCountry)
                ?.states.map((st) => (
                  <option key={st.state} value={st.state}>
                    {st.state} ({st.cities?.length || 0} cities)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-end">
            {(selectedCountry || selectedState) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCountry('');
                  setSelectedState('');
                }}
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold transition"
              >
                Reset Location Filter
              </button>
            )}
          </div>
        </div>

        {/* Region Pills & Sort Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  region === r
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
            {/* Grid vs Map Toggle */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'map' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>World Map</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none"
              >
                <option value="popularity">Most Popular</option>
                <option value="name">Alphabetical</option>
                <option value="cost_asc">Cost (Low to High)</option>
                <option value="cost_desc">Cost (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Display */}
      {loading ? (
        <LoadingSpinner text="Searching master destinations..." />
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span>Click any marker pin on the map to view destination highlights and add it to your trip!</span>
            <span className="font-bold text-amber-700">{cities.length} Cities Mapped Worldwide</span>
          </div>

          <InteractiveWorldMap
            cities={cities}
            onSelectCityForStop={(city) => handleOpenAddToTrip(city)}
            height="600px"
            showRouteLines={false}
          />
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-3xl border border-stone-200">
          <p className="text-stone-500 font-medium">No cities match your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city) => (
            <div
              key={city.id}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft hover:shadow-premium transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden bg-stone-900">
                  <img
                    src={city.imageUrl}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent"></div>

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md">
                    {city.region}
                  </span>

                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-stone-900">
                    <Star className="w-3 h-3 fill-stone-900" />
                    <span>{city.popularityScore}%</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-2xl font-bold font-serif leading-tight">{city.name}</h3>
                    <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {city.country} {city.state ? `• ${city.state}` : ''}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {city.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Cost Index
                      </span>
                      <div className="flex text-amber-600 font-bold text-xs">
                        {'★'.repeat(city.costIndex)}
                        <span className="text-stone-200">{'★'.repeat(5 - city.costIndex)}</span>
                      </div>
                    </div>

                    <span className="font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                      {city._count?.activities || 0} activities
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleOpenAddToTrip(city)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to a Journey</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add to existing trip */}
      <Modal
        isOpen={addToTripModalOpen}
        onClose={() => setAddToTripModalOpen(false)}
        title={`Add ${selectedCityForTrip?.name || 'City'} to Itinerary`}
        maxWidth="max-w-md"
      >
        {userTrips.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-stone-600">You don't have any trips created yet.</p>
            <button
              onClick={() => {
                setAddToTripModalOpen(false);
                alert('Please click "Plan New Trip" on your dashboard first!');
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
            >
              Create New Trip First
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmAddStop} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Choose Target Trip *
              </label>
              <select
                required
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              >
                {userTrips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.stops?.length || 0} stops)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddToTripModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingStop}
                className="px-6 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 disabled:opacity-50"
              >
                {addingStop ? 'Adding...' : 'Confirm Stop'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
