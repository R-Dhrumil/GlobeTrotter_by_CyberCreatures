import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Mail,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Server,
  Eye,
  EyeOff,
  Sparkles,
  Info,
} from 'lucide-react';

export const AdminSmtp = () => {
  const [showPass, setShowPass] = useState(false);
  const [smtpSettings, setSmtpSettings] = useState({
    email_mode: 'NODEMAILER_SERVICE', // 'NODEMAILER_SERVICE' or 'CUSTOM_SMTP'
    email_service: 'gmail',
    email_user: '',
    email_pass: '',
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
      setStatusMsg({ type: 'success', text: 'Email infrastructure configuration saved successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save email settings' });
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

  const isNodemailerService = smtpSettings.email_mode === 'NODEMAILER_SERVICE';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Email Infrastructure
        </span>
        <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
          Outbound Mail & Nodemailer Setup
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure Nodemailer Service (Gmail/SendGrid/Outlook/etc.) or Custom Outbound SMTP relay.
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft space-y-6">
          {/* Mode Switcher Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Select Relay Method
            </label>
            <div className="p-1.5 bg-stone-100/80 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold border border-stone-200/60">
              <button
                type="button"
                onClick={() => setSmtpSettings({ ...smtpSettings, email_mode: 'NODEMAILER_SERVICE' })}
                className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
                  isNodemailerService
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Nodemailer Service</span>
              </button>

              <button
                type="button"
                onClick={() => setSmtpSettings({ ...smtpSettings, email_mode: 'CUSTOM_SMTP' })}
                className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
                  !isNodemailerService
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Server className="w-4 h-4 text-amber-400" />
                <span>Custom SMTP Server</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* DYNAMIC FORM SECTION: NODEMAILER SERVICE */}
            {isNodemailerService ? (
              <div className="space-y-4 p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Direct Nodemailer Service
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Active Transporter
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Email Service Provider *
                  </label>
                  <select
                    value={smtpSettings.email_service || 'gmail'}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, email_service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white font-medium"
                  >
                    <option value="gmail">Gmail / Google App Password</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="outlook">Outlook / Hotmail</option>
                    <option value="yahoo">Yahoo Mail</option>
                    <option value="zoho">Zoho Mail</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="mailtrap">Mailtrap Service</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Account Email / User ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="your.email@gmail.com"
                      value={smtpSettings.email_user}
                      onChange={(e) =>
                        setSmtpSettings({
                          ...smtpSettings,
                          email_user: e.target.value,
                          smtp_from_email: smtpSettings.smtp_from_email || e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      App Password / Secret Key *
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        placeholder="•••• •••• •••• ••••"
                        value={smtpSettings.email_pass}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, email_pass: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none transition"
                        title={showPass ? 'Hide Password' : 'Show Password'}
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Sender Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="GlobeTrotter Concierge"
                    value={smtpSettings.smtp_from_name}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Shows as recipient&apos;s sender name (e.g. &quot;GlobeTrotter Concierge &lt;{smtpSettings.email_user || 'you@domain.com'}&gt;&quot;)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gmail Tip:</strong> Use a 16-character <em>App Password</em> from your Google Account settings (Security &rarr; 2-Step Verification &rarr; App Passwords).
                  </span>
                </div>
              </div>
            ) : (
              /* DYNAMIC FORM SECTION: CUSTOM SMTP */
              <div className="space-y-4 p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-amber-600" /> Custom Outbound SMTP Relay
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Custom Host
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="smtp.mailtrap.io or smtp.domain.com"
                      value={smtpSettings.smtp_host}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      placeholder="smtp_user or api key"
                      value={smtpSettings.smtp_user}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      SMTP Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={smtpSettings.smtp_pass}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_pass: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none transition"
                        title={showPass ? 'Hide Password' : 'Show Password'}
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Sender From Email
                    </label>
                    <input
                      type="email"
                      placeholder="concierge@globetrotter.com"
                      value={smtpSettings.smtp_from_email}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="GlobeTrotter Concierge"
                      value={smtpSettings.smtp_from_name}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={smtpSettings.smtp_secure === 'true'}
                    onChange={(e) =>
                      setSmtpSettings({ ...smtpSettings, smtp_secure: e.target.checked ? 'true' : 'false' })
                    }
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <label htmlFor="smtpSecure" className="text-xs text-stone-700 font-medium cursor-pointer">
                    Enable SSL/TLS secure connection (Use for Port 465)
                  </label>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Email Configuration'}</span>
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
              Send an instant verification email through your selected active relay method to test deliverability.
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
                <span>{testing ? 'Dispatching Test Email...' : 'Send Test Email'}</span>
              </button>
            </form>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-stone-400">
            <span className="font-bold text-white block mb-0.5">Local Development Fallback</span>
            If no live email credentials are specified, generated OTP codes and email contents are automatically printed directly to the backend terminal log.
          </div>
        </div>
      </div>
    </div>
  );
};
