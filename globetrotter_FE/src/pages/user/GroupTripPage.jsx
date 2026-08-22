import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupAPI, tripAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../utils/clipboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Users,
  Receipt,
  PieChart as PieIcon,
  ArrowLeft,
  Link2,
  Copy,
  Check,
  UserMinus,
  Plus,
  Trash2,
  ArrowRightLeft,
  DollarSign,
  Calendar,
  Tag,
  TrendingUp,
  Utensils,
  Plane,
  Hotel,
  Ticket,
  MoreHorizontal,
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

const CATEGORY_OPTIONS = [
  { value: 'FOOD', label: 'Food & Dining', icon: Utensils, color: '#ca8a04' },
  { value: 'TRAVEL', label: 'Travel & Transport', icon: Plane, color: '#ea580c' },
  { value: 'ACCOMMODATION', label: 'Accommodation', icon: Hotel, color: '#0284c7' },
  { value: 'ACTIVITIES', label: 'Activities & Tours', icon: Ticket, color: '#16a34a' },
  { value: 'OTHER', label: 'Other', icon: MoreHorizontal, color: '#78716c' },
];

const CATEGORY_COLORS = {
  FOOD: '#ca8a04',
  TRAVEL: '#ea580c',
  ACCOMMODATION: '#0284c7',
  ACTIVITIES: '#16a34a',
  OTHER: '#78716c',
};

const TABS = [
  { key: 'members', label: 'Members', icon: Users },
  { key: 'add-expense', label: 'Log Expense', icon: Plus },
  { key: 'expenses', label: 'All Expenses', icon: Receipt },
  { key: 'settlement', label: 'Settlement', icon: ArrowRightLeft },
];

