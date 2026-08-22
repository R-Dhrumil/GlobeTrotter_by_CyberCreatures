import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripAPI, catalogAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import {
  Compass,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Share2,
  Sparkles,
  Edit2,
  Check,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ItineraryBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stops'); // 'stops', 'schedule', 'timeline'

  // Modals & Catalogs
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);
  const [editTripModalOpen, setEditTripModalOpen] = useState(false);
  const [selectedStopForActivity, setSelectedStopForActivity] = useState(null);

  const [catalogCities, setCatalogCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [stopDates, setStopDates] = useState({ arrivalDate: '', departureDate: '' });

  // Activity form
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [activityForm, setActivityForm] = useState({
    scheduledDate: '',
    scheduledTime: '10:00 AM',
    notes: '',
  });

  // Edit trip form
  const [tripEditData, setTripEditData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    isPublic: true,
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchTripDetails();
    fetchCitiesCatalog();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const res = await tripAPI.getById(id);
      if (res.data?.trip) {
        setTrip(res.data.trip);
        setTripEditData({
          name: res.data.trip.name,
          startDate: res.data.trip.startDate ? res.data.trip.startDate.split('T')[0] : '',
          endDate: res.data.trip.endDate ? res.data.trip.endDate.split('T')[0] : '',
          description: res.data.trip.description || '',
          isPublic: res.data.trip.isPublic,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const fetchCitiesCatalog = async () => {
    try {
      const res = await catalogAPI.getCities({});
      if (res.data?.cities) {
        setCatalogCities(res.data.cities);
      }
    } catch (err) {
      console.error('Failed to load cities catalog', err);
    }
  };

  // Add Stop
  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedCityId) return;

    try {
      await tripAPI.addStop(trip.id, {
        cityId: selectedCityId,
        arrivalDate: stopDates.arrivalDate || null,
        departureDate: stopDates.departureDate || null,
      });
      setAddStopModalOpen(false);
      setSelectedCityId('');
      setStopDates({ arrivalDate: '', departureDate: '' });
      fetchTripDetails();
    } catch (err) {
      alert(err.message || 'Failed to add stop');
    }
  };

  // Remove Stop
  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Remove this stop from your itinerary?')) return;
    try {
      await tripAPI.deleteStop(stopId);
      fetchTripDetails();
    } catch (err) {
      alert(err.message || 'Failed to remove stop');
    }
  };

  // Reorder Stops
  const handleMoveStop = async (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= trip.stops.length) return;

    const reordered = [...trip.stops];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const stopIds = reordered.map((s) => s.id);
    try {
      await tripAPI.reorderStops(trip.id, stopIds);
      fetchTripDetails();
    } catch (err) {
      alert(err.message || 'Failed to reorder stops');
    }
  };

  // Add Activity to Stop
  const handleOpenAddActivity = (stop) => {
    setSelectedStopForActivity(stop);
    setSelectedActivityId(stop.city?.activities?.[0]?.id || '');
    setAddActivityModalOpen(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!selectedActivityId || !selectedStopForActivity) return;

    try {
      await tripAPI.addActivity(selectedStopForActivity.id, {
        activityId: selectedActivityId,
        scheduledDate: activityForm.scheduledDate || null,
        scheduledTime: activityForm.scheduledTime,
        notes: activityForm.notes,
      });
      setAddActivityModalOpen(false);
      setActivityForm({ scheduledDate: '', scheduledTime: '10:00 AM', notes: '' });
      fetchTripDetails();
    } catch (err) {
      alert(err.message || 'Failed to add activity');
    }
  };

  // Remove Scheduled Activity
  const handleDeleteStopActivity = async (activityId) => {
    try {
      await tripAPI.deleteActivity(activityId);
      fetchTripDetails();
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  // Save Trip Meta
  const handleSaveTripMeta = async (e) => {
    e.preventDefault();
    try {
      await tripAPI.update(trip.id, tripEditData);
      setEditTripModalOpen(false);
      fetchTripDetails();
    } catch (err) {
      alert(err.message || 'Failed to update trip');
    }
  };

  const handleCopyShareLink = () => {
    if (!trip.shareSlug) return;
    const url = `${window.location.origin}/trips/share/${trip.shareSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) return <LoadingSpinner fullScreen text="Opening Itinerary Planner..." />;
  if (error || !trip) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-600 font-semibold">{error || 'Trip not found'}</p>
        <Link to="/app/my-trips" className="mt-4 inline-block text-amber-600 text-sm font-bold">
          Return to My Trips
        </Link>
      </div>
    );
  }

  // Calculate activities for current city in activity modal
  const activeStopCity = catalogCities.find((c) => c.id === selectedStopForActivity?.cityId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Trip Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white p-6 sm:p-8 shadow-premium border border-stone-800">
        <img
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-600/90 text-white backdrop-blur-md">
                Itinerary Builder
              </span>
              {trip.isPublic ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Public Link Active
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-700/60 text-stone-300 backdrop-blur-md">
                  Private Journey
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">{trip.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
              {trip.startDate && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {trip.endDate && ` — ${new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </span>
              )}
              <span>•</span>
              <span>{trip.stops?.length || 0} destinations scheduled</span>
            </div>

            {trip.description && (
              <p className="text-xs text-stone-300 max-w-2xl line-clamp-2 italic">
                "{trip.description}"
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setEditTripModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition flex items-center gap-1.5 text-xs font-semibold"
              title="Edit Trip Info"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Info</span>
            </button>

            {trip.isPublic && trip.shareSlug && (
              <button
                onClick={handleCopyShareLink}
                className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition flex items-center gap-1.5 text-xs font-semibold"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
              </button>
            )}

            <Link
              to={`/app/trips/${trip.id}/budget`}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              <span>Budget Analyzer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs (Stops Planner vs Day Schedule vs Timeline) */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('stops')}
            className={`pb-2 text-sm font-bold transition border-b-2 ${
              activeTab === 'stops'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Destination Stops ({trip.stops?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-2 text-sm font-bold transition border-b-2 ${
              activeTab === 'schedule'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Day-by-Day Schedule
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 text-sm font-bold transition border-b-2 ${
              activeTab === 'timeline'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Vertical Route Timeline
          </button>
        </div>

        <button
          onClick={() => setAddStopModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stop City</span>
        </button>
      </div>

      {/* 3. Main Planner Content */}
      {trip.stops?.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif text-stone-900">Your Route is Empty</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add your first city stopover (e.g. Tokyo, Paris, Rome) to start scheduling curated activities.
          </p>
          <button
            onClick={() => setAddStopModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition"
          >
            Add First Destination
          </button>
        </div>
      ) : activeTab === 'stops' ? (
        /* Stops Planner View */
        <div className="space-y-6">
          {trip.stops.map((stop, idx) => (
            <div
              key={stop.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft hover:shadow-premium transition"
            >
              {/* Stop Header Bar */}
              <div className="relative h-44 bg-stone-900 overflow-hidden">
                <img
                  src={stop.city?.imageUrl}
                  alt={stop.city?.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => handleMoveStop(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/80 disabled:opacity-30 transition"
                    title="Move Stop Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveStop(idx, 1)}
                    disabled={idx === trip.stops.length - 1}
                    className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/80 disabled:opacity-30 transition"
                    title="Move Stop Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white transition"
                    title="Delete Stop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                      Stopover #{idx + 1}
                    </span>
                    <h3 className="text-2xl font-bold font-serif">{stop.city?.name}, {stop.city?.country}</h3>
                  </div>

                  <div className="text-right">
                    {stop.arrivalDate ? (
                      <span className="text-xs text-stone-300 font-medium">
                        {new Date(stop.arrivalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {stop.departureDate && ` — ${new Date(stop.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 italic">No dates set</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stop Scheduled Activities */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Scheduled Activities ({stop.activities?.length || 0})
                  </h4>
                  <button
                    onClick={() => handleOpenAddActivity(stop)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {stop.activities?.length === 0 ? (
                  <div className="p-6 bg-stone-50 rounded-2xl text-center text-xs text-stone-400">
                    No experiences assigned yet. Click "Add Activity" to browse curated local tours.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stop.activities.map((sa) => (
                      <div
                        key={sa.id}
                        className="p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-stone-100/80 transition flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {sa.activity?.imageUrl && (
                            <img
                              src={sa.activity.imageUrl}
                              alt={sa.activity.name}
                              className="w-14 h-14 rounded-xl object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-stone-900 font-serif truncate">
                              {sa.activity?.name}
                            </h5>
                            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                              {sa.scheduledTime && (
                                <span className="flex items-center gap-1 font-semibold text-amber-700">
                                  <Clock className="w-3 h-3" />
                                  {sa.scheduledTime}
                                </span>
                              )}
                              <span>•</span>
                              <span className="font-semibold text-emerald-700">
                                {sa.activity?.cost === 0 ? 'Free' : `$${sa.activity?.cost}`}
                              </span>
                            </div>
                            {sa.notes && (
                              <p className="text-[11px] text-stone-500 italic mt-1 truncate">
                                "{sa.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteStopActivity(sa.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition"
                          title="Remove Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'schedule' ? (
        /* Day by Day Structured View */
        <div className="space-y-6">
          {trip.stops.map((stop, sIdx) => (
            <div key={stop.id} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    City #{sIdx + 1}
                  </span>
                  <h3 className="text-xl font-bold font-serif text-stone-900">{stop.city?.name}, {stop.city?.country}</h3>
                </div>
                <span className="text-xs text-stone-500">
                  {stop.activities?.length || 0} scheduled experiences
                </span>
              </div>

              <div className="space-y-3">
                {stop.activities?.map((sa) => (
                  <div key={sa.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 text-xs">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-stone-800">{sa.scheduledTime || 'Flexible Time'}</span>
                      <span className="text-stone-600 font-serif">{sa.activity?.name}</span>
                    </div>
                    <span className="font-bold text-emerald-700">
                      {sa.activity?.cost === 0 ? 'Free' : `$${sa.activity?.cost}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vertical Route Timeline */
        <div className="relative border-l-2 border-amber-500/40 ml-4 md:ml-8 pl-6 md:pl-8 space-y-10 py-4">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-[33px] md:-left-[41px] top-1 w-6 h-6 rounded-full bg-amber-600 border-4 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                {idx + 1}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold font-serif text-stone-900">{stop.city?.name}</h4>
                  <span className="text-xs text-amber-700 font-semibold">{stop.city?.country}</span>
                </div>
                <p className="text-xs text-stone-500 mb-4">{stop.city?.description}</p>
                <div className="flex flex-wrap gap-2">
                  {stop.activities?.map((sa) => (
                    <span key={sa.id} className="px-3 py-1 rounded-xl bg-stone-100 text-[11px] font-medium text-stone-700">
                      🎯 {sa.activity?.name} ({sa.scheduledTime || 'Anytime'})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Stop */}
      <Modal isOpen={addStopModalOpen} onClose={() => setAddStopModalOpen(false)} title="Add Destination to Route">
        <form onSubmit={handleAddStop} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Select City from Catalog *
            </label>
            <select
              required
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600"
            >
              <option value="">-- Choose a Global City --</option>
              {catalogCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} ({c.region})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Arrival Date
              </label>
              <input
                type="date"
                value={stopDates.arrivalDate}
                onChange={(e) => setStopDates({ ...stopDates, arrivalDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                value={stopDates.departureDate}
                onChange={(e) => setStopDates({ ...stopDates, departureDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddStopModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
            >
              Add Stop to Itinerary
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Activity to Stop */}
      <Modal
        isOpen={addActivityModalOpen}
        onClose={() => setAddActivityModalOpen(false)}
        title={`Assign Experience to ${selectedStopForActivity?.city?.name || 'Stop'}`}
      >
        <form onSubmit={handleSaveActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Select Activity *
            </label>
            <select
              required
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600"
            >
              <option value="">-- Choose an Activity --</option>
              {selectedStopForActivity?.city?.activities?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (${a.cost} • {a.durationMinutes}m • {a.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={activityForm.scheduledDate}
                onChange={(e) => setActivityForm({ ...activityForm, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Time Slot
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM or Dusk"
                value={activityForm.scheduledTime}
                onChange={(e) => setActivityForm({ ...activityForm, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Personal Notes / Meeting Spot
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Meet guide at North exit, bring sunscreen..."
              value={activityForm.notes}
              onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddActivityModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
            >
              Assign to Stop
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Trip Metadata */}
      <Modal isOpen={editTripModalOpen} onClose={() => setEditTripModalOpen(false)} title="Update Trip Details">
        <form onSubmit={handleSaveTripMeta} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Trip Title
            </label>
            <input
              type="text"
              required
              value={tripEditData.name}
              onChange={(e) => setTripEditData({ ...tripEditData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={tripEditData.startDate}
                onChange={(e) => setTripEditData({ ...tripEditData, startDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={tripEditData.endDate}
                onChange={(e) => setTripEditData({ ...tripEditData, endDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={tripEditData.description}
              onChange={(e) => setTripEditData({ ...tripEditData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
            ></textarea>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editIsPublic"
              checked={tripEditData.isPublic}
              onChange={(e) => setTripEditData({ ...tripEditData, isPublic: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded border-stone-300"
            />
            <label htmlFor="editIsPublic" className="text-xs text-stone-700 font-medium">
              Public trip (generates shareable web link)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditTripModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
