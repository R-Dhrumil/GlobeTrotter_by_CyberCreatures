import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#d97706', '#22c55e'],
        });
      } catch (err) {}
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details.');
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

            <h2 className="text-3xl font-bold font-serif text-stone-900 mb-2">Create Your Pass</h2>
            <p className="text-xs sm:text-sm text-stone-500 mb-8">
              Start building custom itineraries, calculating trip budgets, and discovering global cities.
            </p>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alex.rivera@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
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
                <span>{loading ? 'Creating Explorer Account...' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="text-xs text-stone-500 mt-6 text-center">
            Already registered?{' '}
            <Link to="/login" className="text-amber-700 font-bold hover:underline">
              Sign In to Account
            </Link>
          </p>
        </div>

        {/* Right Side: Visual Backdrop */}
        <div className="hidden md:block relative bg-stone-900 text-white p-12 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80"
            alt="Santorini Sunset"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold tracking-wider self-start uppercase">
              Join the Expedition
            </span>

            <div>
              <h3 className="text-2xl font-bold font-serif leading-tight mb-2">
                Plan Smarter. Travel Freer.
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Enjoy automated day-by-day scheduling, full catalog access, and one-click budget summaries for every journey you embark upon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
