import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripAPI } from '../../api/client';
import { CreateTripModal } from './CreateTripModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Compass,
  Plus,
  Search,
  Calendar,
  MapPin,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  DollarSign,
  Grid,
  List,
  Check,
} from 'lucide-react';

export const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await tripAPI.getMyTrips();
      if (res.data?.trips) {
        setTrips(res.data.trips);
      }
    } catch (err) {
      console.error('Failed to load trips', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await tripAPI.delete(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleCopyPublicLink = (slug) => {
    const url = `${window.location.origin}/trips/share/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredTrips = trips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-stone-900">My Travel Itineraries</h1>
          <p className="text-xs text-stone-500 mt-1">Manage and organize all your upcoming and past expeditions</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Plan New Trip
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search your trips by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl border transition ${
              viewMode === 'grid' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl border transition ${
              viewMode === 'list' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trips Content */}
      {loading ? (
        <LoadingSpinner text="Fetching your journeys..." />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No journeys found"
          description={search ? 'No trips match your search query.' : 'You have not created any trips yet.'}
          actionText="Create Your First Trip"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
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

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {trip.isPublic && trip.shareSlug && (
                      <button
                        onClick={() => handleCopyPublicLink(trip.shareSlug)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition flex items-center gap-1"
                        title="Copy Public Link"
                      >
                        {copiedSlug === trip.shareSlug ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                        {copiedSlug === trip.shareSlug ? 'Copied' : 'Share'}
                      </button>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold font-serif leading-snug">{trip.name}</h3>
                    {trip.startDate && (
                      <p className="text-xs text-stone-300 flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-stone-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {trip.stops?.length || 0} stops
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${trip.budgets?.reduce((acc, b) => acc + (b.estimatedAmount || 0), 0) || 0} budget
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2">
                    {trip.description || 'Custom multi-city travel itinerary created with GlobeTrotter.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                <Link
                  to={`/app/trips/${trip.id}`}
                  className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-semibold text-xs transition text-center"
                >
                  Itinerary Builder
                </Link>

                <Link
                  to={`/app/trips/${trip.id}/budget`}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  title="View Budget Breakdown"
                >
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </Link>

                <button
                  onClick={() => handleDelete(trip.id, trip.name)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft divide-y divide-stone-100 overflow-hidden">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition">
              <div className="flex items-center gap-4">
                <img
                  src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80'}
                  alt={trip.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">{trip.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                    {trip.startDate && (
                      <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                    )}
                    <span>•</span>
                    <span>{trip.stops?.length || 0} stops</span>
                    <span>•</span>
                    <span>${trip.budgets?.reduce((acc, b) => acc + (b.estimatedAmount || 0), 0) || 0} budget</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/app/trips/${trip.id}`}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-semibold text-xs transition"
                >
                  Open Builder
                </Link>
                <Link
                  to={`/app/trips/${trip.id}/budget`}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  title="Budget"
                >
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </Link>
                <button
                  onClick={() => handleDelete(trip.id, trip.name)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTripModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTripCreated={(newTrip) => {
          setTrips((prev) => [newTrip, ...prev]);
          navigate(`/app/trips/${newTrip.id}`);
        }}
      />
    </div>
  );
};
