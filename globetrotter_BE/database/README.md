# 🗄️ GlobeTrotter Database Architecture

This directory contains the production-ready PostgreSQL DDL and seed scripts for GlobeTrotter.

---

## 📁 Directory Layout

```
database/
├── schema.sql                     # Full idempotent PostgreSQL DDL schema
├── seed.sql                       # Master catalog & sample data seed script
├── migrations/
│   └── 001_initial_schema.sql    # Incremental migration step 1
└── README.md                      # Database documentation & execution guide
```

---

## 🚀 How to Execute on Railway PostgreSQL

### Option 1: Direct Railway SQL Editor (Recommended)
1. Open your **Railway Dashboard** -> Click your **PostgreSQL** service.
2. Open the **Query / Data** tab.
3. Copy & paste the contents of `database/schema.sql` and run.
4. Copy & paste the contents of `database/seed.sql` and run.

### Option 2: Command-Line `psql` Execution
If you have `psql` installed and your Railway Public Connection URL:
```bash
psql "postgresql://postgres:YOUR_PASSWORD@roundhouse.proxy.rlwy.net:PORT/railway" -f database/schema.sql
psql "postgresql://postgres:YOUR_PASSWORD@roundhouse.proxy.rlwy.net:PORT/railway" -f database/seed.sql
```

---

## 📊 Relational Entities

| Table | Purpose |
|---|---|
| `"User"` | User & Administrator accounts, profile avatars, preferences, status |
| `"Trip"` | Travel itineraries with start/end dates, cover photos, and shareable slugs |
| `"Stop"` | Ordered city stopovers on a trip (`orderIndex` for drag & drop) |
| `"City"` | Master catalog of global cities with cost index and popularity rankings |
| `"Activity"` | Curated catalog of activities (sightseeing, food, culture, adventure) |
| `"StopActivity"` | Scheduled activities assigned to a specific trip stop |
| `"Budget"` | Cost tracking by category (`TRANSPORT`, `STAY`, `ACTIVITIES`, `MEALS`, `OTHER`) |
| `"SiteSetting"` | Database-persisted SMTP, Stripe/Razorpay, and SEO `<head>` directives |
| `"Transaction"` | Monetization and payments ledger |
| `"ContactMessage"` | Messages submitted via the public Contact Us form |
| `"Otp"` | 6-digit email recovery codes for password resets |
