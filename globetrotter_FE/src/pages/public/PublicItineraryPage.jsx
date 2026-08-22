import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { tripAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Compass,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Share2,
  Copy,
  Check,
  ArrowRight,
  User,
  Heart,
  Globe,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PublicItineraryPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        const res = await tripAPI.getPublic(slug);
        if (res.data?.trip) {
          setTrip(res.data.trip);
        }
      } catch (err) {
        setError(err.message || 'Shared trip not found or is set to private.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicTrip();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCloneTrip = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/trips/share/${slug}` } } });
      return;
    }

    setCloning(true);
    try {
      const res = await tripAPI.copy(trip.id);
      if (res.data?.trip) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
        alert('✨ Trip cloned into your account! Redirecting to your itinerary builder...');
        navigate(`/app/trips/${res.data.trip.id}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to clone trip');
    } finally {
      setCloning(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading shared expedition..." />;

  if (error || !trip) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-stone-900 mb-2">Itinerary Unavailable</h2>
        <p className="text-stone-500 text-sm max-w-md mb-6">{error || 'This journey is not accessible.'}</p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition"
        >
          Return to GlobeTrotter Home
        </Link>
      </div>
    );
  }

  const estimatedBudgetTotal = trip.budgets?.reduce((acc, b) => acc + (b.estimatedAmount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#fbf9f6] pb-24">
      <Helmet>
        <title>{`${trip.name} — GlobeTrotter Itinerary`}</title>
        <meta name="description" content={trip.description || `Shared travel plan for ${trip.name}`} />
        <meta property="og:title" content={`${trip.name} — GlobeTrotter`} />
        <meta property="og:image" content={trip.coverPhotoUrl} />
      </Helmet>

      {/* Hero Banner */}
      <div className="relative h-[55vh] min-h-[380px] bg-stone-900 text-white flex items-end">
        <img
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80'}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-600/90 text-white backdrop-blur-md">
                Public Itinerary
              </span>
              {trip.stops?.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-stone-200 backdrop-blur-md">
                  {trip.stops.length} Destined {trip.stops.length === 1 ? 'City' : 'Cities'}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-serif leading-tight drop-shadow-md">
              {trip.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-stone-300 font-medium">
              {trip.user && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Curated by {trip.user.name}</span>
                </div>
              )}
              {trip.startDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>
                    {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md transition flex items-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Link Copied!' : 'Share Trip'}
            </button>

            <button
              onClick={handleCloneTrip}
              disabled={cloning}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              {cloning ? 'Copying...' : 'Copy to My Trips'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Description & Day/Stop Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {trip.description && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
                <h3 className="text-lg font-bold font-serif text-stone-900 mb-3">Expedition Overview</h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {trip.description}
                </p>
              </div>
            )}

            {/* Stops & Daily Schedule */}
            <div>
              <h3 className="text-2xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-600" />
                Destinations & Daily Schedule
              </h3>

              {trip.stops?.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center text-stone-500 text-sm">
                  No stops listed on this journey yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {trip.stops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-soft"
                    >
                      {/* Stop City Header */}
                      <div className="relative h-44 overflow-hidden bg-stone-900">
                        <img
                          src={stop.city?.imageUrl}
                          alt={stop.city?.name}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent"></div>

                        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                              Stop {idx + 1}
                            </span>
                            <h4 className="text-2xl font-bold font-serif">{stop.city?.name}, {stop.city?.country}</h4>
                          </div>
                          {stop.arrivalDate && (
                            <span className="text-xs text-stone-300 font-medium">
                              {new Date(stop.arrivalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {stop.departureDate && ` — ${new Date(stop.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scheduled Activities */}
                      <div className="p-6">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
                          Scheduled Experiences ({stop.activities?.length || 0})
                        </h5>

                        {stop.activities?.length === 0 ? (
                          <p className="text-xs text-stone-400 italic">Free exploration & leisure.</p>
                        ) : (
                          <div className="space-y-3">
                            {stop.activities.map((sa) => (
                              <div
                                key={sa.id}
                                className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-stone-100/70 transition"
                              >
                                {sa.activity?.imageUrl && (
                                  <img
                                    src={sa.activity.imageUrl}
                                    alt={sa.activity.name}
                                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h6 className="text-sm font-bold text-stone-900 font-serif truncate">
                                      {sa.activity?.name}
                                    </h6>
                                    {sa.activity?.cost !== undefined && (
                                      <span className="text-xs font-bold text-emerald-700 shrink-0">
                                        {sa.activity.cost === 0 ? 'Free' : `$${sa.activity.cost}`}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1">
                                    {sa.scheduledTime && (
                                      <span className="flex items-center gap-1 font-semibold text-amber-700">
                                        <Clock className="w-3 h-3" />
                                        {sa.scheduledTime}
                                      </span>
                                    )}
                                    {sa.activity?.durationMinutes && (
                                      <span>{sa.activity.durationMinutes} mins</span>
                                    )}
                                    {sa.activity?.category && (
                                      <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-medium">
                                        {sa.activity.category}
                                      </span>
                                    )}
                                  </div>

                                  {sa.notes && (
                                    <p className="text-xs text-stone-600 mt-2 bg-amber-50/70 p-2 rounded-lg border border-amber-100 italic">
                                      "{sa.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Budget & Quick Actions */}
          <div className="space-y-6">
            {/* Copy CTA Card */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
              <h4 className="text-xl font-bold font-serif mb-2">Love This Itinerary?</h4>
              <p className="text-xs text-amber-100 leading-relaxed mb-6">
                Copy this complete journey to your GlobeTrotter planner. Customize dates, reorder destinations, or swap in your own activities!
              </p>
              <button
                onClick={handleCloneTrip}
                disabled={cloning}
                className="w-full py-3 rounded-xl bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-amber-600" />
                {cloning ? 'Saving to Your Account...' : 'Clone Journey'}
              </button>
            </div>

            {/* Estimated Budget Summary */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft">
              <h4 className="text-base font-bold font-serif text-stone-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                Estimated Travel Budget
              </h4>

              {trip.budgets?.length === 0 ? (
                <p className="text-xs text-stone-400">No budget recorded for this trip.</p>
              ) : (
                <div className="space-y-3">
                  {trip.budgets.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
                      <span className="font-semibold text-stone-700 capitalize">{b.category?.toLowerCase()}</span>
                      <span className="font-bold text-stone-900">${b.estimatedAmount}</span>
                    </div>
                  ))}
                  <div className="pt-3 flex items-center justify-between font-bold text-sm text-stone-900">
                    <span>Total Estimated</span>
                    <span className="text-amber-700 text-base">${estimatedBudgetTotal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
