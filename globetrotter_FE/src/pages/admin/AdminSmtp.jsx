import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Mail,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
} from 'lucide-react';

export const AdminSmtp = () => {
  const [smtpSettings, setSmtpSettings] = useState({
    smtp_host: 'smtp.mailtrap.io',
    smtp_port: '2525',
    smtp_user: '',
    smtp_pass: '',
    smtp_from_email: 'concierge@globetrotter.com',
    smtp_from_name: 'GlobeTrotter Concierge',
    smtp_secure: 'false',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSmtpSettings();
  }, []);

  const fetchSmtpSettings = async () => {
    try {
      const res = await adminAPI.getSettings('SMTP');
      if (res.data?.settings) {
        setSmtpSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error('Failed to load SMTP settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await adminAPI.updateSettings(smtpSettings, 'SMTP');
      setStatusMsg({ type: 'success', text: 'SMTP relay credentials securely persisted to database!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save SMTP settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await adminAPI.testSmtp({ testRecipient: testRecipient || undefined });
      setStatusMsg({
        type: 'success',
        text: `Test email dispatched successfully! ${res.message || ''}`,
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Test email dispatch failed' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading outbound mail configurations..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Email Infrastructure
        </span>
        <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
          Outbound SMTP Integration
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Used for password reset tokens, traveler registration confirmations, and contact inquiries
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  required
                  placeholder="smtp.mailtrap.io or smtp.sendgrid.net"
                  value={smtpSettings.smtp_host}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  SMTP Port *
                </label>
                <input
                  type="text"
                  required
                  placeholder="587, 465, or 2525"
                  value={smtpSettings.smtp_port}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  SMTP Username / Key
                </label>
                <input
                  type="text"
                  placeholder="api or username"
                  value={smtpSettings.smtp_user}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  SMTP Password / App Secret
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={smtpSettings.smtp_pass}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_pass: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Sender From Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="concierge@globetrotter.com"
                  value={smtpSettings.smtp_from_email}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Sender From Display Name
                </label>
                <input
                  type="text"
                  placeholder="GlobeTrotter Concierge"
                  value={smtpSettings.smtp_from_name}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="smtpSecure"
                checked={smtpSettings.smtp_secure === 'true'}
                onChange={(e) =>
                  setSmtpSettings({ ...smtpSettings, smtp_secure: e.target.checked ? 'true' : 'false' })
                }
                className="w-4 h-4 text-amber-600 rounded border-stone-300"
              />
              <label htmlFor="smtpSecure" className="text-xs text-stone-700 font-medium">
                Enable SSL/TLS secure connection (Port 465)
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save SMTP Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Test Email Console */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-premium flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Server className="w-4 h-4" />
              Live Diagnostic Relay
            </div>
            <h3 className="text-xl font-bold font-serif mb-2">Test Dispatcher</h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              Send an instant verification payload through the current SMTP configuration to ensure deliverability.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{testing ? 'Dispatching...' : 'Send Test Email'}</span>
              </button>
            </form>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-stone-400">
            <span className="font-bold text-white block mb-0.5">Development Fallback</span>
            If no live SMTP credentials are provided, generated OTP codes and email payloads are automatically printed to the backend terminal.
          </div>
        </div>
      </div>
    </div>
  );
};
