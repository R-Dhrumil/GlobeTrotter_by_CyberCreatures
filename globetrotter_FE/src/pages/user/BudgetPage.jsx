import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tripAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  DollarSign,
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Save,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

const CATEGORY_COLORS = {
  TRANSPORT: '#ea580c',
  STAY: '#0284c7',
  ACTIVITIES: '#16a34a',
  MEALS: '#ca8a04',
  OTHER: '#78716c',
};

const CATEGORIES = ['TRANSPORT', 'STAY', 'ACTIVITIES', 'MEALS', 'OTHER'];

export const BudgetPage = () => {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);

  // Form to update/add category
  const [activeCategory, setActiveCategory] = useState('TRANSPORT');
  const [categoryEstimated, setCategoryEstimated] = useState('');
  const [categoryActual, setCategoryActual] = useState('');
  const [categoryNotes, setCategoryNotes] = useState('');

  useEffect(() => {
    loadTripAndBudget();
  }, [id]);

  const loadTripAndBudget = async () => {
    try {
      const [tripRes, budgetRes] = await Promise.all([
        tripAPI.getById(id),
        tripAPI.getBudget(id),
      ]);
      if (tripRes.data?.trip) setTrip(tripRes.data.trip);
      if (budgetRes.data) setBudgetData(budgetRes.data);
    } catch (err) {
      console.error('Failed to load trip budget', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategoryBudget = async (e) => {
    e.preventDefault();
    setSavingCategory(true);

    try {
      await tripAPI.upsertBudget(id, {
        category: activeCategory,
        estimatedAmount: categoryEstimated ? parseFloat(categoryEstimated) : 0,
        actualAmount: categoryActual ? parseFloat(categoryActual) : 0,
        notes: categoryNotes,
      });
      alert('Budget saved!');
      loadTripAndBudget();
    } catch (err) {
      alert(err.message || 'Failed to save budget');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Delete this budget entry?')) return;
    try {
      await tripAPI.deleteBudget(budgetId);
      loadTripAndBudget();
    } catch (err) {
      alert(err.message || 'Failed to delete entry');
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Calculating trip budget analytics..." />;

  if (!trip || !budgetData) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-600 font-semibold">Budget data unavailable</p>
        <Link to="/app/my-trips" className="mt-4 inline-block text-amber-600 text-sm font-bold">
          Return to My Trips
        </Link>
      </div>
    );
  }

  const { budgets, summary } = budgetData;

  // Chart data for Pie
  const pieData = (budgets || []).map((b) => ({
    name: b.category,
    value: b.actualAmount > 0 ? b.actualAmount : b.estimatedAmount,
  }));

  // Chart data for Comparison Bar
  const barData = (budgets || []).map((b) => ({
    name: b.category,
    Estimated: b.estimatedAmount,
    Actual: b.actualAmount,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to={`/app/trips/${trip.id}`}
            className="p-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition shadow-soft"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              Trip Budget & Cost Intelligence
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Financial breakdown for <strong className="text-stone-800 font-serif">{trip.name}</strong>
            </p>
          </div>
        </div>

        <Link
          to={`/app/trips/${trip.id}`}
          className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-amber-600 transition self-start sm:self-auto"
        >
          Open Itinerary Builder
        </Link>
      </div>

      {/* Over-Budget Alert Banner */}
      {summary?.isOverBudget && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-800 flex items-start gap-4 shadow-soft animate-fade-in">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif">Over-Budget Warning</h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Your actual expenses (${summary.actualTotal}) have exceeded your total estimated budget (${summary.estimatedTotal}) by{' '}
              <strong>{summary.overBudgetPercent}%</strong> (${summary.actualTotal - summary.estimatedTotal}). Consider adjusting your category allocations.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Estimated Budget</p>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">${summary?.estimatedTotal || 0}</p>
          <p className="text-[11px] text-stone-500 mt-1">Planned threshold</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Actual Spent</p>
          <p className={`text-2xl sm:text-3xl font-bold font-serif mt-1 ${summary?.isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
            ${summary?.actualTotal || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Logged expenses</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Avg Cost / Day</p>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
            ${summary?.averageCostPerDay || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Across {summary?.dayCount || 1} expedition days</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Activities Value</p>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-amber-700 mt-1">
            ${summary?.activityEstimatedTotal || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">From scheduled catalog stops</p>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie / Donut Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
          <h3 className="text-lg font-bold font-serif text-stone-900 mb-2 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-amber-600" />
            Spending Distribution
          </h3>
          <p className="text-xs text-stone-500 mb-6">Proportion of spend allocated per category</p>

          <div className="h-64">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                No budget data entered yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ea580c'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `$${val}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Estimated vs Actual Comparison Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
          <h3 className="text-lg font-bold font-serif text-stone-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Estimated vs. Actual Costs
          </h3>
          <p className="text-xs text-stone-500 mb-6">Compare what you planned against what was paid</p>

          <div className="h-64">
            {barData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                No budget data entered yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} />
                  <YAxis stroke="#a8a29e" fontSize={11} />
                  <Tooltip formatter={(val) => `$${val}`} />
                  <Legend />
                  <Bar dataKey="Estimated" fill="#d7c1a9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category Adjustment Form & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form: Add/Edit Category Budget */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
          <h3 className="text-lg font-bold font-serif text-stone-900 mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-amber-600" />
            Adjust Category Budget
          </h3>

          <form onSubmit={handleSaveCategoryBudget} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Category
              </label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Estimated Amount ($)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 800"
                value={categoryEstimated}
                onChange={(e) => setCategoryEstimated(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Actual Spent ($)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 740"
                value={categoryActual}
                onChange={(e) => setCategoryActual(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                placeholder="Details on flights, hotels, or tour bookings..."
                value={categoryNotes}
                onChange={(e) => setCategoryNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={savingCategory}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {savingCategory ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </div>

        {/* Budget Entries Table */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
          <h3 className="text-lg font-bold font-serif text-stone-900 mb-4">
            Category Breakdown Records ({budgets?.length || 0})
          </h3>

          {budgets?.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No categories configured yet. Fill out the form on the left to add your first budget bucket!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Estimated</th>
                    <th className="pb-3">Actual</th>
                    <th className="pb-3">Variance</th>
                    <th className="pb-3">Notes</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {budgets.map((b) => {
                    const diff = b.actualAmount - b.estimatedAmount;
                    return (
                      <tr key={b.id} className="hover:bg-stone-50">
                        <td className="py-3 font-bold text-stone-900 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[b.category] || '#ea580c' }}
                          ></span>
                          {b.category}
                        </td>
                        <td className="py-3 font-semibold text-stone-700">${b.estimatedAmount}</td>
                        <td className="py-3 font-semibold text-stone-900">${b.actualAmount}</td>
                        <td className="py-3 font-bold">
                          {diff > 0 ? (
                            <span className="text-rose-600">+${diff} (Over)</span>
                          ) : diff < 0 ? (
                            <span className="text-emerald-700">-${Math.abs(diff)} (Saved)</span>
                          ) : (
                            <span className="text-stone-400">$0</span>
                          )}
                        </td>
                        <td className="py-3 text-stone-500 max-w-xs truncate">{b.notes || '—'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteBudget(b.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
