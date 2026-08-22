# 🚀 Hackathon Express Backend (PostgreSQL + Prisma ORM)

Supercharged, production-grade backend boilerplate built for hackathons with Railway / Supabase / Neon PostgreSQL. Includes pre-configured JWT Auth, Email OTP, Universal File Uploads, Swagger UI, Real-time Socket.IO, Dynamic RBAC, PDF/Excel Exports, and an Exportable Frontend SDK.

---

## ⚡ Quick Start (1-Minute Launch)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Check `.env` file (pre-populated with local PostgreSQL / Supabase / Railway defaults):
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hackathon_db?schema=public"
   JWT_SECRET=super_secret_hackathon_jwt_key_12345
   ```

3. **Push Prisma Schema to Database**:
   ```bash
   npm run prisma:push
   ```

4. **Seed Database with Pitch-Ready Demo Accounts**:
   ```bash
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 📖 Interactive Swagger API Documentation
Open in your browser:
- **Swagger UI**: `http://localhost:5000/docs`
- **OpenAPI JSON**: `http://localhost:5000/docs.json`
- Supports interactive JWT Bearer authorization directly in the browser!

---

## 📡 API Endpoints Summary

### 🔐 Authentication & Email OTP
- `POST /api/v1/auth/register` — Register a new account
- `POST /api/v1/auth/login` — Login with email & password
- `POST /api/v1/auth/send-otp` — Generate & send 6-digit email OTP *(prints in terminal in dev mode)*
- `POST /api/v1/auth/verify-otp` — Verify OTP & passwordless login/signup
- `GET  /api/v1/auth/me` — Get authenticated user profile (JWT protected)

### 📁 Universal Media / File Upload
- `POST /api/v1/upload/single` — Upload single file (Form field: `file`)
- `POST /api/v1/upload/multiple` — Upload multiple files (Form field: `files`, max 10)
- Auto-fallback to local `/uploads` folder if Cloudinary credentials are not provided.

### 👥 User Management (RBAC Protected)
- `GET  /api/v1/users` — List all users (with search & pagination)
- `POST /api/v1/users` — Create new user (Admin only)
- `GET  /api/v1/users/:id` — Get user profile
- `PATCH /api/v1/users/:id/role` — Update user role

### 📊 Role-Based Scoped Data & Export Demos
- `GET /api/v1/sample/scoped-data` — Returns data filtered dynamically based on current user role
- `GET /api/v1/sample/export/excel` — Stream downloadable `.xlsx` report
- `GET /api/v1/sample/export/pdf` — Stream downloadable `.pdf` report

---

## 🔌 Socket.IO Real-time WebSocket Service

Connect from your frontend to `ws://localhost:5000`:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join a room (e.g. order tracking, project dashboard, live chat)
socket.emit('join_room', 'room_123');

// Listen for incoming messages & notifications
socket.on('new_message', (data) => console.log(data));
socket.on('notification', (alert) => console.log(alert));

// Send a real-time message
socket.emit('send_message', { room: 'room_123', message: 'Hello from frontend!' });
```

---

## 🌉 Exportable Frontend Axios & Socket SDK

A ready-to-copy frontend SDK is included in the `./client/` directory:
- `client/apiClient.js` — Axios instance with auto JWT interceptors, login, OTP, and file upload helpers.
- `client/socketClient.js` — Socket.IO client helper.
- `client/README.md` — 1-minute integration guide.

Simply copy `client/apiClient.js` into your Next.js / React / Vite project!
