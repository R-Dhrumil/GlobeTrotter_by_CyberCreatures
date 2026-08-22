import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, MapPin, Mail, Globe, Shield, Instagram, Twitter, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-serif tracking-tight text-white">
                Globe<span className="text-amber-500">Trotter</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Curating high-end adventurous itineraries, real-time budgeting, and unforgettable expeditions across the seven continents.
            </p>
            <div className="flex items-center gap-3 pt-2 text-stone-400">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-stone-800 hover:text-amber-400 hover:bg-stone-700 transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-stone-800 hover:text-amber-400 hover:bg-stone-700 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-stone-800 hover:text-amber-400 hover:bg-stone-700 transition">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-serif">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-amber-400 transition">About Our Mission</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-400 transition">Inspiration Gallery</Link></li>
              <li><Link to="/app/cities" className="hover:text-amber-400 transition">Featured Destinations</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition">Travel Concierge</Link></li>
            </ul>
          </div>

          {/* User Planner Tools */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-serif">Trip Planner</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/app/dashboard" className="hover:text-amber-400 transition">Traveler Dashboard</Link></li>
              <li><Link to="/app/my-trips" className="hover:text-amber-400 transition">My Saved Itineraries</Link></li>
              <li><Link to="/app/activities" className="hover:text-amber-400 transition">Activity Catalog</Link></li>
              <li><Link to="/login" className="hover:text-amber-400 transition">Traveler Portal Login</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact Preview */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-2 font-serif">Expedition Club</h4>
            <p className="text-xs text-stone-400">
              Receive secret flight deals, hidden gems, and quarterly seasonal travel guides.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => alert('Thank you for subscribing to GlobeTrotter Expedition Club!')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs uppercase tracking-wider transition"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} GlobeTrotter Inc. Built with passion for adventures.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Expedition</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
