import React, { useState, useEffect } from 'react';
import { catalogAPI, adminAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Sparkles,
  Search,
  Star,
  Clock,
  DollarSign,
} from 'lucide-react';

export const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('cities'); // 'cities' or 'activities'
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityForm, setCityForm] = useState({
    name: '',
    country: '',
    region: 'Europe',
    costIndex: 3,
    popularityScore: 90,
    imageUrl: '',
    description: '',
  });

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityForm, setActivityForm] = useState({
    cityId: '',
    name: '',
    category: 'Sightseeing',
    cost: 45,
    durationMinutes: 120,
    imageUrl: '',
    description: '',
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [citiesRes, activitiesRes] = await Promise.all([
        catalogAPI.getCities({}),
        catalogAPI.getActivities({}),
      ]);
      if (citiesRes.data?.cities) setCities(citiesRes.data.cities);
      if (activitiesRes.data?.activities) setActivities(activitiesRes.data.activities);
    } catch (err) {
      console.error('Failed to load content', err);
    } finally {
      setLoading(false);
    }
  };

  // Open City Modal for Create / Edit
  const handleOpenCityModal = (city = null) => {
    if (city) {
      setEditingCity(city);
      setCityForm({
        name: city.name,
        country: city.country,
        region: city.region,
        costIndex: city.costIndex,
        popularityScore: city.popularityScore,
        imageUrl: city.imageUrl,
        description: city.description,
      });
    } else {
      setEditingCity(null);
      setCityForm({
        name: '',
        country: '',
        region: 'Europe',
        costIndex: 3,
        popularityScore: 90,
        imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        description: '',
      });
    }
    setCityModalOpen(true);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    try {
      if (editingCity) {
        await adminAPI.updateCity(editingCity.id, cityForm);
      } else {
        await adminAPI.createCity(cityForm);
      }
      setCityModalOpen(false);
      fetchContent();
    } catch (err) {
      alert(err.message || 'Failed to save city');
    }
  };

  const handleDeleteCity = async (city) => {
    if (!window.confirm(`Delete "${city.name}" and all its activities?`)) return;
    try {
      await adminAPI.deleteCity(city.id);
      fetchContent();
    } catch (err) {
      alert(err.message || 'Failed to delete city');
    }
  };

  // Open Activity Modal for Create / Edit
  const handleOpenActivityModal = (act = null) => {
    if (act) {
      setEditingActivity(act);
      setActivityForm({
        cityId: act.cityId,
        name: act.name,
        category: act.category,
        cost: act.cost,
        durationMinutes: act.durationMinutes,
        imageUrl: act.imageUrl,
        description: act.description,
      });
    } else {
      setEditingActivity(null);
      setActivityForm({
        cityId: cities[0]?.id || '',
        name: '',
        category: 'Sightseeing',
        cost: 45,
        durationMinutes: 120,
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        description: '',
      });
    }
    setActivityModalOpen(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await adminAPI.updateActivity(editingActivity.id, activityForm);
      } else {
        await adminAPI.createActivity(activityForm);
      }
      setActivityModalOpen(false);
      fetchContent();
    } catch (err) {
      alert(err.message || 'Failed to save activity');
    }
  };

  const handleDeleteActivity = async (act) => {
    if (!window.confirm(`Delete activity "${act.name}"?`)) return;
    try {
      await adminAPI.deleteActivity(act.id);
      fetchContent();
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Catalog Management
          </span>
          <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
            Master Destinations & Experiences
          </h1>
        </div>

        <button
          onClick={() => (activeTab === 'cities' ? handleOpenCityModal() : handleOpenActivityModal())}
          className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'cities' ? 'Add New City' : 'Add New Activity'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('cities')}
          className={`pb-2 text-sm font-bold transition border-b-2 ${
            activeTab === 'cities' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Cities Catalog ({cities.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-2 text-sm font-bold transition border-b-2 ${
            activeTab === 'activities' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Activities Catalog ({activities.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching catalog inventory..." />
      ) : activeTab === 'cities' ? (
        /* Cities Table */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">City</th>
                  <th className="py-3.5 px-4">Region</th>
                  <th className="py-3.5 px-4">Cost Index</th>
                  <th className="py-3.5 px-4">Popularity</th>
                  <th className="py-3.5 px-4">Activities</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cities.map((city) => (
                  <tr key={city.id} className="hover:bg-stone-50 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-stone-900 text-sm font-serif">{city.name}</p>
                        <p className="text-[11px] text-stone-500">{city.country}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-stone-700">{city.region}</td>

                    <td className="py-4 px-4 font-bold text-amber-600">
                      {'★'.repeat(city.costIndex)}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-stone-800">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {city.popularityScore}%
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-stone-700">
                      {city._count?.activities || 0}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenCityModal(city)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                        title="Edit City"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCity(city)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Delete City"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Activities Table */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Experience</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Cost</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-stone-50 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={act.imageUrl}
                        alt={act.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-stone-900 text-sm font-serif">{act.name}</p>
                        <p className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">{act.description}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-stone-800">
                      {act.city?.name || 'World'}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                        {act.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-emerald-700">
                      {act.cost === 0 ? 'Free' : `$${act.cost}`}
                    </td>

                    <td className="py-4 px-4 text-stone-600 font-medium">
                      {act.durationMinutes} mins
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenActivityModal(act)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                        title="Edit Activity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(act)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit City */}
      <Modal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        title={editingCity ? `Edit ${editingCity.name}` : 'Add New Master City'}
      >
        <form onSubmit={handleSaveCity} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                City Name *
              </label>
              <input
                type="text"
                required
                value={cityForm.name}
                onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={cityForm.country}
                onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Region
              </label>
              <select
                value={cityForm.region}
                onChange={(e) => setCityForm({ ...cityForm, region: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              >
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="Africa">Africa</option>
                <option value="South America">South America</option>
                <option value="Middle East">Middle East</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Cost Index (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={cityForm.costIndex}
                onChange={(e) => setCityForm({ ...cityForm, costIndex: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Popularity (1-100)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={cityForm.popularityScore}
                onChange={(e) => setCityForm({ ...cityForm, popularityScore: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Cover Image URL *
            </label>
            <input
              type="url"
              required
              value={cityForm.imageUrl}
              onChange={(e) => setCityForm({ ...cityForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Editorial Description *
            </label>
            <textarea
              rows={3}
              required
              value={cityForm.description}
              onChange={(e) => setCityForm({ ...cityForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCityModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
            >
              Save City
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create/Edit Activity */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title={editingActivity ? `Edit ${editingActivity.name}` : 'Add Master Activity'}
      >
        <form onSubmit={handleSaveActivity} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Belongs to City *
              </label>
              <select
                required
                value={activityForm.cityId}
                onChange={(e) => setActivityForm({ ...activityForm, cityId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Category
              </label>
              <select
                value={activityForm.category}
                onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Adventure">Adventure</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="Nature">Nature</option>
                <option value="Culture">Culture</option>
                <option value="Nightlife">Nightlife</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              value={activityForm.name}
              onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Cost ($)
              </label>
              <input
                type="number"
                step="any"
                value={activityForm.cost}
                onChange={(e) => setActivityForm({ ...activityForm, cost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                value={activityForm.durationMinutes}
                onChange={(e) => setActivityForm({ ...activityForm, durationMinutes: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Image URL *
            </label>
            <input
              type="url"
              required
              value={activityForm.imageUrl}
              onChange={(e) => setActivityForm({ ...activityForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={activityForm.description}
              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActivityModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
            >
              Save Experience
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