export const GroupTripPage = () => {
  const { id: tripId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [copied, setCopied] = useState(false);
  const [inviteToken, setInviteToken] = useState('');

  const [expenseForm, setExpenseForm] = useState({
    category: 'FOOD',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const isCreator = members.some(
    (m) => m.user?.id === user?.id && m.role === 'CREATOR'
  );

  useEffect(() => {
    fetchAll();
  }, [tripId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tripRes, membersRes, expensesRes, settlementRes] = await Promise.all([
        tripAPI.getById(tripId),
        groupAPI.getMembers(tripId),
        groupAPI.getExpenses(tripId),
        groupAPI.getSettlement(tripId),
      ]);
      setTrip(tripRes.data?.trip || null);
      setMembers(membersRes.data?.members || []);
      setExpenses(expensesRes.data?.expenses || []);
      setSettlement(settlementRes.data?.settlement || null);

      // Get invite link
      try {
        const inviteRes = await groupAPI.getInviteLink(tripId);
        setInviteToken(inviteRes.data?.inviteToken || '');
      } catch (e) {
        // Not enabled yet or no permission
      }
    } catch (err) {
      showError(err.message || 'Failed to load group trip data');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteToken) return;
    const link = `${window.location.origin}/app/group/join/${inviteToken}`;
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      showSuccess('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showError('Failed to copy invite link to clipboard');
    }
  };

  const copyPublicLink = async () => {
    if (trip?.shareSlug) {
      const link = `${window.location.origin}/trips/share/${trip.shareSlug}`;
      const success = await copyToClipboard(link);
      if (success) {
        showSuccess('Public link copied to clipboard!');
      } else {
        showError('Failed to copy public link to clipboard');
      }
    }
  };

  const handleRemoveMember = (memberId, memberName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove ${memberName} from this group trip?`,
      confirmText: 'Remove',
      type: 'danger',
      onConfirm: async () => {
        try {
          await groupAPI.removeMember(tripId, memberId);
          setMembers((prev) => prev.filter((m) => m.user?.id !== memberId));
          showSuccess(`${memberName} removed from the group`);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          showError(err.message || 'Failed to remove member');
        }
      },
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    setSubmittingExpense(true);
    try {
      await groupAPI.addExpense(tripId, expenseForm);
      showSuccess('Expense logged successfully!');
      setExpenseForm({
        category: 'FOOD',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
      // Refresh expenses and settlement
      const [expensesRes, settlementRes] = await Promise.all([
        groupAPI.getExpenses(tripId),
        groupAPI.getSettlement(tripId),
      ]);
      setExpenses(expensesRes.data?.expenses || []);
      setSettlement(settlementRes.data?.settlement || null);
      setActiveTab('expenses');
    } catch (err) {
      showError(err.message || 'Failed to log expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await groupAPI.deleteExpense(tripId, expenseId);
      showSuccess('Expense deleted');
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      // Refresh settlement
      const settlementRes = await groupAPI.getSettlement(tripId);
      setSettlement(settlementRes.data?.settlement || null);
    } catch (err) {
      showError(err.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/app/trips/${tripId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trip Itinerary
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif text-stone-900">
                {trip?.name || 'Group Trip'}
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Group Dashboard • {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Private Invite Link */}
              {inviteToken && (
                <button
                  onClick={copyInviteLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-md shadow-amber-600/20 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Invite Link'}
                </button>
              )}

              {/* Public Link */}
              {trip?.isPublic && trip?.shareSlug && (
                <button
                  onClick={copyPublicLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-semibold transition"
                >
                  <Copy className="w-4 h-4" />
                  Public Link
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 rounded-2xl p-1.5 mb-8 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'members' && (
          <MembersTab
            members={members}
            isCreator={isCreator}
            currentUserId={user?.id}
            onRemove={handleRemoveMember}
            inviteToken={inviteToken}
            onCopyInvite={copyInviteLink}
            copied={copied}
          />
        )}

        {activeTab === 'add-expense' && (
          <AddExpenseTab
            form={expenseForm}
            onChange={setExpenseForm}
            onSubmit={handleAddExpense}
            submitting={submittingExpense}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            expenses={expenses}
            currentUserId={user?.id}
            isCreator={isCreator}
            onDelete={handleDeleteExpense}
          />
        )}

        {activeTab === 'settlement' && (
          <SettlementTab settlement={settlement} />
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
};

/* ==================== MEMBERS TAB ==================== */
const MembersTab = ({ members, isCreator, currentUserId, onRemove, inviteToken, onCopyInvite, copied }) => (
  <div className="space-y-4">
    {inviteToken && (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900 mb-1">Private Invite Link</h3>
            <p className="text-xs text-amber-700 mb-3">
              Share this link with friends & family to invite them to this group trip. They'll need a GlobeTrotter account to join.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-white rounded-lg text-xs text-stone-600 border border-amber-200 truncate">
                {`${window.location.origin}/app/group/join/${inviteToken}`}
              </code>
              <button
                onClick={onCopyInvite}
                className="px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Group Members ({members.length})</h3>
      </div>
      <div className="divide-y divide-stone-100">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between px-5 py-4 hover:bg-stone-50/50 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {member.user?.photoUrl ? (
                  <img src={member.user.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  member.user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  {member.user?.name}
                  {member.user?.id === currentUserId && (
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase">You</span>
                  )}
                </p>
                <p className="text-xs text-stone-500">{member.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                member.role === 'CREATOR'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}>
                {member.role}
              </span>
              {isCreator && member.user?.id !== currentUserId && (
                <button
                  onClick={() => onRemove(member.user?.id, member.user?.name)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition"
                  title="Remove member"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ==================== ADD EXPENSE TAB ==================== */
const AddExpenseTab = ({ form, onChange, onSubmit, submitting }) => (
  <div className="max-w-lg mx-auto">
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6">
      <h3 className="text-lg font-bold font-serif text-stone-900 mb-6">Log a New Expense</h3>
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const Icon = cat.icon;
              const selected = form.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onChange({ ...form, category: cat.value })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
                    selected
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Amount (USD) *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => onChange({ ...form, amount: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Airport taxi, Hotel room night, Dinner at..."
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => onChange({ ...form, expenseDate: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition disabled:opacity-50"
        >
          {submitting ? 'Logging...' : 'Log Expense'}
        </button>
      </form>
    </div>
  </div>
);

/* ==================== ALL EXPENSES TAB ==================== */
const ExpensesTab = ({ expenses, currentUserId, isCreator, onDelete }) => {
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filtered = filterCategory === 'ALL'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
            filterCategory === 'ALL' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All
        </button>
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterCategory === cat.value ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-500">No expenses logged yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-stone-100">
            {filtered.map((expense) => {
              const cat = CATEGORY_OPTIONS.find((c) => c.value === expense.category);
              const Icon = cat?.icon || Tag;
              const canDelete = expense.paidByUserId === currentUserId || isCreator;

              return (
                <div key={expense.id} className="flex items-center justify-between px-5 py-4 hover:bg-stone-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat?.color || '#78716c'}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat?.color || '#78716c' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {expense.description || cat?.label || expense.category}
                      </p>
                      <p className="text-xs text-stone-500">
                        Paid by <span className="font-medium text-stone-700">{expense.paidBy?.name || 'Unknown'}</span>
                        {' • '}
                        {new Date(expense.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-stone-900">${parseFloat(expense.amount).toFixed(2)}</span>
                    {canDelete && (
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================== SETTLEMENT TAB ==================== */
const SettlementTab = ({ settlement }) => {
  if (!settlement || settlement.memberCount === 0) {
    return (
      <div className="text-center py-16">
        <ArrowRightLeft className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <p className="text-sm text-stone-500">No settlement data available yet</p>
      </div>
    );
  }

  const barData = settlement.perPerson.map((p) => ({
    name: p.name?.split(' ')[0] || 'Unknown',
    paid: p.totalPaid,
    fairShare: p.fairShare,
  }));

  const pieData = settlement.byCategory.map((c) => ({
    name: CATEGORY_OPTIONS.find((o) => o.value === c.category)?.label || c.category,
    value: c.amount,
  }));

  const pieColors = settlement.byCategory.map((c) => CATEGORY_COLORS[c.category] || '#78716c');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Spent</p>
          </div>
          <p className="text-2xl font-bold text-stone-900">${settlement.totalSpent.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Fair Share Each</p>
          </div>
          <p className="text-2xl font-bold text-stone-900">${settlement.fairShare.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Group Size</p>
          </div>
          <p className="text-2xl font-bold text-stone-900">{settlement.memberCount} people</p>
        </div>
      </div>

      {/* Transfers (Who Owes Whom) */}
      {settlement.transfers.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Settlement Transfers</h3>
            <p className="text-xs text-stone-500 mt-0.5">Minimum transfers needed to settle all debts</p>
          </div>
          <div className="divide-y divide-stone-100">
            {settlement.transfers.map((t, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
                    {t.from.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-stone-700">{t.from.name}</span>
                  <ArrowRightLeft className="w-4 h-4 text-stone-400 mx-1" />
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                    {t.to.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-stone-700">{t.to.name}</span>
                </div>
                <span className="text-sm font-bold text-amber-600">${t.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlement.transfers.length === 0 && settlement.totalSpent > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-emerald-800">All settled! Everyone has paid their fair share.</p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Person Bar Chart */}
        {barData.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Per Person Spending</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="paid" name="Paid" fill="#d97706" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fairShare" name="Fair Share" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Per Person Detail */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Individual Breakdown</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {settlement.perPerson.map((p) => (
            <div key={p.userId} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {p.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{p.name}</p>
                  <p className="text-xs text-stone-500">Paid ${p.totalPaid.toFixed(2)} / Fair share ${p.fairShare.toFixed(2)}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${
                p.balance > 0 ? 'text-emerald-600' : p.balance < 0 ? 'text-rose-600' : 'text-stone-500'
              }`}>
                {p.balance > 0 ? '+' : ''}${p.balance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
