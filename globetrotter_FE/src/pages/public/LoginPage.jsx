import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, Mail, Lock, ArrowRight, Shield, User, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      if (demoRole === 'ADMIN') {
        setEmail('admin@globetrotter.com');
        setPassword('Admin@123');
        const user = await login('admin@globetrotter.com', 'Admin@123');
        navigate('/admin');
      } else {
        setEmail('traveler@globetrotter.com');
        setPassword('Traveler@123');
        const user = await login('traveler@globetrotter.com', 'Traveler@123');
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#fbf9f6]">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-premium border border-stone-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif text-stone-900">
                Globe<span className="text-amber-600">Trotter</span>
              </span>
            </Link>

            <h2 className="text-3xl font-bold font-serif text-stone-900 mb-2">Welcome Back</h2>
            <p className="text-xs sm:text-sm text-stone-500 mb-8">
              Sign in to manage your custom trips, budgets, and saved destinations.
            </p>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="explorer@globetrotter.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
                  >
                    Forgot code?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Logins for Hackathon Evaluators */}
            <div className="mt-8 pt-6 border-t border-stone-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Quick 1-Click Demo Logins
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('USER')}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  Traveler Demo
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-6 text-center">
            Don't have an expedition pass yet?{' '}
            <Link to="/signup" className="text-amber-700 font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* Right Side: Visual Backdrop */}
        <div className="hidden md:block relative bg-stone-900 text-white p-12 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80"
            alt="Tokyo Night"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold tracking-wider self-start uppercase">
              Curated Itineraries
            </span>

            <div>
              <blockquote className="text-xl font-serif font-light italic leading-relaxed text-stone-100 mb-4">
                "GlobeTrotter turned our chaotic 3-week Japan and Europe trip into the smoothest expedition of our lives."
              </blockquote>
              <p className="text-xs text-stone-300 font-semibold">— Alex R., Verified Explorer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
