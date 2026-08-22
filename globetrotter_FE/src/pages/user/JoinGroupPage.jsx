import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export const JoinGroupPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [tripInfo, setTripInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await groupAPI.validateInvite(token);
      if (res.data?.trip) {
        setTripInfo(res.data.trip);
      }
    } catch (err) {
      setError(err.message || 'This invite link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`/app/group/join/${token}`);
      navigate(`/signup?redirect=${returnUrl}`, { state: { from: { pathname: `/app/group/join/${token}` } } });
      return;
    }

    setJoining(true);
    try {
      const res = await groupAPI.joinGroup(token);
      const tripId = res.data?.tripId;
      setJoined(true);
      showSuccess('Successfully joined the group trip!');
      setTimeout(() => {
        navigate(`/app/trips/${tripId}/group`);
      }, 1500);
    } catch (err) {
      if (err.message?.includes('already a member')) {
        showSuccess('You are already a member of this trip!');
        if (tripInfo?.id) {
          setTimeout(() => navigate(`/app/trips/${tripInfo.id}/group`), 1000);
        }
      } else {
        showError(err.message || 'Failed to join group trip');
      }
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6] px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 mb-3">Invalid Invite Link</h1>
          <p className="text-sm text-stone-600 mb-6">{error}</p>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6] px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 mb-3">You're In!</h1>
          <p className="text-sm text-stone-600">Redirecting to the group trip dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6] px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Trip Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden">
          {/* Cover Image */}
          {tripInfo?.coverPhotoUrl && (
            <div className="h-48 overflow-hidden relative">
              <img
                src={tripInfo.coverPhotoUrl}
                alt={tripInfo.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/30">
                  Group Trip Invitation
                </span>
              </div>
            </div>
          )}

          <div className="p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold font-serif text-stone-900 mb-2">{tripInfo?.name}</h1>
              {tripInfo?.description && (
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">{tripInfo.description}</p>
              )}
            </div>

            {/* Trip Details */}
            <div className="flex flex-wrap gap-4">
              {tripInfo?.startDate && (
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  {new Date(tripInfo.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {tripInfo.endDate && ` - ${new Date(tripInfo.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <Users className="w-4 h-4 text-amber-500" />
                {tripInfo?.memberCount || 0} member{(tripInfo?.memberCount || 0) !== 1 ? 's' : ''} already joined
              </div>
            </div>

            {/* Creator Info */}
            {tripInfo?.creator && (
              <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {tripInfo.creator.photoUrl ? (
                    <img src={tripInfo.creator.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    tripInfo.creator.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Created by {tripInfo.creator.name}</p>
                  <p className="text-[10px] text-stone-500">Trip organizer</p>
                </div>
              </div>
            )}

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xl shadow-amber-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {joining ? (
                'Joining...'
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Join This Trip as {user?.name || 'Member'}
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-stone-400">
              By joining, you'll be able to view the itinerary and log shared expenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
