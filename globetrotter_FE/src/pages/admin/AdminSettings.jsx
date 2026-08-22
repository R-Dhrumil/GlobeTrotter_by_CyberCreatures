import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import {
  Coins,
  DollarSign,
  Plus,
  Save,
  RotateCcw,
  Trash2,
  Edit2,
  CheckCircle2,
  Globe,
  Info,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';

const DEFAULT_CURRENCY_PRESETS = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', ratePerInr: 1.0, isBase: true, enabled: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', ratePerInr: 0.012, isBase: false, enabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', ratePerInr: 0.011, isBase: false, enabled: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', ratePerInr: 0.0095, isBase: false, enabled: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', ratePerInr: 0.044, isBase: false, enabled: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', ratePerInr: 1.82, isBase: false, enabled: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', ratePerInr: 0.018, isBase: false, enabled: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', ratePerInr: 0.016, isBase: false, enabled: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', ratePerInr: 0.016, isBase: false, enabled: true },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', ratePerInr: 0.42, isBase: false, enabled: true },
];

export const AdminSettings = () => {
  const { toast } = useToast();
  const { refreshCurrencies } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCY_PRESETS);

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [formState, setFormState] = useState({
    code: '',
    name: '',
    symbol: '',
    inrEquivalent: '83.33', // 1 FX = X INR
    enabled: true,
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings('CURRENCY');
      if (res.data?.settings?.currency_rates) {
        try {
          const parsed = JSON.parse(res.data.settings.currency_rates);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCurrencies(parsed);
          }
        } catch (e) {
          console.error('Failed parsing saved currencies:', e);
        }
      }
    } catch (err) {
      toast.error('Failed to load currency settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const settingsPayload = {
        currency_base: 'INR',
        currency_rates: JSON.stringify(currencies),
      };
      await adminAPI.updateSettings(settingsPayload, 'CURRENCY');
      await refreshCurrencies();
      toast.success('Currency settings saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed saving currency settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all currency exchange rates to default Indian Rupee market values?')) {
      setCurrencies(DEFAULT_CURRENCY_PRESETS);
      toast.info('Reset currencies to market default rates. Click "Save Settings" to persist.');
    }
  };

  const handleToggleCurrency = (code) => {
    if (code === 'INR') {
      toast.warning('Indian Rupee (INR) is the default base currency and cannot be disabled.');
      return;
    }
    setCurrencies((prev) =>
      prev.map((c) => (c.code === code ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleDeleteCurrency = (code) => {
    if (code === 'INR') {
      toast.error('Cannot delete base currency INR.');
      return;
    }
    if (window.confirm(`Delete currency ${code}?`)) {
      setCurrencies((prev) => prev.filter((c) => c.code !== code));
      toast.info(`Removed ${code} from currency list.`);
    }
  };

  const openAddModal = () => {
    setEditingCurrency(null);
    setFormState({
      code: '',
      name: '',
      symbol: '',
      inrEquivalent: '80.00',
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (curr) => {
    setEditingCurrency(curr);
    const inrVal = curr.ratePerInr > 0 ? (1 / curr.ratePerInr).toFixed(2) : '1.00';
    setFormState({
      code: curr.code,
      name: curr.name,
      symbol: curr.symbol,
      inrEquivalent: inrVal,
      enabled: curr.enabled !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveCurrencyForm = (e) => {
    e.preventDefault();
    const code = formState.code.trim().toUpperCase();
    const name = formState.name.trim();
    const symbol = formState.symbol.trim() || code;
    const inrVal = parseFloat(formState.inrEquivalent);

    if (!code || !name || isNaN(inrVal) || inrVal <= 0) {
      toast.error('Please enter valid currency code, name, and exchange rate');
      return;
    }

    const ratePerInr = code === 'INR' ? 1.0 : parseFloat((1 / inrVal).toFixed(6));

    const newCurrItem = {
      code,
      name,
      symbol,
      ratePerInr,
      isBase: code === 'INR',
      enabled: formState.enabled,
    };

    setCurrencies((prev) => {
      const exists = prev.some((c) => c.code === code);
      if (exists) {
        return prev.map((c) => (c.code === code ? newCurrItem : c));
      }
      return [...prev, newCurrItem];
    });

    setIsModalOpen(false);
    toast.success(`${code} currency updated.`);
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading Currency Settings..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner & Save Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-stone-900 leading-tight">
                Currency & Exchange Settings
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage global currencies & conversion values relative to <span className="font-bold text-amber-700">Indian Rupee (₹ INR)</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-600/20 transition transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Default Base Currency Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white uppercase tracking-wider">
                Default Base Currency
              </span>
              <span className="text-xs font-mono font-bold text-stone-700">Primary DB Reference</span>
            </div>
            <h2 className="text-3xl font-bold font-serif text-stone-900 flex items-center gap-2">
              <span className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                ₹
              </span>
              Indian Rupee (INR)
            </h2>
            <p className="text-xs text-stone-600 max-w-2xl">
              All prices across GlobeTrotter (city cost indices, activity fees, budget calculations) are stored in Indian Rupee. When a traveler selects another currency from the website header, prices are calculated dynamically using these exchange rates.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-amber-200 p-4 rounded-2xl shrink-0 space-y-1 text-center md:text-right">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Exchange Base</span>
            <span className="text-lg font-bold font-mono text-stone-900 block">1 INR = 1.00 ₹</span>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Base Currency Fixed
            </span>
          </div>
        </div>
      </div>

      {/* Currency Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-900">Supported Currencies</h3>
            <p className="text-xs text-stone-500">Configure international currencies available to users in the website header.</p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-stone-800 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 transition"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            Add Currency
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200/60">
                <th className="py-4 px-6">Currency</th>
                <th className="py-4 px-6">Code & Symbol</th>
                <th className="py-4 px-6">Rate in INR (1 FX = X INR)</th>
                <th className="py-4 px-6">Rate per 1 INR</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {currencies.map((curr) => {
                const inrEquivalent = curr.isBase
                  ? '1.00'
                  : (1 / (curr.ratePerInr || 1)).toFixed(2);

                return (
                  <tr key={curr.code} className="hover:bg-stone-50/60 transition">
                    <td className="py-4 px-6 font-medium text-stone-900">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-sm shadow-sm border border-stone-200/60">
                          {curr.symbol}
                        </span>
                        <div>
                          <p className="font-bold text-stone-900">{curr.name}</p>
                          {curr.isBase && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              Base Currency
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-stone-900 font-mono">{curr.code}</span>
                      <span className="text-xs text-stone-500 ml-2 font-mono">({curr.symbol})</span>
                    </td>

                    <td className="py-4 px-6 font-mono font-semibold text-stone-800">
                      {curr.isBase ? (
                        <span className="text-stone-400">1 INR = ₹1.00</span>
                      ) : (
                        <span>1 {curr.code} = ₹{inrEquivalent} INR</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-stone-600">
                      1 INR = {curr.symbol}{curr.ratePerInr}
                    </td>

                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggleCurrency(curr.code)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          curr.enabled !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {curr.enabled !== false ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Enabled
                          </>
                        ) : (
                          <>Disabled</>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(curr)}
                        className="p-2 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition"
                        title="Edit Currency Rate"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {!curr.isBase && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCurrency(curr.code)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Delete Currency"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Currency Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCurrency ? `Edit ${editingCurrency.code} Exchange Rate` : 'Add New Currency'}
        >
          <form onSubmit={handleSaveCurrencyForm} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Currency Code (ISO-3)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={formState.code}
                disabled={editingCurrency?.isBase}
                onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                placeholder="e.g. USD, EUR, CAD"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm uppercase focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Currency Name
              </label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. US Dollar, Euro, Singapore Dollar"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  required
                  value={formState.symbol}
                  onChange={(e) => setFormState({ ...formState, symbol: e.target.value })}
                  placeholder="e.g. $, €, £, ¥, AED"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Value in INR (1 {formState.code || 'FX'} = ? ₹)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  value={formState.inrEquivalent}
                  onChange={(e) => setFormState({ ...formState, inrEquivalent: e.target.value })}
                  placeholder="e.g. 83.50"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" /> Exchange Rate Summary:
              </p>
              <p>
                1 {formState.code || 'FX'} = ₹{formState.inrEquivalent || '0'} INR
              </p>
              <p className="text-[11px] text-amber-800/80">
                Rate per 1 INR = {formState.symbol || '$'}{(1 / (parseFloat(formState.inrEquivalent) || 1)).toFixed(6)}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="curr_enabled"
                checked={formState.enabled}
                onChange={(e) => setFormState({ ...formState, enabled: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label htmlFor="curr_enabled" className="text-xs font-semibold text-stone-800">
                Enable this currency for travelers on user header
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md"
              >
                Save Currency
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminSettings;
