# 🧭 GlobeTrotter Backend — REST API Server

Production-grade Express.js & PostgreSQL REST API engine powering the **GlobeTrotter** travel planning platform, developed by **Team CyberCreatures**. 

> 🌐 **Live Frontend Application**: [https://tlobetrotter.vercel.app/](https://tlobetrotter.vercel.app/)

---

## ⚡ Key Architecture & Features

- **Runtime & Database**: Node.js, Express.js, PostgreSQL (`pg` / `node-postgres` driver with raw SQL DDL schemas).
- **Authentication**: JWT authentication with Bcrypt password hashing, role-based access control (`USER` vs `ADMIN`), and 6-digit Email OTP reset workflow.
- **Trip & Itinerary Engine**: Multi-stop trip route builder, arrival/departure dates, drag-and-drop stop reordering, and activity scheduling with custom notes.
- **Group Travel & Bill Splitting**: Unique token invite link generation (`/app/group/join/:token`), multi-member management, per-person expense logging, and automated debt settlement algorithm.
- **Budget Intelligence**: Category budget allocation (*Transport, Stays, Activities, Meals, Other*) with real-time actual vs estimated spending tracking.
- **Admin Command Center**: User directory management (*status toggle, role promotion*), Master Cities & Activities catalog CRUD, live SMTP server configuration with diagnostic email dispatcher, Stripe & Razorpay payment credentials, dynamic SEO head tag injection engine, and inquiry inbox.
- **Real-Time & Document Exports**: Socket.IO websocket support, automated Nodemailer SMTP email relay, Multer/Cloudinary file uploads, and PDFKit & ExcelJS document report generators.
- **Interactive Swagger API Documentation**: Live OpenAPI Swagger UI running at `/docs`.

---

## ⚡ Quick Start (Local Setup)

### 1. Install Dependencies
```bash
cd globetrotter_BE
npm install
```

### 2. Configure Environment Variables (`.env`)
Create or verify `.env` in `globetrotter_BE`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter_db"
JWT_SECRET=super_secret_globetrotter_jwt_key_12345
NODE_ENV=development
```

### 3. Initialize & Seed PostgreSQL Database
Runs schema DDL scripts (`database/schema.sql`, `group_migration.sql`, `gallery_migration.sql`) and populates 12+ global cities, 50+ activities, demo trips, and default demo user accounts:
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
# Running at: http://localhost:5000
```

---

## 📖 Interactive Swagger API Documentation

Open in your browser while server is running:
- **Swagger UI Interactive Explorer**: [`http://localhost:5000/docs`](http://localhost:5000/docs)
- **OpenAPI 3.0 JSON Spec**: [`http://localhost:5000/docs.json`](http://localhost:5000/docs.json)

*(Includes interactive JWT Bearer authorization directly in your browser!)*

---

## 🔐 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@globetrotter.com` | `Admin@123` |
| **Traveler** | `traveler@globetrotter.com` | `Traveler@123` |

---

## 🗄️ Database Schema & DDL Scripts

Database tables are stored in `database/schema.sql`, `database/group_migration.sql`, and `database/gallery_migration.sql`:

1. **`User`**: Accounts with role, avatar, currency preference, and status (`ACTIVE`/`SUSPENDED`).
2. **`Otp`**: 6-digit password reset verification codes.
3. **`City`**: Master destination catalog with region, cost index (1-5), popularity score (1-100), and coordinates.
4. **`Activity`**: Master activity catalog with category, cost, duration, and cover images.
5. **`Trip`**: User trips with dates, cover photo, public share slug, and group invite token.
6. **`Stop`**: Destinations included on a trip route with order index and stay dates.
7. **`StopActivity`**: Scheduled activities per stop with time slots and notes.
8. **`Budget`**: Category budget limits and actual expense tracking per trip.
9. **`GroupMember`**: Group trip participants (*OWNER*, *MEMBER*).
10. **`GroupExpense`**: Shared trip expenses logged by group members.
11. **`SavedTrip`**: User bookmarked public itineraries.
12. **`LikedItem`**: Polymorphic table tracking likes on trips and activities.
13. **`SiteSetting`**: Key-value pairs for SMTP, Payments, and SEO dynamic configs.
14. **`Transaction`**: Stripe/Razorpay payment transaction log.
15. **`ContactMessage`**: Contact Us inquiry inbox messages.

---

## 📡 REST API Endpoint Reference

### 🔐 Auth (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register a new traveler account
- `POST /api/v1/auth/login` — Authenticate user or admin
- `POST /api/v1/auth/send-otp` — Request 6-digit password reset OTP
- `POST /api/v1/auth/verify-otp` — Verify OTP code and set new password
- `GET  /api/v1/auth/me` — Fetch current authenticated user profile

### 🧳 Trips (`/api/v1/trips`)
- `GET  /api/v1/trips/my` — Get authenticated user's trips
- `POST /api/v1/trips` — Create a new trip
- `GET  /api/v1/trips/:id` — Get trip details with stops, activities, and budget
- `PUT  /api/v1/trips/:id` — Update trip metadata (name, dates, description, cover photo)
- `PUT  /api/v1/trips/:id/public` — Toggle public share visibility
- `DELETE /api/v1/trips/:id` — Delete trip
- `POST /api/v1/trips/:id/copy` — Clone public trip into current user account
- `GET  /api/v1/trips/share/:slug` — Get public shared trip view (No auth required)

### 📍 Stops & Scheduled Activities (`/api/v1/trips`)
- `POST /api/v1/trips/:tripId/stops` — Add city stop to trip
- `PUT  /api/v1/trips/stops/:id` — Update stop arrival/departure dates
- `DELETE /api/v1/trips/stops/:id` — Remove stop from trip
- `PUT  /api/v1/trips/:tripId/stops/reorder` — Reorder stops on itinerary route
- `POST /api/v1/trips/stops/:stopId/activities` — Add activity to stop
- `PUT  /api/v1/trips/activities/:id` — Edit activity schedule time or notes
- `DELETE /api/v1/trips/activities/:id` — Remove activity from stop

### 👥 Group Travel Collaboration (`/api/v1/trips`)
- `POST /api/v1/trips/:tripId/group/enable` — Enable group collaboration
- `GET  /api/v1/trips/:tripId/group/invite-link` — Get unique invite link token
- `GET  /api/v1/trips/group/validate/:token` — Validate invite token (Public)
- `POST /api/v1/trips/group/join/:token` — Join group trip via invite link
- `GET  /api/v1/trips/:tripId/group/members` — List group members
- `DELETE /api/v1/trips/:tripId/group/members/:userId` — Remove group member
- `POST /api/v1/trips/:tripId/group/expenses` — Log per-person shared expense
- `GET  /api/v1/trips/:tripId/group/expenses` — Fetch group expense log
- `DELETE /api/v1/trips/:tripId/group/expenses/:expenseId` — Delete group expense
- `GET  /api/v1/trips/:tripId/group/settlement` — Automated debt settlement breakdown

### 💰 Budget (`/api/v1/trips`)
- `GET  /api/v1/trips/:tripId/budget` — Get category budgets for trip
- `POST /api/v1/trips/:tripId/budget` — Create/Update budget category amount
- `DELETE /api/v1/trips/budget/:id` — Delete budget category entry

### 🏙️ Catalog Explorer (`/api/v1/catalog`)
- `GET  /api/v1/catalog/cities` — Search master cities with region, country, cost filters
- `GET  /api/v1/catalog/activities` — Search master activities catalog
- `POST /api/v1/catalog/cities` — Add new city (Admin only)
- `POST /api/v1/catalog/activities` — Add new activity (Admin only)

### ⚙️ Admin Command Center (`/api/v1/admin`)
- `GET  /api/v1/admin/stats` — Dashboard analytics metrics & chart data
- `GET  /api/v1/admin/users` — User directory with search & pagination
- `PUT  /api/v1/admin/users/:id/status` — Toggle user status (`ACTIVE`/`SUSPENDED`)
- `PUT  /api/v1/admin/users/:id/role` — Update user role (`USER`/`ADMIN`)
- `DELETE /api/v1/admin/users/:id` — Delete user account
- `GET  /api/v1/admin/settings` — Read dynamic SMTP, Payments, & SEO settings
- `POST /api/v1/admin/settings` — Save site settings
- `POST /api/v1/admin/smtp/test` — Dispatch diagnostic test email via configured SMTP

### ✉️ Contact Inquiries (`/api/v1/contact`)
- `POST /api/v1/contact` — Submit public inquiry (triggers SMTP notification)
- `GET  /api/v1/contact` — View inquiry messages (Admin only)
- `PUT  /api/v1/contact/:id/read` — Mark message as read (Admin only)

### 📁 Uploads & Reports
- `POST /api/v1/upload/single` — Upload image/file (Multer/Cloudinary)
- `POST /api/v1/upload/multiple` — Upload multiple images/files
- `GET  /api/v1/sample/export/excel` — Download `.xlsx` report
- `GET  /api/v1/sample/export/pdf` — Download `.pdf` report

---

## 👥 Developed By Team CyberCreatures
Built for the Odoo Hackathon.
