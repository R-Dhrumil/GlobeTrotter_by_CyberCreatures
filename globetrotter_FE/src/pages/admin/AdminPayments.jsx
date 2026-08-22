import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CreditCard,
  DollarSign,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPayments = () => {
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    payment_gateway: 'STRIPE',
    payment_currency: 'USD',
    payment_mode: 'TEST',
    payment_stripe_pub_key: 'pk_test_sample_key_globetrotter_123',
    payment_stripe_secret_key: 'sk_test_sample_key_globetrotter_123',
    payment_razorpay_key_id: 'rzp_test_sample_key',
    payment_razorpay_key_secret: 'rzp_test_sample_secret',
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, transRes] = await Promise.all([
        adminAPI.getSettings('PAYMENT'),
        adminAPI.getTransactions(),
      ]);

      if (settingsRes.data?.settings) {
        setPaymentSettings((prev) => ({ ...prev, ...settingsRes.data.settings }));
      }
      if (transRes.data?.transactions) {
        setTransactions(transRes.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load payment info', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await adminAPI.updateSettings(paymentSettings, 'PAYMENT');
      setStatusMsg({ type: 'success', text: 'Payment gateway API keys saved!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSimulatePayment = async () => {
    setSimulating(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await adminAPI.testPayment({
        amount: 49.0,
        gateway: paymentSettings.payment_gateway,
        notes: 'GlobeTrotter Pro Itinerary Export & Offline Map Pack',
      });
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      setStatusMsg({ type: 'success', text: 'Simulated payment completed and recorded in ledger!' });
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Simulation failed' });
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading payment infrastructure & ledger..." />;

  const totalCollected = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Monetization & Gateway
          </span>
          <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
            Payment Integrations & Revenue Log
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure Stripe (Global) or Razorpay (India) for paid trip bookings, deposits, and pro exports
          </p>
        </div>

        <button
          onClick={handleSimulatePayment}
          disabled={simulating}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{simulating ? 'Processing...' : 'Simulate $49 Test Checkout'}</span>
        </button>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Revenue KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Total Processed</p>
          <p className="text-3xl font-bold font-serif text-emerald-700 mt-1">${totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Completed Transactions</p>
          <p className="text-3xl font-bold font-serif text-stone-900 mt-1">{transactions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Active Gateway</p>
          <p className="text-3xl font-bold font-serif text-amber-700 mt-1">{paymentSettings.payment_gateway}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gateway Config Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft space-y-6">
          <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            Gateway Keys & Environment
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Selected Gateway Provider
              </label>
              <select
                value={paymentSettings.payment_gateway}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_gateway: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              >
                <option value="STRIPE">Stripe (Global USD / EUR / GBP)</option>
                <option value="RAZORPAY">Razorpay (India INR / UPI)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Environment Mode
              </label>
              <select
                value={paymentSettings.payment_mode}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_mode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
              >
                <option value="TEST">Sandbox / Test Mode</option>
                <option value="LIVE">Live Production Mode</option>
              </select>
            </div>

            {paymentSettings.payment_gateway === 'STRIPE' ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    placeholder="pk_test_..."
                    value={paymentSettings.payment_stripe_pub_key}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, payment_stripe_pub_key: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Stripe Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showStripeSecret ? 'text' : 'password'}
                      placeholder="sk_test_..."
                      value={paymentSettings.payment_stripe_secret_key}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, payment_stripe_secret_key: e.target.value })
                      }
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none transition"
                      title={showStripeSecret ? 'Hide Secret Key' : 'Show Secret Key'}
                    >
                      {showStripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    placeholder="rzp_test_..."
                    value={paymentSettings.payment_razorpay_key_id}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, payment_razorpay_key_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Razorpay Key Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showRazorpaySecret ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={paymentSettings.payment_razorpay_key_secret}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, payment_razorpay_key_secret: e.target.value })
                      }
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                      className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none transition"
                      title={showRazorpaySecret ? 'Hide Key Secret' : 'Show Key Secret'}
                    >
                      {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 mt-2"
            >
              {saving ? 'Saving...' : 'Update Gateway Keys'}
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
          <h3 className="text-lg font-bold font-serif text-stone-900">
            Real-Time Transactions Ledger ({transactions.length})
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">
              No transactions recorded yet. Click "Simulate $49 Test Checkout" above to test.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Gateway</th>
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50">
                      <td className="py-3.5 font-bold text-stone-900">{t.user?.name || 'Explorer'}</td>
                      <td className="py-3.5 font-bold text-emerald-700">
                        ${t.amount?.toFixed(2)} {t.currency}
                      </td>
                      <td className="py-3.5 font-medium text-stone-700">{t.gateway}</td>
                      <td className="py-3.5 font-mono text-[10px] text-stone-500">{t.gatewayRef || '—'}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-[11px] text-stone-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
