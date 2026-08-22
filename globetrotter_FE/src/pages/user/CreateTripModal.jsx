import React, { useState, useMemo } from 'react';
import { tripAPI } from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { Compass, Calendar, Image as ImageIcon, Sparkles, Globe, DollarSign, Users, Clock, Calculator } from 'lucide-react';
import confetti from 'canvas-confetti';

const sampleCoverPhotos = [
  { label: 'Tokyo Shrines', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kyoto Bamboo', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Santorini Caldera', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Banff Rockies', url: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Parisian Lights', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Bali Tropical', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
];

export const CreateTripModal = ({ isOpen, onClose, onTripCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    travelerCount: 1,
    description: '',
    coverPhotoUrl: sampleCoverPhotos[0].url,
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate Duration in Days & Nights
  const durationInfo = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(0, days - 1);

    return { days, nights };
  }, [formData.startDate, formData.endDate]);

  // Calculate Per-Person Budget Split
  const perPersonSplit = useMemo(() => {
    const budget = parseFloat(formData.estimatedBudget);
    const count = parseInt(formData.travelerCount, 10) || 1;
    if (isNaN(budget) || budget <= 0 || count <= 0) return null;

    const share = (budget / count).toFixed(2);
    return { budget, count, share };
  }, [formData.estimatedBudget, formData.travelerCount]);

  // Auto-calculate End Date if user specifies duration days from Start Date
  const handleDurationDaysChange = (daysVal) => {
    const days = parseInt(daysVal, 10);
    if (isNaN(days) || days <= 0 || !formData.startDate) return;

    const start = new Date(formData.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));
    const formattedEnd = end.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, endDate: formattedEnd }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Trip name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await tripAPI.create(formData);
      if (res.data?.trip) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}
        onTripCreated(res.data.trip);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan a New Journey" maxWidth="max-w-xl">
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Trip Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            Trip Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 7-Day Grand European Rail Adventure"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
          />
        </div>

        {/* Dates & Duration Section */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Journey Dates & Duration</span>
            </span>

            {durationInfo && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 border border-amber-300">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>{durationInfo.days} Days / {durationInfo.nights} Nights</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
              />
            </div>
          </div>

          {/* Quick Duration Presets */}
          {formData.startDate && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[9px] text-stone-500 font-semibold">Quick Duration:</span>
              {[3, 5, 7, 10, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleDurationDaysChange(days)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-stone-700 text-[9px] font-bold border border-stone-200 transition"
                >
                  {days}D
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Budget & Per Person Split Section */}
        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Budget & Cost Split</span>
            </span>

            {perPersonSplit && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                <Calculator className="w-3 h-3 text-emerald-700" />
                <span>${perPersonSplit.share} / person</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-stone-700 mb-0.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>Total Estimated Budget ($)</span>
              </label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 2400"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-700 mb-0.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-600" />
                <span>Travelers / Split Count</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.travelerCount}
                onChange={(e) => setFormData({ ...formData, travelerCount: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>
          </div>

          {perPersonSplit && (
            <div className="p-2 rounded-lg bg-white border border-emerald-200/90 text-xs text-stone-700 flex items-center justify-between gap-2 shadow-xs">
              <span className="text-[11px] text-stone-600 font-medium">
                Split Breakdown: <strong className="text-emerald-950">${perPersonSplit.budget.toLocaleString()} total</strong> ÷ <strong className="text-emerald-950">{perPersonSplit.count} traveler(s)</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-xs tracking-wide shrink-0">
                ${perPersonSplit.share} / person
              </span>
            </div>
          )}
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            Trip Description / Notes
          </label>
          <textarea
            rows={2}
            placeholder="Key highlights, travel companions, or goals for this expedition..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          ></textarea>
        </div>

        {/* Cover Photo Picker */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            Select Cover Artwork
          </label>
          <div className="grid grid-cols-3 gap-2 mb-1.5">
            {sampleCoverPhotos.map((photo, i) => (
              <div
                key={i}
                onClick={() => setFormData({ ...formData, coverPhotoUrl: photo.url })}
                className={`relative h-11 rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                  formData.coverPhotoUrl === photo.url ? 'border-amber-600 ring-2 ring-amber-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 py-0.5 rounded truncate max-w-[90%] font-medium">
                  {photo.label}
                </span>
              </div>
            ))}
          </div>
        </div>

       

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Creating Trip...' : 'Create & Open Builder'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
