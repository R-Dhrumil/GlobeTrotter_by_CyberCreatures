import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CurrencySelector } from '../common/CurrencySelector';
import logo from '../../assets/logo.png';
import {
  Compass,
  Map,
  Image as ImageIcon,
  Info,
  Mail,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  FolderHeart,
  Search,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-stone-200/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-15 h-15 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:scale-105 transition duration-300">
              <img src={logo} alt="GlobeTrotter Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <span className="text-2xl font-bold font-serif tracking-tight text-stone-900 block leading-tight">
                Globe<span className="text-amber-600">Trotter</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-600 block">
                Bespoke Journeys
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition ${isActive('/') ? 'text-amber-600 font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition ${isActive('/about') ? 'text-amber-600 font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              About Us
            </Link>
            <Link
              to="/gallery"
              className={`text-sm font-medium transition ${isActive('/gallery') ? 'text-amber-600 font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Gallery
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition ${isActive('/contact') ? 'text-amber-600 font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-4">
            <CurrencySelector />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User Portal Link */}
                <Link
                  to="/app/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 transition"
                >
                  <Map className="w-4 h-4 text-amber-600" />
                  My Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                )}

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition focus:outline-none"
                  >
                    {user?.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-amber-500"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-premium border border-stone-200/80 py-2 animate-fade-in z-50">
                      <div className="px-4 py-2.5 border-b border-stone-100">
                        <p className="text-sm font-bold text-stone-900 truncate">{user?.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-600">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/app/my-trips"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <FolderHeart className="w-4 h-4 text-amber-600" />
                        My Trips
                      </Link>
                      <Link
                        to="/app/cities"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <Search className="w-4 h-4 text-amber-600" />
                        City Explorer
                      </Link>
                      <Link
                        to="/app/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <User className="w-4 h-4 text-amber-600" />
                        Account Settings
                      </Link>

                      <div className="border-t border-stone-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:text-stone-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-600/20 transition transform active:scale-95"
                >
                  Plan a Trip
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Currency Selector */}
          <div className="flex md:hidden items-center gap-2">
            <CurrencySelector compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-3 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-100"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-100"
          >
            About Us
          </Link>
          <Link
            to="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-100"
          >
            Gallery
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-stone-100"
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <Link
                to="/app/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-semibold text-amber-700 bg-amber-50"
              >
                Dashboard
              </Link>
              <Link
                to="/app/my-trips"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-stone-700"
              >
                My Trips
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-bold text-amber-800 bg-amber-100"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold text-stone-800 bg-stone-100"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold text-white bg-amber-600"
              >
                Sign Up / Plan a Trip
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
