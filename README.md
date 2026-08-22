# 🧭 GlobeTrotter — Full-Stack Travel Planning Platform

A production-grade, personalized travel-planning web application built for the hackathon submission. It features an adventure-centric visual design inspired by luxury expedition travel, complete relational database schema, JWT auth with role-based routing (`user` vs `admin`), multi-stop itinerary builder, day-by-day activity scheduling, real-time budget tracking, Pinterest-style masonry gallery, and a complete admin command center with SMTP, Stripe/Razorpay payments, and dynamic SEO & analytics engine.

---

## 🌟 Key Architecture & Features

### 1. Public Marketing & Exploration (User Side)
- **Home Page**: Hero search bar, featured global destinations, statistics counters, and expedition value highlights.
- **About Us**: Mission, vision, core values, origin story, and community satisfaction metrics.
- **Contact Us**: Interactive contact form with automated backend **SMTP notification relay**.
- **Gallery**: Pinterest-style **masonry/waterfall grid** with regional filter tags, live search, and **click-to-expand lightbox** with likes counter and sharing.
- **Auth Flow**: Standard registration & login + **1-Click Demo Login** shortcuts for instant testing (`Admin` and `Traveler`), plus 6-digit OTP password reset.
- **Public Shared Itinerary**: Accessible at `/trips/share/:slug` with day-by-day stops, activities, estimated costs, social share buttons, and a **"Copy to My Trips"** cloner.

### 2. Authenticated User Planner App
- **Traveler Dashboard**: Recent trips, active destinations count, budget highlights, and fast "Plan New Trip" creation modal.
- **My Trips**: Grid & list view toggles, destination indicators, share link generation, and deletion.
- **Itinerary Builder**: Multi-stop drag-and-drop route planning, date assignments, and day-by-day curated activity scheduling with time slots and notes.
- **City Search & Activity Search**: Catalog explorers with filters for region, country, cost index (1-5 stars), popularity score, and categories (Adventure, Culture, Food & Drink, Nature, Sightseeing).
- **Trip Budget Intelligence**: Dynamic category breakdown (Transport, Stays, Activities, Dining, Other) with **Recharts Pie & Comparison Bar charts**, average cost per day, and **automatic over-budget alerts**.
- **User Profile & Settings**: Custom avatar, travel styles, language preferences, and password security.

### 3. Dedicated Admin Panel (Role-Gated `role = ADMIN`)
- **Admin Dashboard**: Visual metric cards (users, trips, cities, activities, revenue, unread inquiries) + **monthly trip creation velocity area chart** + top destination rankings.
- **User Management**: User directory with role promotion (`ADMIN` / `USER`), account status toggling (`ACTIVE` / `SUSPENDED`), and account deletion.
- **Content Management**: Full CRUD for master **Cities** and master **Activities** catalogs with cover photo previews and popularity weighting.
- **SMTP Email Relay**: Live SMTP server settings configuration (Host, Port, User, Pass, From) with a built-in **"Send Test Email"** diagnostic dispatcher.
- **Payments & Monetization**: Configurable **Stripe & Razorpay** gateway credentials, Test/Live mode toggle, simulated $49 checkout button, and **real-time transaction ledger**.
- **SEO & Head Directives Engine**: Per-page meta title, description, and OpenGraph social card editors + **Google Analytics 4 ID**, **Google Search Console Token**, and **Meta Pixel ID** injected directly into `<head>` using `react-helmet-async`.
- **Inquiry Inbox**: Management of Contact Us messages with read status and moderation.

---

## 🔐 Demo Credentials (Ready for Testing)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@globetrotter.com` | `Admin@123` | Full Admin Panel (`/admin`) + User Planner |
| **Traveler** | `traveler@globetrotter.com` | `Traveler@123` | User App & Itinerary Builder (`/app/...`) |

*(Tip: On the `/login` screen, simply click the **"Admin Demo"** or **"Traveler Demo"** buttons for instant 1-click access!)*

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (.jsx), React Router DOM v6, Tailwind CSS, Lucide Icons, Recharts, React Helmet Async, Canvas Confetti, Axios.
- **Backend**: Node.js, Express.js REST API, Prisma ORM, JSON Web Tokens (JWT), Bcrypt password hashing, Nodemailer, Helmet, Morgan, Swagger UI.
- **Database**: PostgreSQL (Railway deployed).

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

- `User` (id, name, email, password, role [USER, ADMIN], photoUrl, languagePref, status [ACTIVE, SUSPENDED], department, createdAt, updatedAt)
- `Trip` (id, userId FK, name, startDate, endDate, description, coverPhotoUrl, isPublic, shareSlug, createdAt, updatedAt)
- `Stop` (id, tripId FK, cityId FK, orderIndex, arrivalDate, departureDate, createdAt, updatedAt)
- `City` (id, name, country, region, costIndex, popularityScore, imageUrl, description, createdAt)
- `Activity` (id, cityId FK, name, category, cost, durationMinutes, description, imageUrl, createdAt)
- `StopActivity` (id, stopId FK, activityId FK, scheduledDate, scheduledTime, notes, createdAt)
- `Budget` (id, tripId FK, category [TRANSPORT, STAY, ACTIVITIES, MEALS, OTHER], estimatedAmount, actualAmount, notes, createdAt)
- `SiteSetting` (id, key [unique], value, group [SMTP, PAYMENT, SEO, GENERAL], createdAt, updatedAt)
- `Transaction` (id, userId FK, tripId FK, amount, currency, gateway, status, gatewayRef, notes, createdAt)
- `ContactMessage` (id, name, email, subject, message, isRead, createdAt)
- `Otp` (id, email, otp, expiresAt, createdAt)

---

## 🚀 Getting Started Locally

### 1. Backend Setup (`globetrotter_BE`)
```bash
cd globetrotter_BE
npm install

# Push database schema & generate Prisma client
npx prisma generate
npx prisma db push

# Seed initial 12+ global cities, 50+ activities, demo trips, and admin user
npm run seed

# Start server
npm run dev
# Server running at: http://localhost:5000
# Swagger API docs at: http://localhost:5000/docs
```

### 2. Frontend Setup (`globetrotter_FE`)
```bash
cd globetrotter_FE
npm install

# Start Vite dev server
npm run dev
# Frontend live at: http://localhost:5173
```
