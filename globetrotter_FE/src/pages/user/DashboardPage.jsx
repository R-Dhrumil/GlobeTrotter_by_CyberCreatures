import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tripAPI, catalogAPI } from '../../api/client';
import { CreateTripModal } from './CreateTripModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Compass,
  PlusCircle,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  FolderHeart,
  Search,
  Sparkles,
  Share2,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [featuredCities, setFeaturedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tripsRes, citiesRes] = await Promise.all([
        tripAPI.getMyTrips(),
        catalogAPI.getFeatured(),
      ]);

      if (tripsRes.data?.trips) setTrips(tripsRes.data.trips);
      if (citiesRes.data?.featured) setFeaturedCities(citiesRes.data.featured);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTripCreated = (newTrip) => {
    setTrips((prev) => [newTrip, ...prev]);
    navigate(`/app/trips/${newTrip.id}`);
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading your travel hub..." />;

  // Calculate high-level stats
  const totalTripsCount = trips.length;
  const totalStopsCount = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalActivitiesCount = trips.reduce(
    (acc, t) => acc + t.stops?.reduce((sAcc, s) => sAcc + (s.activities?.length || 0), 0),
    0
  );
  const totalEstimatedBudget = trips.reduce(
    (acc, t) => acc + t.budgets?.reduce((bAcc, b) => bAcc + (b.estimatedAmount || 0), 0),
    0
  );

  const upcomingTrip = trips[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Welcome & Primary Action Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white p-8 sm:p-10 shadow-premium border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80"
            alt="Travel Adventure"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent z-0"></div>

        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/30">
            Explorer Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2">
            Welcome back, {user?.name || 'Explorer'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            You currently have <strong className="text-amber-400">{totalTripsCount}</strong> active {totalTripsCount === 1 ? 'journey' : 'journeys'} spanning <strong className="text-amber-400">{totalStopsCount}</strong> destinations. Ready for your next expedition?
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition flex items-center gap-2 transform active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Total Journeys</p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">{totalTripsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Destinations</p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">{totalStopsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Experiences</p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">{totalActivitiesCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Allocated Budget</p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">${totalEstimatedBudget}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Recent / Upcoming Trips Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-900">Your Current Itineraries</h2>
            <p className="text-xs text-stone-500">Pick up right where you left off</p>
          </div>
          <Link
            to="/app/my-trips"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
          >
            Manage All Trips
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-stone-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900">No journeys planned yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Create your very first trip and start adding stops, activities, and budget estimates!
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition"
            >
              Plan First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft hover:shadow-premium transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-stone-900">
                    <img
                      src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent"></div>

                    {trip.isPublic && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-md">
                        Public
                      </span>
                    )}

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-lg font-bold font-serif leading-snug">{trip.name}</h3>
                      {trip.startDate && (
                        <p className="text-xs text-stone-300 flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {trip.stops?.length || 0} stops
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        {trip.stops?.reduce((acc, s) => acc + (s.activities?.length || 0), 0) || 0} activities
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2">
                      {trip.description || 'Custom multi-city travel itinerary created with GlobeTrotter.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                  <Link
                    to={`/app/trips/${trip.id}`}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-semibold text-xs transition text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Open Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Destination Suggestions Row */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-900">Explore New Destinations</h2>
            <p className="text-xs text-stone-500">Add top-rated catalog cities into your next trip</p>
          </div>
          <Link
            to="/app/cities"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
          >
            Explore Master Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCities.slice(0, 4).map((city) => (
            <div
              key={city.id}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft hover:shadow-premium transition flex flex-col justify-between"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h4 className="text-base font-bold font-serif leading-tight">{city.name}</h4>
                  <p className="text-[11px] text-stone-300">{city.country}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                  {city._count?.activities || 0} activities
                </span>

                <Link
                  to={`/app/cities`}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-amber-600 hover:text-white text-stone-700 transition"
                  title="View in Catalog"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for creating a new trip */}
      <CreateTripModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTripCreated={handleTripCreated}
      />
    </div>
  );
};
