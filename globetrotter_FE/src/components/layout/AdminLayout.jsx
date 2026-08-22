import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  Users,
  Database,
  Mail,
  CreditCard,
  Search,
  MessageSquare,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  ExternalLink,
  Shield,
  Coins,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Analytics Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Content Catalog', path: '/admin/content', icon: Database },
    { name: 'Currency & Settings', path: '/admin/settings', icon: Coins },
    { name: 'SMTP Email Config', path: '/admin/smtp', icon: Mail },
    { name: 'Payments & Revenue', path: '/admin/payments', icon: CreditCard },
    { name: 'SEO & Meta Tags', path: '/admin/seo', icon: Search },
    { name: 'Contact Inquiries', path: '/admin/messages', icon: MessageSquare },
  ];

  const isNavActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg">GlobeTrotter Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-stone-900 text-stone-300 flex flex-col justify-between border-r border-stone-800 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-stone-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <img src="/logo.png" alt="GlobeTrotter Logo" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold font-serif text-white block leading-tight">
                  Globe<span className="text-amber-500">Trotter</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                  Admin Command Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Management & Controls
            </div>

            {navItems.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                    active
                      ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-600/20'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-stone-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Return to Main App */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <Link
            to="/app/dashboard"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 bg-stone-800/80 hover:bg-stone-700 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4 text-amber-500" />
              User Dashboard
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-amber-400/80 font-mono uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
