import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Compass,
  MapPin,
  Sparkles,
  DollarSign,
  Mail,
  TrendingUp,
  ArrowUpRight,
  Shield,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Compiling executive travel intelligence..." />;

  const { metrics, topCities, recentTrips, recentUsers, monthlyTrends } = stats || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Platform Command Center
          </span>
          <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
            GlobeTrotter Analytics & Operations
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <CheckCircle className="w-4 h-4" />
          <span>System Healthy • DB Connected</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{metrics?.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Trips Planned</p>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{metrics?.totalTrips || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Master Cities</p>
          <p className="text-2xl font-bold font-serif text-amber-700 mt-1">{metrics?.totalCities || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Experiences</p>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{metrics?.totalActivities || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Gross Revenue</p>
          <p className="text-2xl font-bold font-serif text-emerald-700 mt-1">${metrics?.totalRevenue || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Unread Inquiries</p>
          <p className="text-2xl font-bold font-serif text-rose-600 mt-1">{metrics?.unreadMessages || 0}</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trips Area Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900">Trip Creation Velocity</h3>
              <p className="text-xs text-stone-500">Monthly new expeditions created by travelers</p>
            </div>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends || []}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#a8a29e" fontSize={11} />
                <YAxis stroke="#a8a29e" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="trips" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Destinations Bar Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900">Top Catalog Destinations</h3>
              <p className="text-xs text-stone-500">Popularity ranking scores across global cities</p>
            </div>
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCities || []}>
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} />
                <YAxis stroke="#a8a29e" fontSize={11} />
                <Tooltip />
                <Bar dataKey="popularityScore" fill="#ae8664" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Trips & Users Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trips */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
          <h3 className="text-lg font-bold font-serif text-stone-900">Latest Expeditions Planned</h3>
          <div className="divide-y divide-stone-100 text-xs">
            {recentTrips?.map((trip) => (
              <div key={trip.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900 font-serif">{trip.name}</p>
                  <p className="text-stone-500 text-[11px]">
                    Created by {trip.user?.name || 'Explorer'} • {trip.stops?.length || 0} stops
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {new Date(trip.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
          <h3 className="text-lg font-bold font-serif text-stone-900">New Traveler Registrations</h3>
          <div className="divide-y divide-stone-100 text-xs">
            {recentUsers?.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">{u.name}</p>
                  <p className="text-stone-500 text-[11px]">{u.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
