import React, { useState, useEffect } from 'react';
import { seoAPI } from '../../api/client';
import { useSeo } from '../../context/SeoContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Search,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
} from 'lucide-react';

export const AdminSeo = () => {
  const { refreshSeo } = useSeo();

  const [seo, setSeo] = useState({
    home: { title: '', description: '', ogImage: '' },
    about: { title: '', description: '', ogImage: '' },
    gallery: { title: '', description: '', ogImage: '' },
    contact: { title: '', description: '', ogImage: '' },
    googleAnalyticsId: '',
    searchConsoleTag: '',
    metaPixelId: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSeo();
  }, []);

  const fetchSeo = async () => {
    try {
      const res = await seoAPI.getSeo();
      if (res.data?.seo) {
        setSeo(res.data.seo);
      }
    } catch (err) {
      console.error('Failed to load SEO configs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await seoAPI.updateSeo(seo);
      await refreshSeo();
      setStatusMsg({
        type: 'success',
        text: 'SEO metadata, verification tags & analytics IDs updated across document <head>!',
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update SEO' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading SEO meta directives..." />;

  const currentPageSeo = seo[activePage] || { title: '', description: '', ogImage: '' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Search Engine Optimization & Head Tags
        </span>
        <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
          Dynamic Metadata & Analytics Engine
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Modifications here inject directly into HTML &lt;head&gt; tags via React Helmet Async in real-time
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

      <form onSubmit={handleSaveSeo} className="space-y-8">
        {/* Global Tags Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
          <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-600" />
            Global Site Verification & Analytics Tags
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Google Search Console Token
              </label>
              <input
                type="text"
                placeholder="google-site-verification-..."
                value={seo.searchConsoleTag || ''}
                onChange={(e) => setSeo({ ...seo, searchConsoleTag: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Google Analytics 4 ID
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={seo.googleAnalyticsId || ''}
                onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                placeholder="123456789012345"
                value={seo.metaPixelId || ''}
                onChange={(e) => setSeo({ ...seo, metaPixelId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Per-Page Meta Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-lg font-bold font-serif text-stone-900">Per-Page Social & Meta Tags</h3>

            {/* Page Tabs */}
            <div className="flex items-center gap-2">
              {['home', 'about', 'gallery', 'contact'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setActivePage(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    activePage === p
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {p} Page
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Meta Title Tag ({activePage.toUpperCase()})
                </label>
                <input
                  type="text"
                  required
                  value={currentPageSeo.title || ''}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      [activePage]: { ...currentPageSeo, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={currentPageSeo.description || ''}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      [activePage]: { ...currentPageSeo, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Open Graph (OG) Social Image URL
                </label>
                <input
                  type="url"
                  required
                  value={currentPageSeo.ogImage || ''}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      [activePage]: { ...currentPageSeo, ogImage: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900"
                />
              </div>
            </div>

            {/* Live Search & Social Card Preview */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-amber-600" />
                Live Google Search SERP Preview
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <p className="text-xs text-stone-500 font-mono">https://globetrotter.com/{activePage === 'home' ? '' : activePage}</p>
                <h4 className="text-base text-blue-700 hover:underline font-medium leading-snug cursor-pointer">
                  {currentPageSeo.title || 'Page Title Placeholder'}
                </h4>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {currentPageSeo.description || 'Page description will appear here on search results pages.'}
                </p>
              </div>

              {currentPageSeo.ogImage && (
                <div className="relative h-32 rounded-xl overflow-hidden border border-stone-200 mt-2">
                  <img
                    src={currentPageSeo.ogImage}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                    Social Card Share Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing SEO Directives...' : 'Save & Publish All SEO Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
