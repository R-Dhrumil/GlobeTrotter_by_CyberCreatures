import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeo } from '../../context/SeoContext';
import { contactAPI } from '../../api/client';
import { Mail, MapPin, Phone, Send, CheckCircle, Clock, Sparkles } from 'lucide-react';

export const ContactPage = () => {
  const { seoConfig } = useSeo();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await contactAPI.submit(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to dispatch message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] pb-24">
      <Helmet>
        <title>{seoConfig.contact.title}</title>
        <meta name="description" content={seoConfig.contact.description} />
      </Helmet>

      {/* Header */}
      <div className="py-20 bg-stone-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3 border border-amber-500/30">
            Concierge Desk
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif mb-4">
            Connect With Our Travel Designers
          </h1>
          <p className="text-stone-300 text-sm sm:text-base">
            Have questions about custom itineraries, group expeditions, or technical integrations? Send our team a direct message below.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-8 border border-stone-800">
            <div>
              <h3 className="text-xl font-bold font-serif mb-2">Expedition HQ</h3>
              <p className="text-xs text-stone-400 leading-relaxed mb-8">
                Our global travel strategists are available around the clock to support your journeys.
              </p>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/10 text-amber-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Global Headquarters</p>
                    <p className="text-xs text-stone-400">742 Evergreen Wanderlust Ave, San Francisco, CA</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/10 text-amber-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Direct Email</p>
                    <p className="text-xs text-stone-400">concierge@globetrotter.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/10 text-amber-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Response Guarantee</p>
                    <p className="text-xs text-stone-400">Under 2 hours during active expedition windows</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-300">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                SMTP Integrated
              </span>
              Messages submitted here automatically trigger our backend SMTP notification relay.
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-3xl shadow-premium border border-stone-200/80">
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-900">Message Delivered!</h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Thank you for reaching out to GlobeTrotter. One of our lead itinerary consultants will get back to you shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-stone-900 mb-1">Send Us a Note</h3>
                  <p className="text-xs text-stone-500">Fill in the parameters below and we'll reply promptly.</p>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Hayes"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jordan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Subject / Destination of Interest
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10-day Kyoto & Tokyo Autumn Itinerary Consultation"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Your Message / Travel Requirements *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tell us about your upcoming plans, travel dates, preferred pace, or any specific questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Transmitting Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
