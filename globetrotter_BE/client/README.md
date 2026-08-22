# 🚀 Frontend SDK Bridge for Hackathons

This folder contains pre-built frontend client modules that integrate directly with this backend.

### 📦 1. Installation in your Frontend Project (Next.js / React / Vite / Vue)

Run this in your frontend repository:

```bash
npm install axios socket.io-client
```

---

### 📂 2. Copy Client Files
Copy `apiClient.js` and `socketClient.js` into your frontend project (e.g. `src/lib/` or `src/services/`).

---

### 💻 3. Usage Examples

#### Authentication (Password & Email OTP)
```javascript
import { api } from './apiClient';

// 1. Password Login
const loginRes = await api.auth.login({
  email: 'admin@hackathon.com',
  password: 'adminpassword123',
});

// 2. Email OTP Flow
await api.auth.sendOtp({ email: 'user@example.com' });
const otpRes = await api.auth.verifyOtp({ email: 'user@example.com', otp: '123456' });

// 3. Get Logged-in User Profile
const me = await api.auth.getMe();
```

#### Media & File Upload
```javascript
// Upload single file (from <input type="file" />)
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  const response = await api.upload.single(file);
  console.log('Public File URL:', response.data.url);
};
```

#### Real-time WebSockets (Socket.IO)
```javascript
import { socketClient } from './socketClient';

// Connect to real-time server
socketClient.connect();

// Join live room / chat channel
socketClient.joinRoom('hackathon_project_1');

// Listen for incoming messages
socketClient.onMessage((data) => {
  console.log('Live message:', data);
});

// Listen for notifications
socketClient.onNotification((notification) => {
  alert(`New alert: ${notification.message}`);
});

// Send message
socketClient.sendMessage({
  room: 'hackathon_project_1',
  message: 'Hello teammates!',
  sender: 'Dhrumil',
});
```
