import React, { useState } from 'react';
import { tripAPI } from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { Compass, Calendar, Image as ImageIcon, Sparkles, Globe } from 'lucide-react';
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
    description: '',
    coverPhotoUrl: sampleCoverPhotos[0].url,
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            Trip Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 10-Day Grand European Rail Adventure"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
            Trip Description / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Key highlights, travel companions, or goals for this expedition..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          ></textarea>
        </div>

        {/* Cover Photo Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
            Select Cover Artwork
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {sampleCoverPhotos.map((photo, i) => (
              <div
                key={i}
                onClick={() => setFormData({ ...formData, coverPhotoUrl: photo.url })}
                className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                  formData.coverPhotoUrl === photo.url ? 'border-amber-600 ring-2 ring-amber-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs truncate max-w-[90%]">
                  {photo.label}
                </span>
              </div>
            ))}
          </div>
          <input
            type="url"
            placeholder="Or paste custom image URL..."
            value={formData.coverPhotoUrl}
            onChange={(e) => setFormData({ ...formData, coverPhotoUrl: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-700 focus:outline-none focus:border-amber-600"
          />
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
          />
          <label htmlFor="isPublic" className="text-xs text-stone-700 font-medium">
            Make this itinerary publicly viewable & shareable with friends
          </label>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
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
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Creating Trip...' : 'Create & Open Builder'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
