# 🧭 GlobeTrotter — Full-Stack Collaborative Travel Planning Platform

> 🌐 **Live Web Application**: [https://tlobetrotter.vercel.app/](https://tlobetrotter.vercel.app/)

A production-grade, personalized travel-planning web application built by **CyberCreatures** for the hackathon submission. GlobeTrotter features an adventure-centric visual design inspired by luxury expedition travel, complete relational database schema in PostgreSQL, JWT auth with role-based routing (`USER` vs `ADMIN`), multi-stop itinerary builder, day-by-day activity scheduling, real-time budget tracking & group bill-splitting settlement calculator, Pinterest-style masonry gallery with lightbox & favoriting, group travel collaboration with shareable invite tokens, and a complete admin command center with live SMTP, Stripe/Razorpay payment settings, and dynamic SEO & analytics injection engine.

---

## 🌟 Key Features & Architecture

### 1. 🌐 Public Marketing & Community Exploration
- **Home Page**: Hero search bar with instant destination finder, featured global destinations, live statistics counters, and expedition value highlights.
- **About Us Page**: Mission, vision, core values, origin story, and traveler satisfaction metrics.
- **Contact Us Page**: Interactive contact form with automated backend **SMTP notification relay**.
- **Gallery & Community Hub**: Pinterest-style **masonry grid layout** with regional filter tags, live search, **click-to-expand lightbox modal**, likes counter, and trip favoriting.
- **Authentication Flow**: Standard registration & login + **1-Click Demo Login** shortcuts for instant testing (`Admin` and `Traveler`), plus 6-digit OTP password reset workflow.
- **Public Shared Itinerary**: Accessible at `/trips/share/:slug` with day-by-day stops, activities, estimated costs, social share buttons, and a **"Copy to My Trips"** itinerary cloner.

### 2. 🧳 Authenticated Traveler Planner App
- **Traveler Dashboard**: Recent trips, active destinations count, total budget highlights, and fast "Plan New Trip" creation modal.
- **My Trips Manager**: Grid & list view toggles, destination indicators, public share link generation, group invite token generation, and trip deletion.
- **Itinerary Builder**: Multi-stop route planning with arrival/departure dates, reordering stops, and day-by-day curated activity scheduling with time slots and notes.
- **City & Activity Explorers**: Catalog search with filters for region, country, cost index (1-5 stars), popularity score, and categories (*Adventure, Culture, Food & Drink, Nature, Sightseeing*).
- **Trip Budget Intelligence**: Dynamic category breakdown (*Transport, Stays, Activities, Dining, Other*) with **Recharts Pie & Comparison Bar charts**, average cost per day calculation, and **automatic over-budget alerts**.
- **Group Travel Collaboration & Bill Splitting**: Generate unique join links (`/app/group/join/:token`), manage group members (*OWNER*, *MEMBER*), log per-person shared expenses, and calculate **automatic debt settlements** (who owes whom how much).
- **User Profile & Preferences**: Custom avatar URL, home country, preferred currency (*USD, EUR, GBP, INR, JPY, CAD, AUD*), language preferences, and password security management.

### 3. ⚙️ Dedicated Admin Panel (Role-Gated `role = ADMIN`)
- **Admin Dashboard**: Visual metric cards (users, trips, cities, activities, total revenue, unread inquiries) + **monthly trip creation velocity area chart** + top destination rankings.
- **User Management**: User directory with role promotion (`ADMIN` / `USER`), account status toggling (`ACTIVE` / `SUSPENDED`), and account deletion.
- **Content Management**: Full CRUD for master **Cities** (*with state, lat/lng, cost index, popularity score*) and master **Activities** catalogs with cover photo previews.
- **SMTP Email Relay**: Live SMTP server configuration (*Host, Port, User, Pass, From*) with a built-in **"Send Test Email"** diagnostic dispatcher.
- **Payments & Monetization**: Configurable **Stripe & Razorpay** gateway credentials, Test/Live mode toggle, simulated $49 checkout button, and **real-time transaction ledger**.
- **SEO & Head Directives Engine**: Per-page meta title, description, and OpenGraph social card editors + **Google Analytics 4 ID**, **Google Search Console Token**, and **Meta Pixel ID** injected directly into `<head>` using `react-helmet-async`.
- **Inquiry Inbox**: Management of Contact Us messages with read status and moderation.

---

## 🔐 Demo Credentials (Ready for Instant Testing)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@globetrotter.com` | `Admin@123` | Full Admin Panel (`/admin`) + User Planner |
| **Traveler** | `traveler@globetrotter.com` | `Traveler@123` | User App, Group Travel & Itinerary Builder (`/app/...`) |

*(Tip: On the `/login` screen, simply click the **"Admin Demo"** or **"Traveler Demo"** buttons for 1-click instant login!)*

---

## 🛠️ Tech Stack & Libraries

### Frontend (`globetrotter_FE`)
- **Core Framework**: React 18, Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS, Lucide Icons, Canvas Confetti
- **Data Visualization**: Recharts
- **SEO & Meta**: React Helmet Async
- **HTTP Client**: Axios with JWT Interceptors

### Backend (`globetrotter_BE`)
- **Server Runtime**: Node.js, Express.js REST API
- **Database Access**: PostgreSQL (`pg` / `node-postgres`), Raw SQL DDL Schemas
- **Security & Auth**: JSON Web Tokens (JWT), Bcrypt password hashing, Helmet, Express Rate Limit, CORS
- **Communication**: Nodemailer (SMTP), Socket.IO (Real-time web sockets)
- **Document Export**: PDFKit, PDFKit-Table, ExcelJS
- **Media Upload**: Multer, Cloudinary integration
- **API Documentation**: Swagger UI Express (`http://localhost:5000/docs`)

---

## 🗄️ Database Schema & Architecture

The database is built on **PostgreSQL** (compatible with Railway PostgreSQL, Supabase, Neon, AWS RDS, or Local PG) with 15 relational tables:

1. **`User`**: `id`, `name`, `email`, `password`, `role` (USER/ADMIN), `photoUrl`, `languagePref`, `currency`, `country`, `status` (ACTIVE/SUSPENDED), `department`, `isActive`, `createdAt`, `updatedAt`
2. **`Otp`**: `id`, `email`, `otp`, `expiresAt`, `createdAt`
3. **`City`**: `id`, `name`, `state`, `country`, `region`, `costIndex` (1-5), `popularityScore` (1-100), `lat`, `lng`, `imageUrl`, `description`, `createdAt`, `updatedAt`
4. **`Activity`**: `id`, `cityId` (FK), `name`, `category`, `cost`, `durationMinutes`, `description`, `imageUrl`, `createdAt`, `updatedAt`
5. **`Trip`**: `id`, `userId` (FK), `name`, `startDate`, `endDate`, `description`, `coverPhotoUrl`, `isPublic`, `shareSlug`, `inviteToken`, `createdAt`, `updatedAt`
6. **`Stop`**: `id`, `tripId` (FK), `cityId` (FK), `orderIndex`, `arrivalDate`, `departureDate`, `createdAt`, `updatedAt`
7. **`StopActivity`**: `id`, `stopId` (FK), `activityId` (FK), `scheduledDate`, `scheduledTime`, `notes`, `createdAt`, `updatedAt`
8. **`Budget`**: `id`, `tripId` (FK), `category` (TRANSPORT, STAY, ACTIVITIES, MEALS, OTHER), `estimatedAmount`, `actualAmount`, `notes`, `createdAt`, `updatedAt`
9. **`GroupMember`**: `id`, `tripId` (FK), `userId` (FK), `role` (OWNER, MEMBER), `joinedAt`
10. **`GroupExpense`**: `id`, `tripId` (FK), `paidByUserId` (FK), `category`, `amount`, `description`, `expenseDate`, `createdAt`
11. **`SavedTrip`**: `id`, `userId` (FK), `tripId` (FK), `createdAt`
12. **`LikedItem`**: `id`, `userId` (FK), `itemId`, `itemType` (TRIP/ACTIVITY), `createdAt`
13. **`SiteSetting`**: `id`, `key`, `value`, `group` (GENERAL, SMTP, PAYMENT, SEO), `createdAt`, `updatedAt`
14. **`Transaction`**: `id`, `userId` (FK), `tripId` (FK), `amount`, `currency`, `gateway`, `status`, `gatewayRef`, `notes`, `createdAt`
15. **`ContactMessage`**: `id`, `name`, `email`, `subject`, `message`, `isRead`, `createdAt`

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance (Local PostgreSQL, Railway, Supabase, or Neon)

---

### 1. Backend Setup (`globetrotter_BE`)

```bash
# Navigate to backend directory
cd globetrotter_BE

# Install dependencies
npm install

# Configure Environment Variables in .env
# Ensure DATABASE_URL points to your PostgreSQL instance:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter_db"
# PORT=5000
# JWT_SECRET=super_secret_jwt_key_12345

# Seed initial database schema, demo accounts, global cities & activities
npm run seed

# Start development server
npm run dev
```

- **Backend API Base**: `http://localhost:5000`
- **Interactive Swagger API Docs**: `http://localhost:5000/docs`

---

### 2. Frontend Setup (`globetrotter_FE`)

```bash
# Navigate to frontend directory
cd globetrotter_FE

# Install dependencies
npm install

# Configure Environment Variables in .env (if needed)
# VITE_API_URL=http://localhost:5000/api/v1

# Start Vite development server
npm run dev
```

- **Frontend App**: `http://localhost:5173`

---

## 📡 Key REST API Endpoints Overview

| Category | Endpoint | Method | Description |
|---|---|---|---|
| **Auth** | `/api/v1/auth/login` | `POST` | User & Admin authentication |
| **Auth** | `/api/v1/auth/register` | `POST` | New traveler registration |
| **Auth** | `/api/v1/auth/send-otp` | `POST` | Generate & dispatch 6-digit OTP |
| **Auth** | `/api/v1/auth/verify-otp` | `POST` | Verify OTP for password reset |
| **Trips** | `/api/v1/trips/my` | `GET` | Fetch authenticated user trips |
| **Trips** | `/api/v1/trips/:id` | `GET` | Get trip details with stops & activities |
| **Trips** | `/api/v1/trips/share/:slug` | `GET` | Public shared trip view (No auth required) |
| **Trips** | `/api/v1/trips/:id/copy` | `POST` | Clone public trip into user planner |
| **Group** | `/api/v1/trips/:id/group/invite-link` | `GET` | Generate group invite token |
| **Group** | `/api/v1/trips/group/join/:token` | `POST` | Join group trip via invite link |
| **Group** | `/api/v1/trips/:id/group/expenses` | `GET/POST` | Fetch or add group shared expenses |
| **Group** | `/api/v1/trips/:id/group/settlement` | `GET` | Automated debt settlement breakdown |
| **Catalog**| `/api/v1/catalog/cities` | `GET` | Explore master city destinations |
| **Catalog**| `/api/v1/catalog/activities` | `GET` | Explore master activity catalog |
| **Admin** | `/api/v1/admin/stats` | `GET` | Admin dashboard analytics metrics |
| **Admin** | `/api/v1/admin/users` | `GET/PUT` | User directory & status/role updates |
| **Admin** | `/api/v1/admin/settings` | `GET/POST`| Dynamic SMTP, Payments, & SEO settings |

---

## 👥 Team CyberCreatures

Developed with ❤️ for the Odoo Hackathon.
