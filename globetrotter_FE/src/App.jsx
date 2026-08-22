import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { PublicItineraryPage } from './pages/public/PublicItineraryPage';

// User In-App Pages
import { DashboardPage } from './pages/user/DashboardPage';
import { MyTripsPage } from './pages/user/MyTripsPage';
import { ItineraryBuilderPage } from './pages/user/ItineraryBuilderPage';
import { CitySearchPage } from './pages/user/CitySearchPage';
import { ActivitySearchPage } from './pages/user/ActivitySearchPage';
import { BudgetPage } from './pages/user/BudgetPage';
import { UserProfilePage } from './pages/user/UserProfilePage';
import { GroupTripPage } from './pages/user/GroupTripPage';
import { JoinGroupPage } from './pages/user/JoinGroupPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminSmtp } from './pages/admin/AdminSmtp';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminSeo } from './pages/admin/AdminSeo';
import { AdminMessages } from './pages/admin/AdminMessages';

// Public & User Main Layout Wrapper
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const App = () => {
  return (
    <Routes>
      {/* 1. Public & User Web App Routes */}
      <Route element={<MainLayout />}>
        {/* Marketing / Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/trips/share/:slug" element={<PublicItineraryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Authenticated User Planner App */}
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/my-trips"
          element={
            <ProtectedRoute>
              <MyTripsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/trips/:id"
          element={
            <ProtectedRoute>
              <ItineraryBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/trips/:id/budget"
          element={
            <ProtectedRoute>
              <BudgetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/cities"
          element={
            <ProtectedRoute>
              <CitySearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/activities"
          element={
            <ProtectedRoute>
              <ActivitySearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/trips/:id/group"
          element={
            <ProtectedRoute>
              <GroupTripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/group/join/:token"
          element={
            <ProtectedRoute>
              <JoinGroupPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. Admin Panel Routes (Gated by AdminRoute) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="smtp" element={<AdminSmtp />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="seo" element={<AdminSeo />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
