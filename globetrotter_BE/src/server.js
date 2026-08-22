import http from 'http';
import os from 'os';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { initSocket } from './services/socket.service.js';

const getNetworkAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
};

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const PORT = Number(env.PORT) || 5000;
  const HOST = env.HOST || '0.0.0.0';
  const server = http.createServer(app);

  // Initialize Real-time Socket.IO WebSocket Server
  initSocket(server);

  server.listen(PORT, HOST, () => {
    const networkIp = getNetworkAddress();
    logger.success(`🚀 Server running in ${env.NODE_ENV} mode`);
    logger.info(`  ➜  Local:   http://localhost:${PORT}/`);
    if (networkIp) {
      logger.info(`  ➜  Network: http://${networkIp}:${PORT}/`);
    }
    logger.info(`📌 Health check available at  http://${networkIp}:${PORT}/health`);
    logger.info(`📖 Swagger API Docs at http://localhost:${PORT}/docs`);
    logger.info(`📌 API endpoints mounted at http://localhost:${PORT}/api/v1`);
    logger.info(`⚡ Socket.IO Real-time server active on ws://${networkIp || 'localhost'}:${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
  });
};

startServer();
